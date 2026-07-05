import { CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DailyLedgerCompleteProps {
  payout: number;
  assignmentCount?: number;
}

export function DailyLedgerComplete({ payout, assignmentCount = 1 }: DailyLedgerCompleteProps) {
  const { isDark } = useTheme();
  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  return (
    <div className={`${glassClass} p-8 text-center relative overflow-hidden`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-64 h-64 rounded-full ${isDark ? 'bg-neon-pink/5' : 'bg-neon-pink/5'} blur-3xl`} />
      </div>

      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-100'} flex items-center justify-center relative`}>
            <CheckCircle2 className={`w-12 h-12 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className={`w-5 h-5 text-neon-pink`} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Daily Ledger Complete
          </h2>
          <Sparkles className={`w-5 h-5 text-neon-pink`} />
        </div>

        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your assignment has been verified and credited
        </p>

        <div className={`inline-block p-6 rounded-2xl ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'} mb-6`}>
          <p className={`text-sm mb-1 ${isDark ? 'text-green-400/80' : 'text-green-600'}`}>
            Today's Earnings
          </p>
          <p className={`text-4xl font-bold ${isDark ? 'text-green-400 glow-text' : 'text-green-600'}`}>
            ${payout.toFixed(2)}
          </p>
        </div>

        <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Next assignment available in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
