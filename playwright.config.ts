import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';

// For fixing e2e test failures, use the bugfixer agent via Task tool with subagent_type: 'bugfixer'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['json', { outputFile: 'test-results.json' }]],
  globalSetup: fileURLToPath(
    new URL('./tests/e2e/global-setup.ts', import.meta.url)
  ),
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
