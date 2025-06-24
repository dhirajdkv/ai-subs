import { Request, Response } from 'express';
import { stripeService } from '../../services/stripe.service';
import prisma from '../../utils/prisma';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

// This is used to create a checkout session for the user to pay for the subscription.
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user's Stripe customer data
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!stripeCustomer) {
      res.status(404).json({ message: 'Stripe customer not found' });
      return;
    }

    // Handle switching to free plan
    if (priceId === process.env.STRIPE_FREE_PLAN_PRICE_ID) {
      const { subscriptionId, subscriptionStatus, planId } = await stripeService.switchToFreePlan(
        stripeCustomer.stripeCustomerId,
        stripeCustomer.subscriptionId || undefined
      );

      // Update StripeCustomer record
      await prisma.stripeCustomer.update({
        where: { userId },
        data: {
          subscriptionId,
          subscriptionStatus,
          planId,
        },
      });

      // Get updated user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          stripeData: true,
        },
      });

      res.json({ success: true, user });
      return;
    }

    // If there's an active subscription, cancel it first
    if (stripeCustomer.subscriptionId && stripeCustomer.subscriptionStatus === 'active') {
      try {
        await stripeService.cancelSubscription(stripeCustomer.subscriptionId);
      } catch (error) {
        console.error('Error canceling existing subscription:', error);
        // Continue with new subscription even if cancellation fails
      }
    }

    // Create checkout session for paid plans
    const session = await stripeService.createCheckoutSession(
      stripeCustomer.stripeCustomerId,
      priceId
    );

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// Handles the webhook from Stripe.
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ message: 'Missing signature or webhook secret' });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { subscriptionId, subscriptionStatus, planId } = 
          await stripeService.handleCheckoutSessionCompleted(session);

        // Update StripeCustomer record
        await prisma.stripeCustomer.update({
          where: { stripeCustomerId: session.customer as string },
          data: {
            subscriptionId,
            subscriptionStatus,
            planId,
          },
        });

        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

// Cancels the subscription.
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user's Stripe customer data
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!stripeCustomer) {
      res.status(404).json({ message: 'Stripe customer not found' });
      return;
    }

    // Switch to free plan (which includes canceling any active subscription) - this is more like a fallback.
    const { subscriptionId, subscriptionStatus, planId } = await stripeService.switchToFreePlan(
      stripeCustomer.stripeCustomerId,
      stripeCustomer.subscriptionId || undefined
    );

    // Update StripeCustomer record
    await prisma.stripeCustomer.update({
      where: { userId },
      data: {
        subscriptionId,
        subscriptionStatus,
        planId,
      },
    });

    // Get updated user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stripeData: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

// This is used to get the checkout session details so we can update the subscription in our UI/database immediately.
export const getCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // If payment succeeded, update the subscription in our database
    if (session.payment_status === 'paid' && session.subscription) {
      const subscription = session.subscription as Stripe.Subscription;
      
      // Update StripeCustomer record
      await prisma.stripeCustomer.update({
        where: { stripeCustomerId: session.customer as string },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          planId: subscription.items.data[0].price.id,
        },
      });

      // Get updated user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          stripeData: true,
        },
      });

      res.json({ success: true, user });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ message: 'Failed to retrieve checkout session' });
  }
};

// This is used to create a portal session so we can redirect the user to the Stripe Customer Portal.
// This is used to view the billing history, manage the subscription, etc.
export const createPortalSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user's Stripe customer data
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!stripeCustomer) {
      res.status(404).json({ message: 'Stripe customer not found' });
      return;
    }

    // Create portal session
    const session = await stripeService.createCustomerPortalSession(
      stripeCustomer.stripeCustomerId
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: 'Failed to create portal session' });
  }
}; 