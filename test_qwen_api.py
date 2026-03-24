#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试千问视觉API的简单脚本 - 修正编码问题
"""

import base64
import requests
import json
import io
from PIL import Image

def create_test_image():
    """创建一个简单的测试图片"""
    image_buffer = io.BytesIO()
    img = Image.new('RGB', (200, 300), color='#ff6b6b')
    img.save(image_buffer, format='JPEG')
    image_buffer.seek(0)
    return base64.b64encode(image_buffer.read()).decode('utf-8')

def test_image_analysis():
    try:
        image_base64 = create_test_image()

        response = requests.post(
            "http://localhost:8001/api/analyze-image",
            json={"image_base64": image_base64}
        )

        response.encoding = 'utf-8'

        print(f"Response status code: {response.status_code}")
        print("=" * 50)
        print("Response content:")
        print(response.text)

        if response.status_code == 200:
            data = response.json()
            print("\n" + "=" * 50)
            print("API response content:")
            print(data["content"])

    except Exception as e:
        print(f"Error: {e}")

def test_chat_api():
    try:
        response = requests.post(
            "http://localhost:8001/api/claude",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "你好，我想了解我的衣橱管理系统"
                    }
                ]
            }
        )

        response.encoding = 'utf-8'

        print(f"Response status code: {response.status_code}")
        print("=" * 50)
        print("Response content:")
        print(response.text)

        if response.status_code == 200:
            try:
                data = response.json()
                print("\n" + "=" * 50)
                print("API response content:")
                print(data["content"])
                print(f"\nModel used: {data['model']}")
            except Exception as e:
                print(f"\nError parsing JSON: {e}")
                print("Raw response:", repr(response.content))

    except Exception as e:
        print(f"Error: {e}")

def test_wardrobe_system():
    """测试衣橱管理系统的基本功能"""
    try:
        # 测试添加衣物
        print("\n=== 测试添加衣物 ===")
        test_image = create_test_image()

        response = requests.post(
            "http://localhost:8001/api/analyze-image",
            json={"image_base64": test_image}
        )
        response.encoding = 'utf-8'

        if response.status_code == 200:
            data = response.json()
            print(f"API分析结果: {data['content']}")

        # 测试获取建议
        print("\n=== 测试获取穿搭建议 ===")
        response = requests.post(
            "http://localhost:8001/api/claude",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": """
我今天要去参加一个休闲聚会，需要搭配一套衣服。
请根据以下衣橱内容推荐合适的穿搭：
1. 红色T恤（上衣，红色，休闲风格，夏季）
2. 蓝色牛仔裤（裤子，蓝色，休闲风格，全年）
3. 黑色运动鞋（鞋子，黑色，运动风格，全年）

请给出具体的搭配建议和理由。
"""
                    }
                ]
            }
        )
        response.encoding = 'utf-8'

        if response.status_code == 200:
            data = response.json()
            print(data["content"])

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("测试千问视觉API接入...")
    print("=" * 50)

    print("\n1. 测试图片分析接口:")
    test_image_analysis()

    print("\n" + "=" * 50)
    print("\n2. 测试聊天接口:")
    test_chat_api()

    print("\n" + "=" * 50)
    print("\n3. 测试衣橱管理系统:")
    test_wardrobe_system()