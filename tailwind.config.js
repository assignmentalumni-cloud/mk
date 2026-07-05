/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cosmic: {
          midnight: '#060913',
          deep: '#0a0f1a',
          purple: '#1a1f3a',
        },
        neon: {
          pink: '#FF007A',
          'pink-bright': '#FF1A8C',
          'pink-dim': '#CC0062',
          glow: 'rgba(255, 0, 122, 0.6)',
        },
        ivory: '#F8FAFC',
      },
      boxShadow: {
        'neon-pink': '0 0 15px rgba(255, 0, 122, 0.6)',
        'neon-pink-lg': '0 0 25px rgba(255, 0, 122, 0.9)',
        'neon-pink-intense': '0 0 40px rgba(255, 0, 122, 1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};
