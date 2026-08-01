import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Power, User, Shield, Mail, Home, BookOpen, Users, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { CrescentMoon } from './CrescentMoon';

const SUPPORT_EMAIL = 'Assignmentalumni@gmail.com';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/workspace', label: 'Working', icon: BookOpen },
  { path: '/referral', label: 'Referral', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, viewMode, logout, setViewMode, isAdmin } = useGlobalState();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  if (isAuthPage) {
    return <Outlet />;
  }

  const firstName = currentUser?.fullName?.split(' ')[0] || 'Scholar';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewSwitch = (mode: 'user' | 'admin') => {
    setViewMode(mode);
    navigate(mode === 'admin' ? '/admin' : '/home');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <CrescentMoon />
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-cosmic-midnight/80 backdrop-blur-xl border-b border-white/10' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/home" className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center`}>
                  <span className={`text-lg font-bold text-neon-pink`}>A</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-lg">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>assignment</span>
                  <span className="text-neon-pink">.alumni</span>
                </div>
              </a>

              {/* Desktop tab nav */}
              <div className={`hidden md:flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? isDark
                            ? 'bg-neon-pink/20 text-neon-pink'
                            : 'bg-neon-pink/10 text-neon-pink'
                          : isDark
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {isAdmin && <div className={`hidden lg:flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                <button
                  onClick={() => handleViewSwitch('user')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'user'
                      ? isDark
                        ? 'bg-neon-pink/20 text-neon-pink'
                        : 'bg-neon-pink/10 text-neon-pink'
                      : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  View As User
                </button>
                <button
                  onClick={() => handleViewSwitch('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'admin'
                      ? isDark
                        ? 'bg-neon-pink/20 text-neon-pink'
                        : 'bg-neon-pink/10 text-neon-pink'
                      : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  View As Admin
                </button>
              </div>}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=AssignmentAlumni Support Request`}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Support: {SUPPORT_EMAIL}</span>
              </a>

              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center`}>
                  <span className={`text-xs font-bold text-neon-pink`}>{firstName.charAt(0)}</span>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {firstName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 group ${
                    isDark
                      ? 'bg-white/5 border border-pink-500/30 text-pink-500 hover:bg-pink-500/10'
                      : 'bg-gray-100 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  }`}
                  aria-label="Exit Network"
                >
                  <Power className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110`} />
                  <span className="text-xs font-medium hidden sm:inline">Exit Network</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile admin toggle */}
          {isAdmin && <div className={`sm:hidden flex items-center justify-center mt-3 p-1 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
            <button
              onClick={() => handleViewSwitch('user')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'user'
                  ? isDark
                    ? 'bg-neon-pink/20 text-neon-pink'
                    : 'bg-neon-pink/10 text-neon-pink'
                  : isDark
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              User View
            </button>
            <button
              onClick={() => handleViewSwitch('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'admin'
                  ? isDark
                    ? 'bg-neon-pink/20 text-neon-pink'
                    : 'bg-neon-pink/10 text-neon-pink'
                  : isDark
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin View
            </button>
          </div>}
        </div>
      </nav>

      <Outlet />

      {/* Mobile bottom navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${isDark ? 'bg-cosmic-midnight/95 backdrop-blur-xl border-t border-white/10' : 'bg-white/95 backdrop-blur-xl border-t border-gray-200'}`}>
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 py-3 transition-all ${
                  active
                    ? 'text-neon-pink'
                    : isDark
                    ? 'text-gray-500'
                    : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-neon-pink" />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
