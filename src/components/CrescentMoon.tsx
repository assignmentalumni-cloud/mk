import { useTheme } from '../context/ThemeContext';

export function CrescentMoon() {
  const { isDark } = useTheme();

  if (!isDark) return null;

  return (
    <div className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-pink/20 via-neon-pink/10 to-transparent blur-xl" />
        </div>
        <svg
          width="96"
          height="96"
          viewBox="0 0 100 100"
          className="relative z-10 animate-float"
        >
          <defs>
            <radialGradient id="moonGlow" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255, 0, 122, 0.8)" />
              <stop offset="50%" stopColor="rgba(255, 0, 122, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 0, 122, 0.1)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M50 10 C75 10 90 35 90 50 C90 75 75 90 50 90 C60 80 65 65 65 50 C65 35 60 20 50 10"
            fill="url(#moonGlow)"
            filter="url(#glow)"
            className="drop-shadow-[0_0_15px_rgba(255,0,122,0.6)]"
          />
          <circle
            cx="70"
            cy="50"
            r="25"
            fill="#060913"
            className="opacity-95"
          />
        </svg>
        <div className="absolute inset-0 -z-10">
          <div className="w-32 h-32 -m-4 rounded-full bg-neon-pink/5 animate-pulse-glow" />
        </div>
      </div>
    </div>
  );
}
