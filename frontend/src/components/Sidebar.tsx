import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard', badge: 0 },
    { label: 'Schools', icon: '🏫', path: '/schools', badge: 5 },
    { label: 'Students', icon: '👨‍🎓', path: '/students', badge: 250 },
    { label: 'Classes', icon: '📚', path: '/classes', badge: 15 },
    { label: 'Subjects', icon: '📖', path: '/subjects', badge: 12 },
    { label: 'Grades', icon: '📈', path: '/grades', badge: 0 },
    { label: 'Financials', icon: '💰', path: '/financials', badge: 8 },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {isOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-lg font-bold">Friasoft</span>
            </div>
          )}
          {!isOpen && <span className="text-2xl">🎓</span>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:block p-1 hover:bg-gray-700 rounded"
          >
            {isOpen ? '◄' : '►'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 border-l-4 border-blue-400'
                  : 'hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors text-sm"
          >
            <span className="text-xl">🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Content offset */}
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Placeholder for main content - parent will handle this */}
      </div>
    </>
  );
};

export default Sidebar;
