import { useEffect, useState } from 'react';
import { getMe } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { setToken, setUser } from '../store/slices/authSlice';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import DashboardLayout from '../components/layout/DashboardLayout';
import UsageChart from '../components/UsageChart';
import ProjectList from '../components/ProjectList';
import PlanSelector from '../components/PlanSelector';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        dispatch(setUser(userData));
      } catch (error) {
        console.error('Failed to fetch user data', error);
        // If token is invalid, log out the user
        dispatch(setToken(null));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Failed to load user data.</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        {/* Greeting */}
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Hello, {user?.name || user?.email?.split('@')[0]}!
          </h1>
        </div>

        {/* Subscription Plans */}
        <div className="w-full bg-[#2B2B2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Subscription</h2>
          <PlanSelector />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Usage Overview */}
        <div className="w-full bg-[#2B2B2B] rounded-lg p-6">
          <UsageChart />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Projects List */}
        <div className="w-full bg-[#2B2B2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Unity Projects</h2>
          <ProjectList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 