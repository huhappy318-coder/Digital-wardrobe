from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("正在访问 suggestion.html...")
        page.goto("http://localhost:8001/suggestion.html")
        page.wait_for_load_state("networkidle")

        # 检查导航栏
        if not page.locator("header").is_visible():
            raise Exception("导航栏未找到")
        print("导航栏已找到")

        # 检查 Logo
        if not page.locator(".logo").is_visible():
            raise Exception("Logo 未找到")
        print("Logo 已找到")

        # 检查页面背景颜色
        body_bg = page.evaluate("""() => {
            return getComputedStyle(document.body).backgroundColor;
        }""")
        print("页面背景颜色:", body_bg)

        # 检查卡片
        card_count = page.locator(".card").count()
        if card_count == 0:
            raise Exception("未找到卡片")
        print("找到", card_count, "个卡片")

        # 检查按钮
        button_count = page.locator(".btn-primary").count()
        if button_count == 0:
            raise Exception("未找到主按钮")
        print("找到", button_count, "个主按钮")

        # 验证橙色主题样式
        has_orange_theme = page.evaluate("""() => {
            return Array.from(document.styleSheets).some(sheet => {
                try {
                    return Array.from(sheet.cssRules || []).some(rule =>
                        rule.cssText && rule.cssText.includes("#FF6B2C")
                    );
                } catch (e) {
                    return false;
                }
            });
        }""")

        if not has_orange_theme:
            raise Exception("未找到橙色主题样式")
        print("橙色主题样式已加载")

        print("\nsuggestion.html 页面样式验证通过！")

    except Exception as e:
        print("\n验证失败:", e)
        page.screenshot(path="suggestion_error.png")

    finally:
        browser.close()
