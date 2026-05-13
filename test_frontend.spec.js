import { test, expect } from '@playwright/test';

test('衣橱管理页面基础功能可用', async ({ page }) => {
  await page.goto('/wardrobe.html');

  await expect(page).toHaveTitle('衣橱管理 - 直搭数字衣柜');
  await expect(page.locator('.workspace')).toBeVisible();
  await expect(page.locator('#uploadZone')).toBeVisible();
  await expect(page.locator('#wardrobeGrid')).toBeVisible();
  await expect(page.locator('#categoryFilter')).toBeVisible();
});

test('分类筛选和搭配分析可用', async ({ page }) => {
  await page.goto('/wardrobe.html');

  await page.locator('#categoryFilter').selectOption('top');
  await expect(page.locator('#wardrobeCount')).toBeVisible();
  await page.locator('#categoryFilter').selectOption('all');

  const selectButtons = page.locator('[data-action="select"]');
  await selectButtons.nth(0).click();
  await selectButtons.nth(1).click();
  await expect(page.locator('#analyzeSelection')).toBeEnabled();
  await page.locator('#analyzeSelection').click();
  await expect(page.locator('#analysisResult')).toBeVisible();
});

test('今日穿搭可以生成并记录', async ({ page }) => {
  await page.goto('/outfit.html');

  await expect(page.locator('#weatherCard')).toBeVisible();
  await page.locator('#generateOutfit').click();
  await expect(page.locator('#outfitResult')).toBeVisible();
  await page.locator('#wearOutfit').click();
  await expect(page.locator('.notification.success')).toBeVisible();
});
