import { RequestHandler } from 'express';
import * as userService from '../../services/user.service';

export const getMeHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 