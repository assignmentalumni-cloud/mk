import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true,
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: false,
      ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/supabase/**', '**/.bolt/**'],
    },
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/HomePage.tsx',
        './src/pages/WorkspacePage.tsx',
        './src/pages/ReferralPage.tsx',
        './src/pages/SettingsPage.tsx',
        './src/pages/AdminPage.tsx',
        './src/pages/SignInPage.tsx',
        './src/pages/RegisterPage.tsx',
        './src/components/Layout.tsx',
        './src/components/AdminPanel.tsx',
        './src/hooks/useGlobalState.tsx',
        './src/context/ThemeContext.tsx',
      ],
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'lucide-react',
      '@supabase/supabase-js',
      'qrcode.react',
    ],
    exclude: ['@electric-sql/pglite'],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'qr': ['qrcode.react'],
        },
      },
    },
  },
});
