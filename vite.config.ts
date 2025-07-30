import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Domain-specific chunks
          'payroll-domain': [
            './src/domains/payroll/components/PayrollDashboard.tsx',
            './src/domains/payroll/components/F45PayrollDashboard.tsx',
            './src/domains/payroll/components/BenefitsAdministration.tsx',
            './src/domains/payroll/components/PayTypesManager.tsx'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to reduce warnings
  },
}));
