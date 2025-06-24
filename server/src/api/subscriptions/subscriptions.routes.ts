import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getCheckoutSession,
  createPortalSession,
} from './subscriptions.controller';
import { json, raw } from 'express';

const router = Router();

// This endpoint needs raw body for Stripe webhook signature verification
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    await handleWebhook(req, res);
  }
);

// Protected routes
router.use(authMiddleware);
router.post(
  '/checkout',
  json(),
  async (req: Request, res: Response) => {
    await createCheckoutSession(req, res);
  }
);
router.post(
  '/cancel',
  json(),
  async (req: Request, res: Response) => {
    await cancelSubscription(req, res);
  }
);
router.get(
  '/session/:sessionId',
  async (req: Request, res: Response) => {
    await getCheckoutSession(req, res);
  }
);
router.post(
  '/portal',
  async (req: Request, res: Response) => {
    await createPortalSession(req, res);
  }
);

export default router; 