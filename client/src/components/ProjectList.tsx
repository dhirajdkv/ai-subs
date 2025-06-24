import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import card1 from '../assets/card1.png';
import card3 from '../assets/card3.png';
import card4 from '../assets/card4.jpg';
import { getProjects } from '../services/api';

/**
 * Interface representing a Unity project with its usage statistics
 * @property id - Unique identifier of the project
 * @property name - Name of the Unity project
 * @property createdAt - Project creation timestamp
 * @property userId - Owner of the project
 * @property usage - Aggregated usage statistics
 */
interface Project {
  id: string;
  name: string;
  createdAt: string;
  userId: string;
  usage: {
    credits: number;
    apiCalls: number;
    contentAnalysis: number;
    modelTraining: number;
  };
}

// Array of card background images that will be cycled through for project cards
const cardImages = [card1, card3, card4];

/**
 * ProjectList Component
 * 
 * Displays a grid of Unity projects with their usage statistics.
 * Each project card shows:
 * - Project name with a background image
 * - API calls count
 * - Content analysis usage
 * - Model training metrics
 * 
 * The component handles loading states and error conditions,
 * and uses a responsive grid layout for different screen sizes.
 */
const ProjectList = () => {
  // State for projects data and loading status
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector(selectUser);

  // Fetch projects data when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getProjects();
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Loading state UI
  if (loading) {
    return <div className="text-gray-400">Loading projects...</div>;
  }

  // Error state UI
  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  // Empty state UI
  if (!projects.length) {
    return <div className="text-gray-400">No projects found. Create your first Unity project to get started!</div>;
  }

  // Render grid of project cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="bg-[#1C1C1C] rounded-lg overflow-hidden"
        >
          {/* Project card header with background image and name */}
          <div className="relative h-48">
            <img 
              src={cardImages[index % cardImages.length]} 
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <h3 className="absolute bottom-4 left-4 text-white font-medium text-lg">
              {project.name}
            </h3>
          </div>

          {/* Project usage statistics grid */}
          <div className="p-6 grid grid-cols-3 gap-4">
            {/* API Calls metric */}
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.usage?.apiCalls || 0}
              </p>
              <p className="text-sm text-gray-400">
                API Calls
              </p>
            </div>
            {/* Content Analysis metric */}
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.usage?.contentAnalysis || 0}
              </p>
              <p className="text-sm text-gray-400">
                Content Analysis
              </p>
            </div>
            {/* Model Training metric */}
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.usage?.modelTraining || 0}
              </p>
              <p className="text-sm text-gray-400">
                Model Training
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 