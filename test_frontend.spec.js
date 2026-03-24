import { test, expect } from '@playwright/test';

test('测试衣橱管理页面的基本功能', async ({ page }) => {
  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 检查页面标题
  await expect(page).toHaveTitle('衣橱管理 - 直搭数字衣柜');

  // 检查页面元素是否存在
  await expect(page.locator('.wardrobe-container')).toBeVisible();
  await expect(page.locator('.upload-section')).toBeVisible();
  await expect(page.locator('.wardrobe-display')).toBeVisible();

  // 检查上传区域
  await expect(page.locator('#uploadArea')).toBeVisible();

  // 检查分类筛选
  await expect(page.locator('#category-filter')).toBeVisible();
});

test('测试分类筛选功能', async ({ page }) => {
  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 选择上衣分类
  await page.locator('#category-filter').selectOption('上衣');

  // 等待衣橱内容更新
  await page.waitForTimeout(1000);

  // 选择全部分类
  await page.locator('#category-filter').selectOption('all');
});

test('测试AI搭配分析功能可用性', async ({ page }) => {
  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 检查搭配分析按钮是否存在
  await expect(page.locator('#analyze-outfit')).toBeVisible();
});