import prisma from '../utils/prisma';
import { SubscriptionStatus, User, Subscription, Plan } from '../generated/prisma';

type UserWithSubscription = User & {
  subscription: (Subscription & { plan: Plan }) | null;
};

export const getUsageData = async (userId: string) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    }) as UserWithSubscription;

    if (!user) {
      throw new Error('User not found');
    }

    // If user doesn't have a subscription, create one with the free plan
    if (!user.subscription) {
      const freePlan = await prisma.plan.findUnique({
        where: { name: 'Free' },
      });

      if (!freePlan) {
        throw new Error('Free plan not found. Please contact support.');
      }

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
        },
      });

      // Fetch user again with the new subscription
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      }) as UserWithSubscription;

      if (!updatedUser || !updatedUser.subscription) {
        throw new Error('Failed to create subscription');
      }

      user = updatedUser;
    }

    // At this point, we know user.subscription exists because we either found it or created it
    const subscription = user.subscription as (Subscription & { plan: Plan });
    const creditsInPlan = subscription.plan.credits;
    const subscriptionStartDate = subscription.startDate;

    const usage = await prisma.usage.aggregate({
      where: {
        userId,
        date: {
          gte: subscriptionStartDate,
        },
      },
      _sum: {
        credits: true,
      },
    });

    const creditsUsed = usage._sum.credits || 0;
    const creditsRemaining = creditsInPlan - creditsUsed;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageLast7Days = await prisma.usage.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        credits: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const usageLast30Days = await prisma.usage.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        credits: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return {
      creditsUsed,
      creditsRemaining,
      usageLast7Days,
      usageLast30Days,
    };
  } catch (error) {
    console.error('Error in getUsageData:', error);
    throw error;
  }
};

class UsageService {
  async getUserUsage(userId: string) {
    return getUsageData(userId);
  }

  async getDetailedUsage(userId: string) {
    return await prisma.usage.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { project: true }
    });
  }
}

export const usageService = new UsageService(); 