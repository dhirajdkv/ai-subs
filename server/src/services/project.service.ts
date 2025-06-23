import prisma from '../utils/prisma';

class ProjectService {
  async getProjects(userId: string) {
    try {
      const projects = await prisma.project.findMany({
        where: { userId },
        include: {
          usage: {
            select: {
              credits: true,
            },
          },
        },
      });

      // Calculate statistics for each project
      const projectsWithStats = projects.map(project => {
        const totalCredits = project.usage.reduce((sum, usage) => sum + usage.credits, 0);
        return {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt,
          answersReceived: Math.floor(Math.random() * 100), // TODO: Replace with actual data
          contentsAnalyzed: (Math.random() * 10).toFixed(1), // TODO: Replace with actual data in GB
          totalCredits,
        };
      });

      return projectsWithStats;
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  }

  async createProject(userId: string, name: string) {
    return prisma.project.create({
      data: {
        name,
        userId,
      },
    });
  }
}

export const projectService = new ProjectService(); 