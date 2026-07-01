import { useState } from 'react';
import { Search, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchModal } from './SearchModal';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-surface-dark border-b border-[#2A2A2A] h-[60px] sticky top-0 z-50 flex items-center px-6">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link 
            to="/" 
            className={`flex items-center gap-4 transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-text-onDark hover:text-primary'}`}
          >
            <span className="font-sans font-bold text-xl tracking-wider">
              [ ASF ]
            </span>
            <span className="text-text-muted text-sm hidden sm:block">
              AI Security Framework
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user && (
              <>
                <button 
                  className="text-text-muted hover:text-primary transition-colors p-2"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                >
                  <Search size={20} />
                </button>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard') ? 'text-primary border-b-2 border-primary h-[60px]' : 'text-text-onDark hover:text-primary h-[60px] flex items-center'}`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-text-muted hover:text-status-notImplemented transition-colors p-2 ml-4 flex items-center gap-2 text-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
