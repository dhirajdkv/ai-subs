import prisma from '../utils/prisma';
import { Plan } from '../generated/prisma';

const plansData = [
  { name: 'Free', price: 0, credits: 10 },
  { name: 'Pro', price: 20, credits: 100 },
  { name: 'Business', price: 50, credits: 500 },
];

export const createInitialPlans = async (): Promise<void> => {
  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }
};

export const getPlans = async (): Promise<Plan[]> => {
  return prisma.plan.findMany();
}; 