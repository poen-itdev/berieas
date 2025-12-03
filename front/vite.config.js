import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const port = parseInt(env.VITE_PORT) || 80;

  const allowedHosts = env.VITE_DOMAIN_LIST
    ? env.VITE_DOMAIN_LIST.split(',').map((h) => h.trim())
    : [];

  return {
    plugins: [react()],
    server: {
      host: true,
      port,
      allowedHosts,
    },
  };
});
