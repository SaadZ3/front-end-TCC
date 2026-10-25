import { defineConfig } from '@playwright/test';

// Teste contra front/back reais já iniciados e uma conta em banco de teste.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
});
