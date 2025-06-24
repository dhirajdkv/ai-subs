import { RequestHandler } from 'express';
import { projectService } from '../../services/project.service';

// Gets the unity projects for the user.
export const getProjectsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const projects = await projectService.getProjects(userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Creates a new project for the user.
export const createProjectHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ message: 'Project name is required' });
      return;
    }

    const project = await projectService.createProject(userId, name);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 