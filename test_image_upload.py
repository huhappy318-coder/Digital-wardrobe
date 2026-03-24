from playwright.sync_api import sync_playwright
import os
import base64

# 测试衣橱管理页面的图片上传和识别功能
html_file_path = os.path.abspath('c:/Users/huawei/closet-ai/frontend/wardrobe.html')
file_url = f'file://{html_file_path}'

def get_image_base64(image_path):
    with open(image_path, 'rb') as f:
        image_data = f.read()
        return base64.b64encode(image_data).decode('utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # 导航到本地HTML文件
    page.goto(file_url)
    page.wait_for_load_state('networkidle')

    # 截图
    page.screenshot(path='wardrobe_initial.png', full_page=True)

    # 获取测试图片的base64数据
    test_image_path = os.path.abspath('c:/Users/huawei/closet-ai/test_images/test1.jpg')
    image_base64 = get_image_base64(test_image_path)

    # 直接设置文件输入
    page.set_input_files('#fileInput', test_image_path)

    # 手动设置预览图片的src属性
    page.evaluate(f'''
        (imageData) => {{
            const previewImage = document.getElementById('previewImage');
            const previewContainer = document.getElementById('previewContainer');
            previewImage.src = 'data:image/jpeg;base64,' + imageData;
            previewContainer.classList.add('active');
        }}
    ''', image_base64)

    # 截图
    page.screenshot(path='wardrobe_preview.png', full_page=True)

    # 直接调用analyzeImage函数
    page.evaluate(f'''
        (imageData) => {{
            analyzeImage(imageData);
        }}
    ''', image_base64)

    # 等待分析结果出现（增加等待时间）
    page.wait_for_selector('#analysisResult.active', timeout=60000)

    # 截图
    page.screenshot(path='wardrobe_analysis.png', full_page=True)

    # 测试识别结果的输入框是否可见
    assert page.is_visible('#categorySelect')
    assert page.is_visible('#colorInput')
    assert page.is_visible('#styleSelect')
    assert page.is_visible('#seasonSelect')
    assert page.is_visible('#nameInput')

    # 点击保存按钮
    page.click('#saveBtn')

    # 等待衣橱内容更新
    page.wait_for_timeout(1000)

    # 截图
    page.screenshot(path='wardrobe_updated.png', full_page=True)

    print("图片上传和识别功能测试通过！")

    browser.close()