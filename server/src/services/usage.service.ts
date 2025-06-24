import prisma from '../utils/prisma';
import { Prisma } from '../generated/prisma';

/**
 * Retrieves comprehensive usage data for a user
 * @param userId - The ID of the user
 * @returns Object containing usage statistics including:
 *  - Total credits used
 *  - Usage for last 7 days
 *  - Usage for last 30 days
 *  - Usage breakdown by type
 *  - Subscription information
 * @throws Error if user is not found or database query fails
 */
export const getUsageData = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stripeData: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        usage: true,
      },
    });

    // Calculate total credits used across all projects
    const creditsUsed = projects.reduce((total, project) => {
      return total + project.usage.reduce((sum, usage) => sum + usage.credits, 0);
    }, 0);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get usage data for all projects in the last 7 days
    const usageLast7Days = await prisma.$queryRaw`
      SELECT 
        DATE(u."createdAt") as date,
        SUM(u.credits) as credits
      FROM "Usage" u
      INNER JOIN "Project" p ON u."projectId" = p.id
      WHERE p."userId" = ${userId}
        AND u."createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE(u."createdAt")
      ORDER BY date ASC
    `;

    // Get usage data for all projects in the last 30 days
    const usageLast30Days = await prisma.$queryRaw`
      SELECT 
        DATE(u."createdAt") as date,
        SUM(u.credits) as credits
      FROM "Usage" u
      INNER JOIN "Project" p ON u."projectId" = p.id
      WHERE p."userId" = ${userId}
        AND u."createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE(u."createdAt")
      ORDER BY date ASC
    `;

    // Get usage breakdown by type
    const usageByType = await prisma.usage.groupBy({
      by: ['type'],
      where: {
        project: {
          userId,
        },
      },
      _sum: {
        credits: true,
      },
    });

    // Transform the raw query results to match the expected format
    const transformUsageData = (data: any[]) => data.map(item => ({
      _sum: { credits: Number(item.credits) },
      createdAt: item.date.toISOString(),
    }));

    return {
      creditsUsed,
      usageLast7Days: transformUsageData(usageLast7Days as any[]),
      usageLast30Days: transformUsageData(usageLast30Days as any[]),
      usageByType,
      subscription: user.stripeData ? {
        status: user.stripeData.subscriptionStatus,
        planId: user.stripeData.planId,
      } : null,
    };
  } catch (error) {
    console.error('Error in getUsageData:', error);
    throw error;
  }
};

class UsageService {
  /**
   * Gets aggregated usage data for a user
   * @param userId - The ID of the user
   * @returns Promise containing usage statistics and subscription information
   * @description Wrapper around getUsageData function that provides aggregated usage metrics
   */
  async getUserUsage(userId: string) {
    return getUsageData(userId);
  }

  /**
   * Retrieves detailed usage records for a user
   * @param userId - The ID of the user
   * @returns Promise containing array of usage records with associated project information
   * @description Gets all usage records for all projects owned by the user, ordered by creation date
   */
  async getDetailedUsage(userId: string) {
    return await prisma.usage.findMany({
      where: {
        project: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { project: true }
    });
  }

  /**
   * Records a new usage entry for a project
   * @param projectId - The ID of the project
   * @param credits - Number of credits used
   * @param type - Type of usage (e.g., 'API_CALL', 'CONTENT_ANALYSIS', 'MODEL_TRAINING')
   * @param metadata - Optional additional data about the usage
   * @returns Promise containing the created usage record
   * @description Creates a new usage record with specified credits and type for a project
   */
  async recordUsage(projectId: string, credits: number, type: string, metadata?: any) {
    return await prisma.usage.create({
      data: {
        projectId,
        credits,
        type,
        metadata: metadata || {},
      },
    });
  }
}

export const usageService = new UsageService(); 