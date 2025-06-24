import prisma from '../utils/prisma';

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

/**
 * Retrieves a user by their ID with subscription information
 * @param id - The unique identifier of the user
 * @returns Promise<UserResponse | null> - User data with subscription info or null if not found
 * @description Fetches user data and their Stripe subscription status, returning a standardized response
 */
export const getUserById = async (id: string): Promise<UserResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      stripeData: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    stripeData: user.stripeData ? {
      subscriptionStatus: user.stripeData.subscriptionStatus,
      planId: user.stripeData.planId,
    } : null,
  };
}; 