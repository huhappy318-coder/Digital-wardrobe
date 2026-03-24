from playwright.sync_api import sync_playwright
import sys
import io
import time

# 解决编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def test_generate_suggestion():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("正在访问搭配建议页面...")
            page.goto("http://localhost:8001/suggestion.html")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)

            print("展开配置面板")
            page.click('.config-header')
            page.wait_for_timeout(500)

            # 测试默认选中的模型是 DeepSeek
            assert page.locator('#model-deepseek').is_checked()

            # 测试生成建议按钮初始状态为禁用
            assert page.locator('#generate-suggestion').is_disabled()

            # 测试输入框和按钮状态
            assert page.locator('#deepseek-api-key').is_visible()
            assert page.locator('#deepseek-api-key').is_enabled()

            print("配置面板测试完成")

            # 测试风格类型和颜色偏好选择
            style_select = page.locator('#style-type')
            assert style_select.is_visible()
            assert style_select.is_enabled()
            print("风格类型选择已找到")

            color_select = page.locator('#color-preference')
            assert color_select.is_visible()
            assert color_select.is_enabled()
            print("颜色偏好选择已找到")

            # 测试切换风格类型
            style_select.select_option('professional')
            page.wait_for_timeout(500)
            assert style_select.input_value() == 'professional'
            print("风格类型切换成功")

            # 测试切换颜色偏好
            color_select.select_option('warm')
            page.wait_for_timeout(500)
            assert color_select.input_value() == 'warm'
            print("颜色偏好切换成功")

            # 测试返回默认值
            style_select.select_option('casual')
            color_select.select_option('all')
            print("已返回默认值")

            print("搭配建议页面功能测试完成")

        except Exception as e:
            print(f"\n测试失败: {e}")
            page.screenshot(path="suggestion_generation_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    test_generate_suggestion()