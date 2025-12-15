import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const host = env.VITE_HOST || 'localhost';
  const port = parseInt(env.VITE_PORT) || 80;
 
  const allowedHosts = env.VITE_DOMAIN_LIST
    ? env.VITE_DOMAIN_LIST.split(',').map((h) => h.trim())
    : [];
 
  const httpsConfig =
    env.VITE_SSL_KEY && env.VITE_SSL_CERT
      ? {
          key: fs.readFileSync(env.VITE_SSL_KEY),
          cert: fs.readFileSync(env.VITE_SSL_CERT),
          ca: fs.readFileSync(env.VITE_SSL_CHAIN),
          passphrase: env.VITE_SSL_PASSPHRASE,
        }
      : false; // SSL 설정이 없으면 http로 실행
 
  return {
    plugins: [react()],
    server: {
      https: httpsConfig,
      host,
      port,
      // allowedHosts,
    },
    optimizeDeps: {
      include: ['ckeditor5', '@ckeditor/ckeditor5-react'],
    },
    build: {
      commonjsOptions: {
        include: [/ckeditor5/, /node_modules/],
      },
    },
  };
});