import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: 'tests', workers: 1,
  use: {
    baseURL: process.env.WEB_TEST_ORIGIN || 'http://127.0.0.1:4320',
    launchOptions: { executablePath: process.env.CHROME_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined) },
  },
  webServer: process.env.WEB_TEST_ORIGIN ? undefined : {
    command: 'npm run preview -- --port 4320 --strictPort',
    url: 'http://127.0.0.1:4320', reuseExistingServer: !process.env.CI,
  },
});
