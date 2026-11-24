import { test, expect, type Page } from '@playwright/test';
import { VALID_USER, INVALID_CASES } from './login-data';

// Варіант 3: вхід із коректними та некоректними даними,
// перевірка тексту повідомлення та наявності кнопки виходу
async function logIn(page: Page, username: string, password: string) {
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Вхід до захищеної області', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('коректні дані відкривають захищену область із кнопкою виходу', async ({ page }) => {
    await logIn(page, VALID_USER.username, VALID_USER.password);

    await expect(page).toHaveURL(/\/secure$/);
    await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
    await expect(page.locator('#flash')).toHaveClass(/success/);

    const logout = page.getByRole('link', { name: 'Logout' });
    await expect(logout).toBeVisible();

    // Кнопка виходу не лише присутня, а й працює
    await logout.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#flash')).toContainText('You logged out of the secure area!');
  });

  test('некоректні дані залишають на сторінці входу без кнопки виходу', async ({ page }) => {
    for (const c of INVALID_CASES) {
      await test.step(c.name, async () => {
        await page.goto('/login');
        await logIn(page, c.username, c.password);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.locator('#flash')).toContainText(c.message);
        await expect(page.locator('#flash')).toHaveClass(/error/);
        await expect(page.getByRole('link', { name: 'Logout' })).toHaveCount(0);
      });
    }
  });
});
