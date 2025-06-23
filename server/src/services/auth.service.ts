import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthMethod, SubscriptionStatus } from '../generated/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

class AuthService {
  async signup({ email, password, name, googleToken }: { email: string; password?: string; name?: string; googleToken?: string }) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Get the free plan
      const freePlan = await prisma.plan.findUnique({
        where: { name: 'Free' },
      });

      if (!freePlan) {
        throw new Error('Free plan not found. Please contact support.');
      }

      let userData: {
        email: string;
        name: string;
        password?: string;
        authMethod: AuthMethod;
      } = {
        email,
        name: name || email.split('@')[0],
        authMethod: AuthMethod.EMAIL,
      };

      // If using Google authentication
      if (googleToken) {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleToken,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error('Invalid Google token');
        }
        
        userData.name = payload.name || userData.name;
        userData.authMethod = AuthMethod.GOOGLE;
      } 
      // If using password authentication
      else if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        userData.password = hashedPassword;
      } else {
        throw new Error('Either password or Google token is required');
      }

      // Create user with subscription in a transaction
      const user = await prisma.$transaction(async (tx) => {
        // Create the user
        const newUser = await tx.user.create({
          data: userData,
        });

        // Create subscription
        await tx.subscription.create({
          data: {
            userId: newUser.id,
            planId: freePlan.id,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        });

        return newUser;
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return { token, user };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login({ email, password, googleToken }: { email: string; password?: string; googleToken?: string }) {
    try {
      let user = await prisma.user.findUnique({
        where: { email },
        include: {
          subscription: true,
        },
      });

      // If using Google authentication
      if (googleToken) {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleToken,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || payload.email !== email) {
          throw new Error('Invalid Google token');
        }

        // If user doesn't exist, create one
        if (!user) {
          return this.signup({ email, googleToken });
        }
      } 
      // If using password authentication
      else if (password) {
        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }
      } else {
        throw new Error('Either password or Google token is required');
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService(); 