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

// TODO: define proper types for user
type User = any;

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

  const handleSubscriptionChange = () => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        dispatch(setUser(userData));
      } catch (error) {
        console.error('Failed to fetch user data', error);
        dispatch(setToken(null));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Failed to load user data.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Hello, {user.name || user.email.split('@')[0]}!
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#2B2B2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Usage Overview</h2>
            <UsageChart />
          </div>
          <div className="bg-[#2B2B2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Subscription Plan</h2>
            <PlanSelector />
          </div>
        </div>
        <div className="bg-[#2B2B2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Unity Projects</h2>
          <ProjectList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 