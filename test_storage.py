from playwright.sync_api import sync_playwright
import os
import sys
import io

# 解决编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 测试数据存储和管理功能
html_file_path = os.path.abspath('C:/Users/huawei/Desktop/项目004/test_storage.html')
file_url = f'file://{html_file_path}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # 导航到本地HTML文件
    page.goto(file_url)
    page.wait_for_load_state('networkidle')

    # 截图
    page.screenshot(path='test_storage_initial.png', full_page=True)

    # 点击所有测试按钮
    buttons = page.locator('button')
    button_count = buttons.count()

    for i in range(button_count):
        button = buttons.nth(i)
        button_text = button.inner_text()
        print(f"点击按钮: {button_text}")
        button.click()
        page.wait_for_timeout(1000)

    # 截图
    page.screenshot(path='test_storage_results.png', full_page=True)

    # 检查所有测试结果是否成功
    success_elements = page.locator('.success')
    success_count = success_elements.count()

    error_elements = page.locator('.error')
    error_count = error_elements.count()

    print(f"成功测试数量: {success_count}")
    print(f"失败测试数量: {error_count}")

    if error_count > 0:
        print("测试失败！")
        for i in range(error_count):
            error_element = error_elements.nth(i)
            error_text = error_element.inner_text()
            print(f"失败信息: {error_text}")
    else:
        print("所有测试成功！")

    # 关闭浏览器
    browser.close()