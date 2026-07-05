import { useEffect, useState } from 'react';
import { Shield, Timer, Lock, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WorkspaceLockoutProps {
  maxAllowed: number;
  oldestSubmissionTime: string | null;
}

function formatTimeRemaining(oldestTime: string): string {
  const now = new Date();
  const oldest = new Date(oldestTime);
  const resetTime = new Date(oldest.getTime() + 24 * 60 * 60 * 1000);
  const diffMs = resetTime.getTime() - now.getTime();

  if (diffMs <= 0) return '0h 0m';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

export function WorkspaceLockout({ maxAllowed, oldestSubmissionTime }: WorkspaceLockoutProps) {
  const { isDark } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(
    oldestSubmissionTime ? formatTimeRemaining(oldestSubmissionTime) : '0h 0m'
  );

  useEffect(() => {
    if (!oldestSubmissionTime) return;

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(oldestSubmissionTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [oldestSubmissionTime]);

  const glass = isDark ? 'glass-dark' : 'glass-light';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-16 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${glass} p-8 text-center`}>
          {/* Security icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className={`absolute inset-0 rounded-full blur-xl ${isDark ? 'bg-red-500/20' : 'bg-red-500/10'}`} />
            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
            }`}>
              <Lock className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            </div>
          </div>

          {/* Warning header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              24-Hour Task Limit Reached
            </h2>
          </div>

          {/* Description */}
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your security tier allows a maximum of{' '}
            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {maxAllowed} daily submission{maxAllowed > 1 ? 's' : ''}
            </span>
            . Your next assignment slot resets automatically in:
          </p>

          {/* Countdown timer */}
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'
          }`}>
            <Timer className={`w-6 h-6 ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`} />
            <span className={`text-2xl font-mono font-bold tabular-nums ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {timeRemaining}
            </span>
          </div>

          {/* Security badge */}
          <div className={`mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
          }`}>
            <Shield className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Anti-Cheat Protection Active
            </span>
          </div>

          {/* Info text */}
          <p className={`mt-6 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            This restriction is enforced server-side and cannot be bypassed.
            <br />
            The 24-hour window is calculated from your oldest active submission.
          </p>
        </div>
      </div>
    </div>
  );
}
