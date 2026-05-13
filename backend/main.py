import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
PUBLIC_DIR = ROOT_DIR / 'public'

app = FastAPI(title='Zhida Digital Wardrobe', version='2.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ALLOW_ORIGINS', '*').split(','),
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]


class ChatResponse(BaseModel):
    content: str
    model: str = 'local-fallback'


class ImageAnalysisRequest(BaseModel):
    image_base64: str = Field(..., min_length=16)


class AISuggestionRequest(BaseModel):
    messages: List[Dict[str, Any]]
    base_url: str
    model: str
    api_key: str


def get_qwen_client() -> Optional[OpenAI]:
    api_key = os.getenv('QWEN_API_KEY')
    if not api_key:
        return None
    return OpenAI(api_key=api_key, base_url='https://dashscope.aliyuncs.com/compatible-mode/v1')


def local_chat_response(messages: List[Dict[str, Any]]) -> str:
    joined = '\n'.join(str(message.get('content', '')) for message in messages)
    if 'JSON' in joined.upper() or 'json' in joined:
        return json.dumps(
            {
                'outfit': [],
                'reason': '当前未配置模型 API，系统已使用本地规则生成穿搭。请在前端继续查看本地推荐结果。',
                'tip': '补充上衣、下装、鞋履三类基础单品后，推荐会更稳定。',
            },
            ensure_ascii=False,
        )
    return '当前未配置 QWEN_API_KEY，已启用本地兜底建议：保持主色简洁，优先选择低频单品，并按天气增减外套。'


@app.get('/api/health')
async def health() -> Dict[str, Any]:
    return {'ok': True, 'static_dir': str(PUBLIC_DIR), 'has_qwen_key': bool(os.getenv('QWEN_API_KEY'))}


@app.get('/api/weather')
async def get_weather(city: str = '上海') -> Dict[str, Any]:
    try:
        url = f'https://wttr.in/{city}?format=j1&lang=zh'
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        current = data['current_condition'][0]
        return {
            'success': True,
            'city': city,
            'temp': int(current['temp_C']),
            'feels_like': int(current['FeelsLikeC']),
            'humidity': int(current['humidity']),
            'description': current['weatherDesc'][0]['value'],
        }
    except Exception as exc:
        return {
            'success': False,
            'city': city,
            'temp': 23,
            'feels_like': 23,
            'humidity': 58,
            'description': '多云',
            'error': str(exc),
        }


@app.post('/api/claude', response_model=ChatResponse)
async def call_qwen_api(request: ChatRequest) -> ChatResponse:
    client = get_qwen_client()
    if client is None:
        return ChatResponse(content=local_chat_response(request.messages))

    try:
        response = client.chat.completions.create(
            model=os.getenv('QWEN_MODEL', 'qwen-plus'),
            messages=request.messages,
            max_tokens=2048,
        )
        return ChatResponse(content=response.choices[0].message.content or '', model=response.model)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'Qwen API request failed: {exc}') from exc


@app.post('/api/analyze-image')
async def analyze_image(request: ImageAnalysisRequest) -> Dict[str, Any]:
    client = get_qwen_client()
    if client is None:
        return {
            'success': False,
            'content': json.dumps(
                {
                    'category': 'top',
                    'color': '未标注',
                    'style': '休闲',
                    'season': 'all',
                    'name': '新上传单品',
                },
                ensure_ascii=False,
            ),
        }

    prompt = '''
你是专业衣物识别助手。请只返回 JSON，不要返回 Markdown。
字段要求：
{
  "category": "top/bottom/dress/outerwear/shoes/accessory",
  "color": "中文颜色",
  "style": "休闲/通勤/正式/运动/优雅/街头",
  "season": "spring/summer/autumn/winter/all",
  "name": "10字以内中文单品名"
}
'''

    try:
        response = client.chat.completions.create(
            model=os.getenv('QWEN_VL_MODEL', 'qwen-vl-plus'),
            messages=[
                {
                    'role': 'user',
                    'content': [
                        {'type': 'text', 'text': prompt},
                        {
                            'type': 'image_url',
                            'image_url': {'url': f'data:image/jpeg;base64,{request.image_base64}'},
                        },
                    ],
                }
            ],
            max_tokens=512,
        )
        return {'success': True, 'content': response.choices[0].message.content or '{}'}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'Image analysis failed: {exc}') from exc


@app.post('/api/ai-suggest', response_model=ChatResponse)
async def get_ai_suggestion(request: AISuggestionRequest) -> ChatResponse:
    if not request.api_key.strip():
        raise HTTPException(status_code=400, detail='api_key is required')

    try:
        client = OpenAI(api_key=request.api_key, base_url=request.base_url)
        response = client.chat.completions.create(
            model=request.model,
            messages=request.messages,
            max_tokens=2048,
        )
        return ChatResponse(content=response.choices[0].message.content or '', model=response.model)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'AI suggestion request failed: {exc}') from exc


@app.get('/')
async def root() -> FileResponse:
    return FileResponse(PUBLIC_DIR / 'index.html')


@app.get('/{page_name}.html')
async def html_page(page_name: str) -> FileResponse:
    file_path = PUBLIC_DIR / f'{page_name}.html'
    if not file_path.exists():
        raise HTTPException(status_code=404, detail='Page not found')
    return FileResponse(file_path)


if PUBLIC_DIR.exists():
    app.mount('/frontend', StaticFiles(directory=PUBLIC_DIR), name='frontend-compat')
    app.mount('/static', StaticFiles(directory=PUBLIC_DIR), name='static-compat')
    app.mount('/', StaticFiles(directory=PUBLIC_DIR, html=True), name='public')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('backend.main:app', host='0.0.0.0', port=int(os.getenv('BACKEND_PORT', '8001')), reload=True)
