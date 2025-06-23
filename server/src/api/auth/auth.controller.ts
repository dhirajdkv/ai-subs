import { Request, Response } from 'express';
import { authService } from '../../services/auth.service';

export const signupHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, name, googleToken } = req.body;
    const { token, user } = await authService.signup({
      email,
      password,
      name,
      googleToken,
    });
    
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, googleToken } = req.body;
    const { token, user } = await authService.login({ 
      email, 
      password,
      googleToken,
    });

    res.status(200).json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message });
  }
}; 