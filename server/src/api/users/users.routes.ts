import { Router } from 'express';
import { getMeHandler } from './users.controller';

const router = Router();

router.get('/me', getMeHandler);

export default router; 