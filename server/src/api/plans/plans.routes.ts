import { Router } from 'express';
import { getPlansHandler } from './plans.controller';

const router = Router();

router.get('/', getPlansHandler);

export default router; 