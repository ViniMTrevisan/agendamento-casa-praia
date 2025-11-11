import 'dotenv/config'; // Isso carrega o .env.local para 'process.env'
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:3001';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
  },
  
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    
    // --- ADICIONE ESTA SEÇÃO ---
    // Passa as variáveis carregadas do .env.local para o processo do servidor
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
      AUTH_SECRET: process.env.AUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    },
    // --- FIM DA ADIÇÃO ---
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});