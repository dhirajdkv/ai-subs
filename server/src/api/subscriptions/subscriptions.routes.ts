import { Router } from 'express';
import { changeSubscriptionHandler } from './subscriptions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/change', authMiddleware, changeSubscriptionHandler);

export default router; 