import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Home, RefreshCw, LogOut, User } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">VRN INC.</h1>
              <p className="text-xs text-primary-200">Sales CRM</p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg px-3 py-2 ml-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-primary-200">
                  {ROLE_LABELS[user?.role]} {user?.display_code && `• ${user.display_code}`}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-white ml-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;