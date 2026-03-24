from playwright.sync_api import sync_playwright
import os

def test_outfit_page():
    # 测试今日穿搭页面功能
    html_file_path = os.path.abspath('C:/Users/huawei/Desktop/项目004/frontend/outfit.html')
    file_url = f'file://{html_file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # 导航到本地HTML文件
        page.goto(file_url)
        page.wait_for_load_state('networkidle')

        # 截图
        page.screenshot(path='outfit_page.png', full_page=True)

        # 测试页面标题
        title = page.title()
        assert title == '今日穿搭 - ClosetAI'

        # 测试天气查询区域
        location_input = page.locator('#city-input')
        assert location_input.is_visible()

        # 测试获取穿搭建议按钮
        get_recommend_btn = page.locator('#get-recommend-btn')
        assert get_recommend_btn.is_visible()

        # 测试生成穿搭按钮
        generate_btn = page.locator('#generateOutfitBtn')
        assert generate_btn.is_visible()

        print("今日穿搭页面功能测试通过！")

        browser.close()

if __name__ == "__main__":
    test_outfit_page()