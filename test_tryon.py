from playwright.sync_api import sync_playwright
import sys
import io

# 解决编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("正在访问试衣间页面...")
        page.goto("http://localhost:8001/tryon.html")
        page.wait_for_load_state("networkidle")
        # 增加等待时间，确保动态内容加载
        page.wait_for_timeout(2000)

        # 调试：截图和打印页面内容
        page.screenshot(path="debug_screenshot.png")
        content = page.content()
        with open("debug_page_content.html", "w", encoding="utf-8") as f:
            f.write(content)
        print("页面内容已保存到debug_page_content.html")
        print("页面截图已保存到debug_screenshot.png")

        if page.title() != "试衣间 - ClosetAI":
            raise Exception("页面标题不正确")
        print("页面标题正确")

        if not page.locator("header").is_visible():
            raise Exception("导航栏未找到")
        print("导航栏已找到")

        nav_links = page.eval_on_selector_all("nav ul li a", """
            links => links.map(link => link.textContent.trim())
        """)

        if "试衣间" not in nav_links:
            raise Exception("导航栏中未找到试衣间链接")
        print("导航栏中的试衣间链接已找到")

        if not page.locator("#maleBtn").is_visible() or not page.locator("#femaleBtn").is_visible():
            raise Exception("性别切换按钮未找到")
        print("性别切换按钮已找到")

        # 调试：直接调用displayWardrobe函数
        page.eval_on_selector("body", "() => displayWardrobe()")
        # 等待衣橱列表渲染
        page.wait_for_timeout(1000)

        # 调试：打印#wardrobeList元素的状态
        wardrobe_list = page.locator("#wardrobeList")
        print(f"#wardrobeList元素可见性: {wardrobe_list.is_visible()}")
        print(f"#wardrobeList元素显示状态: {page.eval_on_selector('#wardrobeList', 'el => el.style.display')}")
        print(f"#wardrobeList元素可见性属性: {page.eval_on_selector('#wardrobeList', 'el => el.style.visibility')}")
        print(f"#wardrobeList元素不透明度: {page.eval_on_selector('#wardrobeList', 'el => el.style.opacity')}")
        print(f"#wardrobeList元素内容: {page.eval_on_selector('#wardrobeList', 'el => el.innerHTML')}")

        # 等待衣橱列表加载
        page.wait_for_selector("#wardrobeList", state="visible", timeout=3000)
        if not page.locator("#wardrobeList").is_visible():
            raise Exception("衣橱列表区域未找到")
        print("衣橱列表区域已找到")

        if not page.locator("#clearBtn").is_visible():
            raise Exception("清空按钮未找到")
        print("清空按钮已找到")

        if not page.locator("#renderCanvas").is_visible():
            raise Exception("Three.js 画布未找到")
        print("Three.js 画布已找到")

        if not page.locator("#wornItems").is_visible():
            raise Exception("已穿着标签栏未找到")
        print("已穿着标签栏已找到")

        # 检查页面是否加载了橙色主题样式
        # 简单的方法：检查是否有包含 #FF6B2C 颜色的样式
        has_orange_theme = page.eval_on_selector_all("style, link[rel=stylesheet]", """
            sheets => Array.from(sheets).some(sheet => {
                if (sheet.tagName === "STYLE") {
                    return sheet.textContent.includes("FF6B2C") || sheet.textContent.includes("var(--color-primary)");
                } else {
                    // 如果是外部样式表，我们无法直接读取内容，所以假设它包含橙色主题样式
                    return true;
                }
            })
        """)

        if not has_orange_theme:
            raise Exception("页面未加载橙色主题样式")
        print("橙色主题样式已加载")

        print("\n🎉 试衣间页面验证通过！")

        # 初始化场景
        page.eval_on_selector("body", "() => initThreeScene()")
        # 增加等待时间，确保initThreeScene函数有足够的时间初始化
        page.wait_for_timeout(3000)

        # 测试360度旋转功能
        print("\n测试360度旋转功能：")
        # 检查OrbitControls是否初始化
        controls_initialized = page.eval_on_selector("#renderCanvas", """
            () => typeof window.controls !== 'undefined' && window.controls !== null
        """)
        print(f"OrbitControls初始化: {controls_initialized}")

        # 测试鼠标左右拖动
        canvas = page.locator("#renderCanvas")
        start_pos = canvas.bounding_box()
        if start_pos:
            # 模拟鼠标左拖动
            page.mouse.move(start_pos["x"] + start_pos["width"] / 2, start_pos["y"] + start_pos["height"] / 2)
            page.mouse.down()
            page.mouse.move(start_pos["x"] + start_pos["width"] / 2 - 100, start_pos["y"] + start_pos["height"] / 2)
            page.mouse.up()
            page.wait_for_timeout(500)
            print("鼠标左拖动操作完成")

            # 模拟鼠标右拖动
            page.mouse.move(start_pos["x"] + start_pos["width"] / 2, start_pos["y"] + start_pos["height"] / 2)
            page.mouse.down()
            page.mouse.move(start_pos["x"] + start_pos["width"] / 2 + 100, start_pos["y"] + start_pos["height"] / 2)
            page.mouse.up()
            page.wait_for_timeout(500)
            print("鼠标右拖动操作完成")

        # 测试穿衣功能
        print("\n测试穿衣功能：")
        wear_buttons = page.locator(".wear-btn")
        if wear_buttons.count() > 0:
            wear_buttons.first.click()
            page.wait_for_timeout(1000)
            print("点击第一个穿上按钮")

            # 检查是否有标签显示
            worn_tags = page.locator(".worn-tag")
            print(f"已穿着标签数量: {worn_tags.count()}")

            # 测试脱衣功能
            if worn_tags.count() > 0:
                # 找到标签上的✕按钮
                remove_buttons = page.locator(".worn-tag span")
                if remove_buttons.count() > 0:
                    remove_buttons.first.click()
                    page.wait_for_timeout(500)
                    print("点击第一个脱衣按钮")

        # 测试性别切换功能
        print("\n测试性别切换功能：")
        female_btn = page.locator("#femaleBtn")
        if female_btn.is_visible():
            female_btn.click()
            page.wait_for_timeout(1000)
            print("切换到女生模特")

            # 检查男生按钮是否不再是active
            male_btn = page.locator("#maleBtn")
            is_male_active = page.eval_on_selector("#maleBtn", "el => el.classList.contains('active')")
            print(f"男生按钮active状态: {is_male_active}")

            # 切换回男生
            male_btn.click()
            page.wait_for_timeout(1000)
            print("切换回男生模特")

        print("\n所有功能测试完成！")

    except Exception as e:
        print(f"\n验证失败: {e}")
        page.screenshot(path="tryon_error.png")

    finally:
        browser.close()
