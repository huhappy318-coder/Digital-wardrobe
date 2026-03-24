from playwright.sync_api import sync_playwright
import os

# 测试衣橱管理页面功能
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # 导航到后端服务器提供的页面
    page.goto('http://localhost:8001/wardrobe.html')
    page.wait_for_load_state('networkidle')

    # 截图
    page.screenshot(path='wardrobe_page.png', full_page=True)

    # 测试页面标题
    title = page.title()
    assert title == '衣橱管理 - ClosetAI'

    # 测试上传区域
    upload_area = page.locator('#uploadArea')
    assert upload_area.is_visible()

    # 测试衣橱展示区域
    wardrobe_grid = page.locator('#wardrobe-grid')
    assert wardrobe_grid.is_visible()

    # 测试分类筛选
    category_filter = page.locator('#category-filter')
    assert category_filter.is_visible()

    # 测试搭配工作台
    outfit_builder = page.locator('.outfit-builder')
    assert outfit_builder.is_visible()

    # 测试分析按钮
    analyze_btn = page.locator('#analyze-outfit')
    assert analyze_btn.is_visible()

    print("衣橱管理页面功能测试通过！")

    browser.close()