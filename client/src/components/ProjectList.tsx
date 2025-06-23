import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import card1 from '../assets/card1.png';
import card3 from '../assets/card3.png';
import card4 from '../assets/card4.jpg';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  answersReceived: number;
  contentsAnalyzed: number;
  totalCredits: number;
}

const cardImages = [card1, card3, card4];

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);

  useEffect(() => {
    // TODO: Replace with actual API call
    setLoading(false);
    setProjects([
      {
        id: '1',
        name: 'Unity RPG Game',
        createdAt: new Date().toISOString(),
        answersReceived: 0,
        contentsAnalyzed: 0,
        totalCredits: 0
      },
      {
        id: '2',
        name: 'Unity FPS Game',
        createdAt: new Date().toISOString(),
        answersReceived: 1,
        contentsAnalyzed: 0,
        totalCredits: 150
      },
      {
        id: '3',
        name: 'Unity Mobile Game',
        createdAt: new Date().toISOString(),
        answersReceived: 0,
        contentsAnalyzed: 0,
        totalCredits: 0
      }
    ]);
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading projects...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="bg-[#1C1C1C] rounded-lg overflow-hidden"
        >
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
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.answersReceived}
              </p>
              <p className="text-sm text-gray-400">
                Answers received
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.totalCredits > 0 ? '1' : '0'}
              </p>
              <p className="text-sm text-gray-400">
                Projects connected
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {project.contentsAnalyzed}
              </p>
              <p className="text-sm text-gray-400">
                Contents analyzed (GB)
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 