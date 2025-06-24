import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}
/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes from unauthorized access.
 * It checks for the presence of an authentication token and redirects
 * to the login page if no token is found.
 * 
 * Props:
 * - children: React.ReactNode - The child components/routes to be protected
 * 
 * Usage:
 * <ProtectedRoute>
 *   <SensitiveComponent />
 * </ProtectedRoute>
 */

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useSelector(selectToken);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 