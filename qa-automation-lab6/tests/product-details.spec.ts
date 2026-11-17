import { test, expect, Page } from '@playwright/test';
import { USERS } from './data';

type CatalogItem = { name: string; price: string; desc: string };

// Зчитує назву, ціну й опис товару з картки в каталозі
async function readCard(page: Page, productName: string) {
  const card = page.getByTestId('inventory-item').filter({ hasText: productName });
  await expect(card).toBeVisible();
  const item: CatalogItem = {
    name: (await card.getByTestId('inventory-item-name').innerText()).trim(),
    price: (await card.getByTestId('inventory-item-price').innerText()).trim(),
    desc: (await card.getByTestId('inventory-item-desc').innerText()).trim(),
  };
  return { card, item };
}

// Перевіряє, що сторінка товару показує ті самі дані, що й каталог
async function expectDetailsMatch(page: Page, item: CatalogItem) {
  await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
  await expect(page.getByTestId('inventory-item-name')).toHaveText(item.name);
  await expect(page.getByTestId('inventory-item-price')).toHaveText(item.price);
  await expect(page.getByTestId('inventory-item-desc')).toHaveText(item.desc);
}

test.describe('Сторінка товару', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.standard.username);
    await page.getByPlaceholder('Password').fill(USERS.standard.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('перехід за назвою: дані сторінки товару збігаються з каталогом', async ({ page }) => {
    const { card, item } = await readCard(page, 'Sauce Labs Backpack');
    await card
      .getByRole('button', { name: `View details for ${item.name}` })
      .filter({ has: page.getByTestId('inventory-item-name') })
      .click();
    await expectDetailsMatch(page, item);
  });

  test('перехід за зображенням: дані збігаються, повернення до каталогу', async ({ page }) => {
    const { card, item } = await readCard(page, 'Sauce Labs Fleece Jacket');
    await card.getByRole('img', { name: item.name }).click();
    await expectDetailsMatch(page, item);
    await page.getByRole('button', { name: 'Back to products' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
  });
});
