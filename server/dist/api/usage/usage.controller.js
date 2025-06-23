"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageHandler = void 0;
const usage_service_1 = require("../../services/usage.service");
const getUsageHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const usage = await usage_service_1.usageService.getUserUsage(userId);
        res.status(200).json(usage);
    }
    catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUsageHandler = getUsageHandler;
