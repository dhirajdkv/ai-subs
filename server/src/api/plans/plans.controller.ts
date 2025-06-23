import { Request, Response } from 'express';
import * as planService from '../../services/plan.service';

export const getPlansHandler = async (req: Request, res: Response) => {
  try {
    const plans = await planService.getPlans();
    res.status(200).json(plans);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
}; 