import { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  badge?: ReactNode;
  accent?: boolean;
}

export function MetricCard({ icon, label, value, badge, accent }: MetricCardProps) {
  const { isDark } = useTheme();
  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  return (
    <div
      className={`${glassClass} p-6 relative overflow-hidden group transition-all duration-300 ${
        accent
          ? isDark
            ? 'border-neon-pink/30 hover:border-neon-pink/50 shadow-[0_0_20px_rgba(255,0,122,0.1)] hover:shadow-[0_0_30px_rgba(255,0,122,0.2)]'
            : 'border-neon-pink/20 hover:border-neon-pink/40 shadow-lg'
          : ''
      }`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
            isDark ? 'bg-neon-pink/5' : 'bg-neon-pink/3'
          }`}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-neon-pink/10 group-hover:bg-neon-pink/20'
                : 'bg-neon-pink/10 group-hover:bg-neon-pink/15'
            }`}
          >
            {icon}
          </div>
          {badge}
        </div>

        <p
          className={`text-sm mb-2 transition-colors duration-300 ${
            isDark
              ? 'text-gray-400 group-hover:text-gray-300'
              : 'text-gray-500 group-hover:text-gray-600'
          }`}
        >
          {label}
        </p>

        <p
          className={`text-3xl font-bold transition-all duration-300 ${
            isDark
              ? `${accent ? 'text-neon-pink glow-text' : 'text-white'}`
              : 'text-gray-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
