# 直搭数字衣柜

直搭数字衣柜是一个本地优先的轻量级衣橱管理和穿搭推荐项目。它可以录入衣物、维护分类与风格、按天气生成今日穿搭、输出搭配建议，并提供一个 2D 试衣间用于快速检查单品组合。

## 核心功能

- 衣橱管理：上传衣物图片，记录名称、分类、颜色、风格、季节和穿着次数。
- 今日穿搭：查询城市天气，并根据衣橱数据生成可直接穿的组合。
- 搭配建议：无 API Key 时使用本地规则生成建议；填写 OpenAI 兼容 API Key 后可调用模型增强。
- 试衣间：把单品放到 2D 试衣板上，快速检查颜色和层次。
- 数据维护：支持本地 LocalStorage、示例数据恢复、JSON 导入和导出。
- 部署友好：静态前端位于 `public/`，后端 API 位于 `backend/` 和 `api/`。

## 技术栈

- 前端：原生 HTML、CSS、JavaScript
- 存储：浏览器 LocalStorage
- 后端：FastAPI、Uvicorn、httpx、OpenAI Python SDK
- 部署：Vercel 静态页面 + Python Serverless API，也可部署到支持 Python 的平台

## 本地运行

安装前端校验依赖：

```bash
npm install
```

安装后端依赖：

```bash
pip install -r requirements.txt
```

启动完整后端和静态站点：

```bash
npm run dev
```

访问：

```text
http://localhost:8001
```

只预览静态前端：

```bash
npm start
```

访问：

```text
http://localhost:8000
```

静态模式下天气和 AI API 会自动回退到本地演示逻辑，页面仍可操作。

## 构建与检查

```bash
npm run build
npm run lint
npm run typecheck
```

当前项目没有打包步骤，`build/lint/typecheck` 会执行 `scripts/validate.js`，检查：

- `public/` 关键页面和静态资源是否存在
- HTML `<script>` 标签是否闭合
- 页面是否引用公共 CSS/JS
- 公共 JS 是否能通过语法解析

## 环境变量

复制 `.env.example` 为 `.env` 或 `.env.local`，按需填写：

```bash
BACKEND_PORT=8001
CORS_ALLOW_ORIGINS=*
QWEN_API_KEY=
QWEN_MODEL=qwen-plus
QWEN_VL_MODEL=qwen-vl-plus
```

`QWEN_API_KEY` 为空时，后端不会报错，会返回本地兜底结果，保证演示可用。

## 部署说明

### Vercel

项目已包含 `vercel.json`：

- 静态页面从 `public/` 发布
- API 入口为 `api/index.py`
- `/api/*` 转发到 FastAPI

部署前请在 Vercel 环境变量中配置 `QWEN_API_KEY`（可选）。

### Cloudflare Pages / Netlify

如果只部署静态版：

- Publish directory: `public`
- Build command: `npm run build`

静态部署没有后端 API，但前端已内置天气和 AI 的本地兜底，仍可演示核心流程。

## 项目结构

```text
public/          部署用静态前端
frontend/        前端源码镜像，便于本地查看和继续维护
backend/main.py  FastAPI 本地服务和 API 实现
api/index.py     Vercel Python API 入口
scripts/         项目校验脚本
```

## 已知问题

- 图片识别依赖 `QWEN_API_KEY`，未配置时只能填充本地默认结果。
- 试衣间是 2D 试衣板，不再依赖原先不稳定的 FBX/Three.js 加载链路。
- LocalStorage 数据只保存在当前浏览器，跨设备同步需要后续接入账号或数据库。

## 后续优化方向

- 增加真实数据库和账号体系，实现多设备同步。
- 为衣物图片增加压缩、裁剪和背景清理。
- 将穿搭推荐拆成可测试的规则引擎，并引入自动化单元测试。
- 增加更细的颜色体系、场合标签和换季整理视图。
- 增加 CI，在 PR 中自动运行 `npm run build` 和后端导入检查。
