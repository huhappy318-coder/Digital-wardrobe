# 直搭数字衣柜 Vercel 部署指南

## 项目概述

这是一个基于传统HTML/CSS/JS前端 + Python FastAPI后端的全栈项目。项目已适配Vercel部署，支持前后端分离部署。

## 项目结构

```
直搭数字衣柜/
├── frontend/                    # 前端静态文件
│   ├── index.html
│   ├── wardrobe.html
│   ├── outfit.html
│   ├── suggestion.html
│   ├── tryon.html
│   ├── style.css
│   ├── app.js
│   ├── storage.js
│   ├── config.js                # 配置加载器
│   └── assets/
├── backend/                     # Python后端
│   ├── api/
│   │   └── index.py            # Vercel Serverless Functions入口
│   ├── main.py                  # 本地开发主文件
│   ├── requirements.txt
│   └── vercel.json             # 后端Vercel配置
├── build.bat                   # Windows构建脚本
├── build.sh                    # Linux/Mac构建脚本
├── vercel.json                 # 前端Vercel配置
├── .env.example                # 环境变量示例
├── .env.local                  # 本地环境变量
└── README.md
```

## 部署方案

### 方案一：前后端分离部署（推荐）

#### 前端部署（静态网站）
1. **部署到Vercel：**
   - 将整个项目推送到GitHub
   - 在Vercel中导入项目
   - Vercel会自动检测 `vercel.json` 配置
   - 设置环境变量（参考 `.env.example`）

2. **环境变量设置：**
   ```
   API_BASE_URL=https://your-backend-api.vercel.app/api
   DEEPSEEK_API_URL=https://api.deepseek.com/v1
   QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
   KIMI_API_URL=https://api.moonshot.cn/v1
   ```

3. **构建过程：**
   - 运行 `build.bat`（Windows）或 `build.sh`（Linux/Mac）
   - 将环境变量注入到 `env-config.js`
   - 输出到 `build/` 目录

#### 后端部署（Python Serverless Functions）
1. **部署到Vercel：**
   - 进入 `backend/` 目录
   - 运行 `vercel deploy`
   - 或通过GitHub部署 `backend/` 目录

2. **环境变量设置：**
   ```
   QWEN_API_KEY=your_qwen_api_key_here
   ```

3. **API端点：**
   - `POST /api/claude` - 调用通义千问API
   - `POST /api/ai-suggest` - 动态调用AI模型
   - `POST /api/analyze-image` - 图片分析
   - `GET /api/weather` - 天气查询
   - `GET /api/health` - 健康检查

### 方案二：前后端同域部署

1. **修改前端 `vercel.json`：**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/api/:path*"
       }
     ]
   }
   ```

2. **部署步骤：**
   - 将整个项目部署到Vercel
   - 设置Python运行时
   - 前端和后端共享同一个域名

## 本地开发

### 前端开发
```bash
cd frontend
python -m http.server 8000
```

### 后端开发
```bash
cd backend
python main.py
```

### 环境变量配置
1. 复制 `.env.example` 为 `.env.local`
2. 修改必要的API密钥和URL

## 环境变量说明

### 前端环境变量
- `API_BASE_URL`: 后端API基础URL（生产环境设为后端部署地址）
- `DEEPSEEK_API_URL`: DeepSeek API地址
- `QWEN_API_URL`: 通义千问API地址
- `DOUBAO_API_URL`: 豆包API地址
- `KIMI_API_URL`: Kimi API地址

### 后端环境变量
- `QWEN_API_KEY`: 通义千问API密钥

## 构建脚本说明

### Windows (`build.bat`)
```bash
build.bat
```

### Linux/Mac (`build.sh`)
```bash
chmod +x build.sh
./build.sh
```

构建脚本会：
1. 读取环境变量
2. 创建 `build/` 目录
3. 生成 `env-config.js` 包含环境变量
4. 复制前端文件到构建目录
5. 注入环境变量到HTML

## 注意事项

1. **CORS配置**：后端已配置允许所有来源，生产环境建议限制为前端域名
2. **API密钥安全**：不要将API密钥提交到版本控制
3. **静态资源缓存**：CSS/JS文件配置了长期缓存
4. **路由配置**：Vercel的rewrites规则确保SPA路由正常工作
5. **Python版本**：后端使用Python 3.9（Vercel支持）

## 故障排除

### 前端无法连接到后端
1. 检查 `API_BASE_URL` 环境变量
2. 确认后端服务正在运行
3. 检查浏览器控制台网络请求

### 环境变量未生效
1. 确认构建脚本正确执行
2. 检查 `env-config.js` 文件内容
3. 确认HTML正确引入了 `env-config.js`

### Python依赖问题
1. 确保 `requirements.txt` 包含所有依赖
2. 运行 `pip install -r requirements.txt`
3. 检查Python版本兼容性

## 生产环境建议

1. **启用HTTPS**：Vercel自动提供SSL证书
2. **配置域名**：绑定自定义域名
3. **监控日志**：使用Vercel的日志功能
4. **API限流**：考虑添加API调用频率限制
5. **错误处理**：完善前端错误提示

## 联系方式

如有部署问题，请参考Vercel文档或联系项目维护者。