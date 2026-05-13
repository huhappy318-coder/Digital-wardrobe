import { test, expect } from '@playwright/test';

test('移动端导航和衣橱布局可用', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/wardrobe.html');

  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('#menuButton')).toBeVisible();
  await page.locator('#menuButton').click();
  await expect(page.locator('#mobileNav')).toHaveClass(/open/);
  await expect(page.locator('#uploadZone')).toBeVisible();
  await expect(page.locator('#wardrobeGrid')).toBeVisible();
});

test('平板端核心区域可见', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/wardrobe.html');

  await expect(page.locator('.workspace')).toBeVisible();
  await expect(page.locator('#itemForm')).toBeVisible();
  await expect(page.locator('#wardrobeGrid')).toBeVisible();
});

test('桌面端试衣间可用', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/tryon.html');

  await expect(page.locator('.tryon-layout')).toBeVisible();
  await expect(page.locator('.mannequin')).toBeVisible();
  await page.locator('[data-wear]').first().click();
  await expect(page.locator('#wornSummary .tag')).toHaveCount(1);
});
