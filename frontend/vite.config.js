import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawValue = env.MAINTENANCE_MODE || env.VITE_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE || process.env.VITE_MAINTENANCE_MODE || 'false';
  const isMaintenanceMode = String(rawValue).toLowerCase() === 'true';

  return {
    plugins: [react()],
    css: {
      modules: {
        localsConvention: "camelCase"
      }
    },
    define: {
      'process.env.MAINTENANCE_MODE': JSON.stringify(isMaintenanceMode),
      'process.env.VITE_MAINTENANCE_MODE': JSON.stringify(isMaintenanceMode),
    }
  };
});