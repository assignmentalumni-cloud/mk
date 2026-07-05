import { useEffect } from 'react';
import { CheckCircle, X, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  variant?: 'success' | 'error';
}

export function Notification({ message, isVisible, onClose, variant = 'success' }: NotificationProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, variant === 'error' ? 1800 : 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, variant]);

  if (!isVisible) return null;

  const isError = variant === 'error';

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-in max-w-sm">
      {isError ? (
        <div
          className="relative p-4 pr-10 rounded-xl flex items-center gap-3 shadow-2xl border-2"
          style={{
            background: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)',
            borderColor: '#DC2626',
            boxShadow: '0 0 24px rgba(220,38,38,0.35), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="p-2 rounded-full flex-shrink-0"
            style={{ background: 'rgba(220,38,38,0.2)' }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <p className="font-semibold text-sm" style={{ color: '#EF4444' }}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-red-500/10"
          >
            <X className="w-4 h-4" style={{ color: '#EF4444' }} />
          </button>
        </div>
      ) : (
        <div
          className={`relative ${
            isDark ? 'glass-dark bg-neon-pink/10' : 'glass-light bg-green-50'
          } p-4 pr-10 rounded-xl flex items-center gap-3 shadow-xl`}
        >
          <div className={`p-2 rounded-full flex-shrink-0 ${isDark ? 'bg-neon-pink/20' : 'bg-green-100'}`}>
            <CheckCircle className={`w-5 h-5 ${isDark ? 'text-neon-pink' : 'text-green-600'}`} />
          </div>
          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
      )}
    </div>
  );
}
