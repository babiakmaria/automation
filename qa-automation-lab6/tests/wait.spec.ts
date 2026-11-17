import { test, expect, Page } from '@playwright/test';
import { USERS } from './data';

async function loginAsSlowUser(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(USERS.slow.username);
  await page.getByPlaceholder('Password').fill(USERS.slow.password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Експеримент з очікуванням', () => {
  test('пауза 1000 мс', async ({ page }) => {
    await loginAsSlowUser(page);
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/inventory/);
  });

  test('твердження очікування', async ({ page }) => {
    await loginAsSlowUser(page);
    await expect(page).toHaveURL(/inventory/);
  });

  test('пауза 5000 мс', async ({ page }) => {
    await loginAsSlowUser(page);
    await page.waitForTimeout(5000);
    expect(page.url()).toMatch(/inventory/);
  });

  test('вміст: пауза 1000 мс', async ({ page }) => {
    await loginAsSlowUser(page);
    await page.waitForTimeout(1000);
    expect(await page.locator('.inventory_item').count()).toBe(6);
  });

  test('вміст: твердження очікування', async ({ page }) => {
    await loginAsSlowUser(page);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('вміст: пауза 5000 мс', async ({ page }) => {
    await loginAsSlowUser(page);
    await page.waitForTimeout(5000);
    expect(await page.locator('.inventory_item').count()).toBe(6);
  });
});
