"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeSubscriptionHandler = void 0;
const subscription_service_1 = require("../../services/subscription.service");
const changeSubscriptionHandler = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const subscription = await subscription_service_1.subscriptionService.changeSubscription(userId, planId);
        res.status(200).json(subscription);
    }
    catch (error) {
        console.error('Error changing subscription:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.changeSubscriptionHandler = changeSubscriptionHandler;
