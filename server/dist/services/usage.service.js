"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageService = exports.getUsageData = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getUsageData = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            subscription: {
                include: {
                    plan: true,
                },
            },
        },
    });
    if (!user || !user.subscription) {
        throw new Error('User or subscription not found');
    }
    const creditsInPlan = user.subscription.plan.credits;
    const subscriptionStartDate = user.subscription.startDate;
    const usage = await prisma_1.default.usage.aggregate({
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
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 23)); // 7 + 23 = 30
    const usageLast7Days = await prisma_1.default.usage.groupBy({
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
    const usageLast30Days = await prisma_1.default.usage.groupBy({
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
};
exports.getUsageData = getUsageData;
class UsageService {
    async getUserUsage(userId) {
        return await prisma_1.default.usage.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { project: true }
        });
    }
}
exports.usageService = new UsageService();
