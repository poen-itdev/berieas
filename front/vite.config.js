import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  const domain = env.VITE_DOMAIN || 'localhost';
  const port = parseInt(env.VITE_PORT) || 80;

  return {
    plugins: [react()],
    server: {
      allowedHosts: [domain],
      host: true,   // 또는 '0.0.0.0' → 모든 네트워크 인터페이스에서 접근 허용
      port: port
    }
  };
});
