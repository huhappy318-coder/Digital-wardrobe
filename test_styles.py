from playwright.sync_api import sync_playwright

def test_homepage_styles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("正在访问首页...")
            page.goto('http://localhost:8001/')
            page.wait_for_load_state('networkidle')

            # 检查导航栏
            if not page.locator('header').is_visible():
                raise Exception("导航栏未找到或不可见")

            # 检查 Logo
            if not page.locator('.logo').is_visible():
                raise Exception("Logo 未找到或不可见")

            # 检查页面背景颜色（应该是 #FFF8F4）
            body_bg = page.evaluate("""() => {
                const body = document.querySelector('body');
                return getComputedStyle(body).backgroundColor;
            }""")
            print("页面背景颜色: {}".format(body_bg))

            # 检查是否有橙色主题样式
            has_orange_theme = page.evaluate("""() => {
                return Array.from(document.styleSheets)
                    .some(sheet => {
                        try {
                            return Array.from(sheet.cssRules || [])
                                .some(rule => rule.cssText && rule.cssText.includes('#FF6B2C'));
                        } catch (e) {
                            return false;
                        }
                    });
            }""")

            if not has_orange_theme:
                raise Exception("页面未加载橙色主题样式")

            # 检查卡片元素
            cards = page.locator('.card').count()
            print("找到的卡片数量: {}".format(cards))

            # 检查按钮
            buttons = page.locator('.btn-primary').count()
            print("找到的主按钮数量: {}".format(buttons))

            print("首页样式验证通过")

        except Exception as e:
            print("首页验证失败: {}".format(e))
            page.screenshot(path='homepage_error.png')
        finally:
            browser.close()

def test_wardrobe_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("\n正在访问衣橱页...")
            page.goto('http://localhost:8001/wardrobe.html')
            page.wait_for_load_state('networkidle')

            # 检查页面结构
            if not page.locator('.wardrobe-container').is_visible():
                raise Exception("衣橱页面容器未找到")

            # 检查上传区域
            if not page.locator('.upload-area').is_visible():
                raise Exception("上传区域未找到")

            # 检查衣橱网格
            if not page.locator('.wardrobe-grid').is_visible():
                raise Exception("衣橱网格未找到")

            print("衣橱页样式验证通过")

        except Exception as e:
            print("衣橱页验证失败: {}".format(e))
            page.screenshot(path='wardrobe_error.png')
        finally:
            browser.close()

def test_outfit_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("\n正在访问穿搭页...")
            page.goto('http://localhost:8001/outfit.html')
            page.wait_for_load_state('networkidle')

            # 检查天气卡片
            if not page.locator('.weather-card').is_visible():
                raise Exception("天气卡片未找到")

            # 检查生成按钮
            if not page.locator('#generateOutfitBtn').is_visible():
                raise Exception("生成穿搭按钮未找到")

            print("穿搭页样式验证通过")

        except Exception as e:
            print("穿搭页验证失败: {}".format(e))
            page.screenshot(path='outfit_error.png')
        finally:
            browser.close()

if __name__ == "__main__":
    test_homepage_styles()
    test_wardrobe_page()
    test_outfit_page()
    print("\n所有页面样式验证通过！")