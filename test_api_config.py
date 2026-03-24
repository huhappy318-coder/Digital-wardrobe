from playwright.sync_api import sync_playwright
import sys
import io

# 解决编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def test_api_config():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("正在访问搭配建议页面...")
            page.goto("http://localhost:8001/suggestion.html")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)

            print("页面标题：", page.title())
            assert "搭配建议" in page.title()

            print("导航栏已找到")
            assert page.locator("header").is_visible()

            print("AI 模型配置区域已找到")
            assert page.locator(".api-config-section").is_visible()

            print("配置面板标题已找到")
            assert page.locator('text="⚙️ AI 模型配置"').is_visible()

            print("展开配置面板")
            page.click('.config-header')
            page.wait_for_timeout(500)

            print("模型选择单选按钮已找到")
            model_radios = page.locator('input[name="ai-model"]')
            assert model_radios.count() == 5
            print(f"找到 {model_radios.count()} 个模型选择选项")

            print("默认选中的模型是 DeepSeek")
            deepseek_radio = page.locator('#model-deepseek')
            assert deepseek_radio.is_checked()

            print("DeepSeek 配置表单已找到")
            assert page.locator('#config-deepseek').is_visible()

            print("生成建议按钮已找到")
            generate_btn = page.locator('#generate-suggestion')
            assert generate_btn.is_visible()

            print("生成建议按钮初始状态为禁用")
            assert generate_btn.is_disabled()

            print("提示信息已找到")
            assert page.locator('#generate-suggestion-hint').is_visible()

            print("切换到 Qwen 模型")
            page.click('#model-qwen')
            page.wait_for_timeout(500)
            assert page.locator('#config-qwen').is_visible()
            assert not page.locator('#config-deepseek').is_visible()

            print("Qwen 配置表单已找到")
            assert page.locator('#qwen-api-key').is_visible()

            print("切换到 Doubao 模型")
            page.click('#model-doubao')
            page.wait_for_timeout(500)
            assert page.locator('#config-doubao').is_visible()

            print("Doubao 配置表单已找到")
            assert page.locator('#doubao-api-key').is_visible()

            print("切换到 Kimi 模型")
            page.click('#model-kimi')
            page.wait_for_timeout(500)
            assert page.locator('#config-kimi').is_visible()

            print("Kimi 配置表单已找到")
            assert page.locator('#kimi-api-key').is_visible()

            print("切换到自定义接口")
            page.click('#model-custom')
            page.wait_for_timeout(500)
            assert page.locator('#config-custom').is_visible()

            print("自定义接口配置表单已找到")
            assert page.locator('#custom-base-url').is_visible()
            assert page.locator('#custom-model-name').is_visible()
            assert page.locator('#custom-api-key').is_visible()

            print("API 配置区域功能正常！")

        except Exception as e:
            print(f"\n测试失败: {e}")
            page.screenshot(path="suggestion_api_config_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    test_api_config()