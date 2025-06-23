import prisma from './prisma';

export async function setupDefaultPlans() {
  try {
    // Check if Free plan exists
    const freePlan = await prisma.plan.findUnique({
      where: { name: 'Free' },
    });

    // If Free plan doesn't exist, create it
    if (!freePlan) {
      await prisma.plan.create({
        data: {
          name: 'Free',
          price: 0,
          credits: 1000,
        },
      });
      console.log('Created Free plan');
    }

    // Add more plans here if needed
  } catch (error) {
    console.error('Error setting up default plans:', error);
  }
} 