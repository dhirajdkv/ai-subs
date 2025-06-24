import prisma from '../utils/prisma';

/**
 * Service class for managing Unity projects and their usage statistics
 */
class ProjectService {
  /**
   * Retrieves all projects for a user with aggregated usage statistics
   * @param userId - The ID of the user
   * @returns Promise containing array of projects with usage statistics
   * @description
   * Returns projects with aggregated usage metrics including:
   * - Total credits used
   * - API calls count
   * - Content analysis usage
   * - Model training usage
   * @throws Error if database query fails
   */
  async getProjects(userId: string) {
    try {
      const projects = await prisma.project.findMany({
        where: { userId },
        include: {
          usage: {
            select: {
              credits: true,
              type: true,
            },
          },
        },
      });

      // Calculate statistics for each project
      const projectsWithStats = projects.map(project => {
        const usage = project.usage.reduce((stats, record) => {
          stats.credits += record.credits;
          
          // Count different types of usage
          switch (record.type) {
            case 'API_CALL':
              stats.apiCalls += record.credits;
              break;
            case 'CONTENT_ANALYSIS':
              stats.contentAnalysis += record.credits;
              break;
            case 'MODEL_TRAINING':
              stats.modelTraining += record.credits;
              break;
          }
          
          return stats;
        }, {
          credits: 0,
          apiCalls: 0,
          contentAnalysis: 0,
          modelTraining: 0,
        });

        return {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt,
          userId: project.userId,
          usage,
        };
      });

      return projectsWithStats;
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  }

  /**
   * Creates a new Unity project for a user
   * @param userId - The ID of the user who owns the project
   * @param name - The name of the project
   * @returns Promise containing the created project
   * @description Creates a new project record associated with the user
   * @throws Error if project creation fails
   */
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