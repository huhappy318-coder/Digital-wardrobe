from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from openai import OpenAI
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import httpx

# 获取当前文件目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

# 加载环境变量
load_dotenv()

app = FastAPI(title="ClosetAI Backend")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载前端静态文件
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# 新增天气获取接口
@app.get("/api/weather")
async def get_weather(city: str):
    try:
        # wttr.in 免费天气接口，无需API Key
        url = f"https://wttr.in/{city}?format=j1&lang=zh"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            data = response.json()

            current = data['current_condition'][0]
            weather_desc = current['weatherDesc'][0]['value']
            temp_c = current['temp_C']
            feels_like = current['FeelsLikeC']
            humidity = current['humidity']

            return {
                "city": city,
                "temp": int(temp_c),
                "feels_like": int(feels_like),
                "humidity": humidity,
                "description": weather_desc,
                "success": True
            }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 获取当前文件目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

# 加载环境变量
load_dotenv()

app = FastAPI(title="ClosetAI Backend")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载前端静态文件
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# 初始化 OpenAI 客户端（兼容千问 API）
api_key = os.getenv("QWEN_API_KEY")
if api_key:
    client = OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
else:
    client = None
    print("警告：QWEN_API_KEY 未设置，API 功能将不可用")

# 请求模型
class ClaudeRequest(BaseModel):
    messages: List[Dict[str, Any]]

# 响应模型
class ClaudeResponse(BaseModel):
    content: str
    model: str

class ImageAnalysisRequest(BaseModel):
    image_base64: str

@app.post("/api/claude", response_model=ClaudeResponse)
async def call_claude_api(request: ClaudeRequest):
    """
    转发请求到千问 API 的接口（兼容 OpenAI 格式）
    """
    api_key = os.getenv("QWEN_API_KEY")

    if not api_key or not client:
        raise HTTPException(status_code=500, detail="QWEN_API_KEY not configured")

    try:
        response = client.chat.completions.create(
            model="qwen-vl-plus",
            messages=request.messages,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )

        return ClaudeResponse(
            content=response.choices[0].message.content,
            model=response.model
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling Qwen API: {str(e)}")

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """
    分析衣服图片，识别颜色、分类、风格、季节等信息
    """
    if not client:
        raise HTTPException(status_code=500, detail="QWEN_API_KEY not configured")

    try:
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
你是一个专业的时尚分析师，负责识别图片中的衣服信息。
请分析图片中的衣物，并严格按照以下格式返回 JSON 数据：

{
  "category": "上衣/裤子/裙子/外套/鞋子/配件",
  "color": "主色名称",
  "style": "休闲/正式/运动/优雅/街头",
  "season": "春/夏/秋/冬/全年",
  "name": "对这件衣服的简短描述，10字以内"
}

注意：
1. 只返回 JSON 格式的内容，不要包含其他文本
2. category 必须从给定的选项中选择
3. color 必须是中文颜色描述
4. style 必须从给定的选项中选择
5. season 必须从给定的选项中选择
6. name 必须简洁，不超过10个字符

请确保JSON格式正确，字段值符合要求。
"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{request.image_base64}"
                        }
                    }
                ]
            }
        ]

        response = client.chat.completions.create(
            model="qwen-vl-plus",
            messages=messages,
            max_tokens=1024
        )

        return {"content": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

class AISuggestionRequest(BaseModel):
    messages: List[Dict[str, Any]]
    base_url: str
    model: str
    api_key: str

@app.post("/api/ai-suggest")
async def get_ai_suggestion(request: AISuggestionRequest):
    """
    动态调用不同 AI 模型的接口（OpenAI 兼容格式）
    """
    try:
        # 动态创建 OpenAI 客户端
        client = OpenAI(
            api_key=request.api_key,
            base_url=request.base_url
        )

        response = client.chat.completions.create(
            model=request.model,
            messages=request.messages,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )

        return ClaudeResponse(
            content=response.choices[0].message.content,
            model=response.model
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling AI API: {str(e)}")

@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/{page}.html")
async def pages(page: str):
    file_path = os.path.join(FRONTEND_DIR, f"{page}.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)