import { test, expect } from '@playwright/test';

test('测试响应式设计 - 移动端', async ({ page }) => {
  // 模拟iPhone 12 Pro
  await page.setViewportSize({ width: 390, height: 844 });

  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 检查页面元素是否可见
  await expect(page.locator('.wardrobe-container')).toBeVisible();
  await expect(page.locator('.upload-section')).toBeVisible();
  await expect(page.locator('.wardrobe-display')).toBeVisible();

  // 检查导航菜单是否响应式
  await expect(page.locator('header')).toBeVisible();

  // 检查分类筛选是否可用
  await expect(page.locator('#category-filter')).toBeVisible();
});

test('测试响应式设计 - 平板', async ({ page }) => {
  // 模拟iPad Air
  await page.setViewportSize({ width: 820, height: 1180 });

  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 检查页面元素是否可见
  await expect(page.locator('.wardrobe-container')).toBeVisible();
  await expect(page.locator('.upload-section')).toBeVisible();
  await expect(page.locator('.wardrobe-display')).toBeVisible();

  // 检查导航菜单是否响应式
  await expect(page.locator('header')).toBeVisible();

  // 检查分类筛选是否可用
  await expect(page.locator('#category-filter')).toBeVisible();
});

test('测试响应式设计 - 桌面端', async ({ page }) => {
  // 模拟桌面端
  await page.setViewportSize({ width: 1920, height: 1080 });

  // 导航到衣橱管理页面
  await page.goto('http://localhost:8000/frontend/wardrobe.html');

  // 检查页面元素是否可见
  await expect(page.locator('.wardrobe-container')).toBeVisible();
  await expect(page.locator('.upload-section')).toBeVisible();
  await expect(page.locator('.wardrobe-display')).toBeVisible();

  // 检查导航菜单是否响应式
  await expect(page.locator('header')).toBeVisible();

  // 检查分类筛选是否可用
  await expect(page.locator('#category-filter')).toBeVisible();
});