import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../generated/prisma';

// By using 'declare global', we are adding our custom 'user' property 
// to the global Express.Request interface. This makes it available
// application-wide in a type-safe way.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2025';

interface JwtPayload {
  userId: string;
  email: string;
  name: string | null;
}

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Add user to request object
      (req as AuthRequest).user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      } as User;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
    return;
  }
};
