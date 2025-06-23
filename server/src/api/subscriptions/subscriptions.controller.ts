import { RequestHandler } from 'express';
import { subscriptionService } from '../../services/subscription.service';

export const changeSubscriptionHandler: RequestHandler = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const subscription = await subscriptionService.changeSubscription(userId, planId);
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 