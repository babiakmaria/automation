import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // Адресу стенду можна перевизначити змінною середовища BASE_URL
    // (наприклад, для локального стенду за відсутності доступу до мережі)
    baseURL: process.env.BASE_URL ?? 'https://the-internet.herokuapp.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
