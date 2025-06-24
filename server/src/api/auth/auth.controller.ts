import { Request, Response } from 'express';
import { authService } from '../../services/auth.service';

// Signs up a new user.
export const signupHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await authService.signup(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in signup handler:', error);
    if ((error as Error).message === 'User already exists') {
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logs in a user.
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Error in login handler:', error);
    if ((error as Error).message === 'Invalid credentials') {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logs in a user with Google.
export const googleLoginHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Google token is required' });
      return;
    }

    const result = await authService.googleLogin(token);
    res.json(result);
  } catch (error) {
    console.error('Error in Google login handler:', error);
    if ((error as Error).message === 'Invalid Google token') {
      res.status(401).json({ message: 'Invalid Google token' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}; 