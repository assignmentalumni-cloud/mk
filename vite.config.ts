import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
      ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/supabase/**'],
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'lucide-react', '@supabase/supabase-js'],
    exclude: ['@electric-sql/pglite'],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
