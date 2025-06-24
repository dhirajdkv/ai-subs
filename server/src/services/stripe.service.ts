import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

class StripeService {
  /**
   * Creates a new customer in Stripe
   * @param email - Customer's email address
   * @param name - Optional customer name
   * @returns Promise<Stripe.Customer> - The created Stripe customer object
   */
  async createCustomer(email: string, name?: string) {
    return stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Creates a new subscription for a customer
   * @param customerId - Stripe customer ID
   * @param priceId - Stripe price ID for the subscription plan
   * @returns Promise<Stripe.Subscription> - The created subscription object
   * @description Creates a subscription with default incomplete payment behavior and saves payment method for future use
   */
  async createSubscription(customerId: string, priceId: string) {
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Creates a Stripe Checkout session for subscription payment
   * @param customerId - Stripe customer ID
   * @param priceId - Stripe price ID for the subscription plan
   * @returns Promise<Stripe.Checkout.Session> - The created checkout session
   * @throws Error if attempting to create a checkout session for the free plan
   * @description Sets up a checkout session with card payment, subscription mode, and success/cancel URLs
   */
  async createCheckoutSession(customerId: string, priceId: string) {
    // If it's the free plan, don't create a checkout session
    if (priceId === process.env.STRIPE_FREE_PLAN_PRICE_ID) {
      throw new Error('Cannot create checkout session for free plan');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/`,
    });

    return session;
  }

  /**
   * Updates an existing subscription to a new plan
   * @param subscriptionId - Stripe subscription ID
   * @param priceId - New Stripe price ID to switch to
   * @returns Promise<Stripe.Subscription> - The updated subscription object
   * @description Updates subscription with proration and creates prorated charges/credits
   */
  async updateSubscription(subscriptionId: string, priceId: string) {
    return stripe.subscriptions.update(subscriptionId, {
      items: [{ price: priceId }],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Cancels an active subscription
   * @param subscriptionId - Stripe subscription ID
   * @returns Promise<Stripe.Subscription> - The cancelled subscription object
   */
  async cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Switches a customer to the free plan
   * @param stripeCustomerId - Stripe customer ID
   * @param currentSubscriptionId - Optional current subscription ID to cancel
   * @returns Promise<{subscriptionId: null, subscriptionStatus: 'free', planId: string}> - Free plan details
   * @description Cancels any existing subscription and returns free plan configuration
   */
  async switchToFreePlan(stripeCustomerId: string, currentSubscriptionId?: string) {
    try {
      // If there's an active subscription, cancel it
      if (currentSubscriptionId) {
        await this.cancelSubscription(currentSubscriptionId);
      }

      // Return the free plan details
      return {
        subscriptionId: null,
        subscriptionStatus: 'free',
        planId: process.env.STRIPE_FREE_PLAN_PRICE_ID,
      };
    } catch (error) {
      console.error('Error switching to free plan:', error);
      throw error;
    }
  }

  /**
   * Retrieves subscription details from Stripe
   * @param subscriptionId - Stripe subscription ID
   * @returns Promise<Stripe.Subscription> - The subscription object
   * @throws Error if subscription retrieval fails
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Handles the completion of a checkout session
   * @param session - Completed Stripe checkout session
   * @returns Promise<{subscriptionId: string, subscriptionStatus: string, planId: string}> - Subscription details
   * @throws Error if customer or subscription is missing from session
   * @description Processes a completed checkout session and returns subscription information
   */
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (!session.customer || !session.subscription) {
      throw new Error('Missing customer or subscription in session');
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    return {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planId: subscription.items.data[0].price.id,
    };
  }

  /**
   * Creates a Stripe Customer Portal session
   * @param customerId - Stripe customer ID
   * @returns Promise<Stripe.BillingPortal.Session> - The created portal session
   * @throws Error if session creation fails
   * @description Creates a portal session for customers to manage their subscription and billing
   */
  async createCustomerPortalSession(customerId: string) {
    try {
      // Create a billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.CLIENT_URL}/`,
      });

      return session;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService(); 