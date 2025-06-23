import { Router } from 'express';
import { getUsageHandler } from './usage.controller';

const router = Router();

router.get('/', getUsageHandler);

export default router; 