import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { stripeService } from './stripe.service';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

if (!process.env.STRIPE_FREE_PLAN_PRICE_ID) {
  throw new Error('STRIPE_FREE_PLAN_PRICE_ID is not defined');
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Interface representing the standardized user response
 * @property id - Unique identifier of the user
 * @property email - User's email address
 * @property name - User's display name (optional)
 * @property stripeData - User's subscription information (optional)
 * @property stripeData.subscriptionStatus - Current status of the user's subscription
 * @property stripeData.planId - ID of the user's current subscription plan
 */
interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  stripeData?: {
    subscriptionStatus: string | null;
    planId: string | null;
  } | null;
}

class AuthService {
  /**
   * Creates a new user account with email/password authentication
   * @param email - User's email address
   * @param password - User's password (will be hashed)
   * @param name - Optional user's display name
   * @returns Promise containing user data and JWT token
   * @throws Error if user already exists or signup process fails
   * @description 
   * 1. Creates user account
   * 2. Creates Stripe customer
   * 3. Sets up free subscription plan
   * 4. Generates JWT token
   */
  async signup(email: string, password: string, name?: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user first
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          authMethod: 'EMAIL',
        },
        include: {
          stripeData: true,
        },
      });

      // FYI - Creating stripe customer and subscription for the user can be done in async manner
      // if we want to do it in parallel to avoid blocking the main thread or to avoid stripe api failures during signup.
      // Create Stripe customer
      const stripeCustomer = await stripeService.createCustomer(email, name);

      // Create Stripe subscription with Free plan
      const stripeSubscription = await stripeService.createSubscription(
        stripeCustomer.id,
        process.env.STRIPE_FREE_PLAN_PRICE_ID as string
      );

      // Create StripeCustomer record
      await prisma.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: stripeCustomer.id,
          subscriptionId: stripeSubscription.id,
          subscriptionStatus: stripeSubscription.status,
          planId: process.env.STRIPE_FREE_PLAN_PRICE_ID as string,
        },
      });

      // Fetch user again with stripe data
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          stripeData: true,
        },
      });

      if (!updatedUser) {
        throw new Error('Failed to create user');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: updatedUser.id, email: updatedUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      const userResponse: UserResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        stripeData: updatedUser.stripeData ? {
          subscriptionStatus: updatedUser.stripeData.subscriptionStatus,
          planId: updatedUser.stripeData.planId,
        } : null,
      };

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  /**
   * Authenticates user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise containing user data and JWT token
   * @throws Error if credentials are invalid
   * @description
   * 1. Verifies user exists
   * 2. Validates password
   * 3. Generates new JWT token
   * 4. Returns user data with subscription info
   */
  async login(email: string, password: string) {
    try {
      // Find user with stripe data
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          stripeData: true,
        },
      });

      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        stripeData: user.stripeData ? {
          subscriptionStatus: user.stripeData.subscriptionStatus,
          planId: user.stripeData.planId,
        } : null,
      };

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  /**
   * Authenticates user with Google OAuth token
   * @param googleToken - Google OAuth ID token
   * @returns Promise containing user data and JWT token
   * @throws Error if token is invalid or verification fails
   * @description
   * 1. Verifies Google token
   * 2. Creates user if not exists
   * 3. Creates Stripe customer and subscription for new users
   * 4. Generates JWT token
   * 5. Returns user data with subscription info
   */
  async googleLogin(googleToken: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload() as TokenPayload;
      if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
      }

      let user = await prisma.user.findUnique({
        where: { email: payload.email },
        include: {
          stripeData: true,
        },
      });

      if (!user) {
        // Create user first
        const newUser = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            password: '', // Empty password for Google users
            authMethod: 'GOOGLE',
          },
          include: {
            stripeData: true,
          },
        });

        // FYI - Creating stripe customer and subscription for the user can be done in async manner
        // if we want to do it in parallel to avoid blocking the main thread or to avoid stripe api failures during signup.
        // Create Stripe customer
        const stripeCustomer = await stripeService.createCustomer(
          payload.email,
          payload.name
        );

        // Create Stripe subscription with Free plan
        const stripeSubscription = await stripeService.createSubscription(
          stripeCustomer.id,
          process.env.STRIPE_FREE_PLAN_PRICE_ID as string
        );

        // Create StripeCustomer record
        await prisma.stripeCustomer.create({
          data: {
            userId: newUser.id,
            stripeCustomerId: stripeCustomer.id,
            subscriptionId: stripeSubscription.id,
            subscriptionStatus: stripeSubscription.status,
            planId: process.env.STRIPE_FREE_PLAN_PRICE_ID as string,
          },
        });

        // Fetch user again with stripe data
        user = await prisma.user.findUnique({
          where: { id: newUser.id },
          include: {
            stripeData: true,
          },
        });

        if (!user) {
          throw new Error('Failed to create user');
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        stripeData: user.stripeData ? {
          subscriptionStatus: user.stripeData.subscriptionStatus,
          planId: user.stripeData.planId,
        } : null,
      };

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      console.error('Error in Google login:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 