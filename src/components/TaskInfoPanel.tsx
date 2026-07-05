import { Clock, FileText, Hash, DollarSign, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TaskInfoPanelProps {
  payout: number;
  taskId: string;
  title: string;
}

export function TaskInfoPanel({ payout, taskId, title }: TaskInfoPanelProps) {
  const { isDark } = useTheme();
  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  return (
    <div className={`${glassClass} p-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-neon-pink/5 rounded-full blur-3xl -mr-20 -mt-20" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-neon-pink/10' : 'bg-neon-pink/10'}`}>
            <FileText className={`w-5 h-5 text-neon-pink`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Assigned Topic
            </p>
            <h3 className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Hash className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Reference ID</span>
            </div>
            <p className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {taskId}
            </p>
          </div>

          <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <FileText className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Min. Length</span>
            </div>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              1,000 Words
            </p>
          </div>

          <div className={`p-3 rounded-xl ${isDark ? 'bg-neon-pink/10 border border-neon-pink/30' : 'bg-neon-pink/10 border border-neon-pink/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`w-4 h-4 text-neon-pink`} />
              <span className={`text-xs text-neon-pink`}>Payout Value</span>
            </div>
            <p className={`text-xl font-bold ${isDark ? 'text-neon-pink glow-text' : 'text-neon-pink'}`}>
              ${payout.toFixed(2)}
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Strict Minimum Length: 1,000 Words Required per submission.
            </p>
            <p className={`text-xs ${isDark ? 'text-red-400/80' : 'text-red-600'}`}>
              Submissions under the word count will be automatically rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
