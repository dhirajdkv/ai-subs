import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { selectUser } from '../../store/slices/authSlice';
import beziLogo from '../../assets/bezi-logo-light.svg';
import { logout } from '../../services/api';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowLogoutPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#2B2B2B] text-white flex flex-col">
        {/* Logo section */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/bezi-logo-light.svg" alt="Bezi" className="h-8 w-8" />
            <span className="text-xl font-semibold text-white">Bezi</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <Link
            to="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/') 
                ? 'bg-[#CEF23F] text-black' 
                : 'text-gray-300 hover:bg-[#3D3D3D]'
            }`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* User profile section - now fixed at bottom */}
        <div className="relative p-4 border-t border-gray-700">
          <button
            onClick={() => setShowLogoutPopup(!showLogoutPopup)}
            className="w-full"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-[#3D3D3D] flex items-center justify-center overflow-hidden">
                <img 
                  src={beziLogo} 
                  alt="Profile" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                {user?.name ? (
                  <>
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email || 'User'}
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Logout Popup */}
          {showLogoutPopup && (
            <div 
              ref={popupRef}
              className="absolute bottom-full left-4 mb-2 w-[calc(100%-2rem)] bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700 overflow-hidden"
            >
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#3D3D3D] transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content - with padding for sidebar */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 