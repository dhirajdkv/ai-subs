import prisma from '../utils/prisma';
import { User } from '../generated/prisma';

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      projects: true,
    },
  });
}; 