import { RequestHandler } from 'express';
import { usageService } from '../../services/usage.service';

export const getUsageHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const usage = await usageService.getUserUsage(userId);
    res.status(200).json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 