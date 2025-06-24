import { Router } from 'express';
import { getProjectsHandler, createProjectHandler } from './projects.controller';

const router = Router();

router.get('/', getProjectsHandler);
router.post('/', createProjectHandler);

export default router; 