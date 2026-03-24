from PIL import Image, ImageDraw, ImageFont
import os

# 创建测试图片
def create_test_image():
    width, height = 200, 200
    image = Image.new('RGB', (width, height), color='red')
    draw = ImageDraw.Draw(image)

    # 添加文字
    font = ImageFont.truetype('arial.ttf', 24)
    text = 'Test Image'
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), text, fill='white', font=font)

    # 保存图片
    save_path = os.path.join('test_images', 'test1.jpg')
    image.save(save_path, 'JPEG')
    print(f"测试图片已创建：{save_path}")

if __name__ == '__main__':
    create_test_image()