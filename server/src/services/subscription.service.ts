import prisma from '../utils/prisma';

class SubscriptionService {
  async changeSubscription(userId: string, planId: string) {
    return await prisma.subscription.update({
      where: { userId },
      data: { planId },
      include: { plan: true }
    });
  }

  async getCurrentSubscription(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true }
    });
  }
}

export const subscriptionService = new SubscriptionService(); 