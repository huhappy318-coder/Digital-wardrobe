import requests
import base64
import os

# 测试后端API的分析接口
def test_analyze_image_api():
    # 读取测试图片
    image_path = 'C:/Users/huawei/Desktop/项目004/test_images/test1.jpg'
    with open(image_path, 'rb') as f:
        image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')

    # 发送请求
    url = 'http://localhost:8001/api/analyze-image'
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        'image_base64': image_base64
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")

        if response.status_code == 200:
            # 解析响应
            result = response.json()
            print("API响应成功！")
            return True
        else:
            print("API响应失败！")
            return False

    except Exception as e:
        print(f"请求失败: {e}")
        return False

# 测试后端API的聊天接口
def test_claude_api():
    # 发送请求
    url = 'http://localhost:8001/api/claude'
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        'messages': [
            {
                'role': 'system',
                'content': '你是专业的时尚配色师'
            },
            {
                'role': 'user',
                'content': '我选中了以下衣服：\n- 白色T恤\n  颜色: 白色\n  风格: 休闲\n  类别: 上衣\n  图片: data:image/jpeg;base64,...\n- 蓝色牛仔裤\n  颜色: 蓝色\n  风格: 休闲\n  类别: 裤子\n  图片: data:image/jpeg;base64,...\n\n请分析这套搭配的协调度，严格返回以下格式的 JSON：\n{\n  "score": 85,\n  "colorAnalysis": "这套搭配以冷色调为主，蓝色上衣与灰色裤子形成和谐的同色系搭配",\n  "pros": ["色调统一", "风格一致"],\n  "cons": ["缺少亮点，略显单调"],\n  "suggestion": "可以加一条浅色围巾提亮整体造型",\n  "occasion": "适合日常通勤、周末逛街"\n}\n\n要求：\n1. 只返回 JSON 格式\n2. score 范围 0-100\n3. colorAnalysis 详细描述色彩搭配\n4. pros 和 cons 是数组\n5. suggestion 是具体的改进建议\n6. occasion 是适合的场合\n7. 所有字段使用中文\n8. 确保 JSON 格式正确'
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")

        if response.status_code == 200:
            # 解析响应
            result = response.json()
            print("API响应成功！")
            return True
        else:
            print("API响应失败！")
            return False

    except Exception as e:
        print(f"请求失败: {e}")
        return False

# 主函数
if __name__ == '__main__':
    print("测试后端API的分析接口...")
    analyze_success = test_analyze_image_api()

    print("\n测试后端API的聊天接口...")
    chat_success = test_claude_api()

    if analyze_success and chat_success:
        print("\n所有后端API接口测试通过！")
    else:
        print("\n部分后端API接口测试失败！")