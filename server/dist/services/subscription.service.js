"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class SubscriptionService {
    async changeSubscription(userId, planId) {
        return await prisma_1.default.subscription.update({
            where: { userId },
            data: { planId },
            include: { plan: true }
        });
    }
    async getCurrentSubscription(userId) {
        return await prisma_1.default.subscription.findUnique({
            where: { userId },
            include: { plan: true }
        });
    }
}
exports.subscriptionService = new SubscriptionService();
