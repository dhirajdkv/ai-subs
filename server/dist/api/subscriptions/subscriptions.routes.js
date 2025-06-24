"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptions_controller_1 = require("./subscriptions.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/change', auth_middleware_1.authMiddleware, subscriptions_controller_1.changeSubscriptionHandler);
exports.default = router;
