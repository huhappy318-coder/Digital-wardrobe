# 数字衣橱 / ClosetAI

一个轻量级的全栈数字衣橱应用。  
你可以管理自己的衣物、在自由画布中拖拽组合穿搭，并通过统一的 AI Provider 接口获取穿搭建议。

## 项目简介

ClosetAI 是一个面向个人穿搭管理的 Web 应用，核心目标是把“衣柜管理 + 穿搭组合 + AI 建议”整合到一个简单、可运行、可扩展的产品里。

当前版本主打：

- 衣物录入、编辑、删除、筛选
- 自由画布拖拽搭配
- 本地保存衣柜和穿搭方案
- 多 AI Provider 可切换的建议接口
- 中文默认界面，支持英文切换
- 橙白色轻量化 UI

---

## 核心功能

### 1. 衣柜管理
- 添加衣物
- 编辑衣物信息
- 删除衣物
- 按分类、颜色、季节、场景筛选

### 2. 自由穿搭画布
- 将衣物拖入空白画布
- 支持拖动、缩放、旋转、图层叠加
- 删除画布中的单品
- 本地保存当前搭配方案

### 3. AI 穿搭建议
- 基于衣柜数据生成推荐
- 可结合当前画布内容生成建议
- 后端统一适配不同模型服务

### 4. 多语言支持
- 默认中文界面
- 支持手动切换英文
- 语言偏好可本地保存

---

## 技术栈

### 前端
- HTML
- CSS
- JavaScript

### 后端
- FastAPI

### 数据存储
- 浏览器 `localStorage`

### AI 接口层
- 统一 Provider 适配层
- 默认使用 `mock` 模式
- 支持扩展多个模型提供商

---

## 页面结构

- `/`：首页 / Dashboard
- `/wardrobe.html`：衣柜管理页
- `/tryon.html`：穿搭画布页
- `/outfit.html`：已保存穿搭页
- `/suggestion.html`：AI 建议与 Provider 状态页

> 说明：当前版本中，`tryon.html` 已重构为“自由穿搭画布”，不再使用旧版 3D 试衣方案。

---

## API 接口

### 健康检查
`GET /api/health`

### Provider 列表
`GET /api/providers`

### 图像分析
`POST /api/analyze-image`

### 穿搭建议
`POST /api/suggest-outfit`

### Provider 测试
`POST /api/provider/test`

---

## 本地运行

1. 安装依赖

```bash
pip install -r requirements.txt
2. 启动项目
python -m uvicorn backend.main:app --reload --port 8001
3. 打开浏览器
http://localhost:8001/
本地存储 Key

项目当前使用以下本地存储键名：

closetai_wardrobe
closetai_saved_outfits
Provider 配置

默认配置：

AI_PROVIDER=mock

当前支持的 Provider ID 包括：

mock
openai_compatible
anthropic
qwen
deepseek
kimi
doubao

你可以通过环境变量配置对应的：

Base URL
API Key
Model
测试
python -m unittest discover -s tests
项目结构
Digital-wardrobe/
├─ backend/
│  ├─ providers/
│  ├─ main.py
│  ├─ config.py
│  └─ models.py
├─ frontend/
│  ├─ css/
│  ├─ js/
│  ├─ index.html
│  ├─ wardrobe.html
│  ├─ tryon.html
│  ├─ outfit.html
│  └─ suggestion.html
├─ tests/
├─ requirements.txt
├─ .env.example
└─ README.md
当前版本说明

当前版本是一个 可运行的 V1，重点是先建立稳定的产品骨架，而不是一次性做成复杂系统。

相比旧版本，本项目做了这些调整：

去掉旧的 3D 试衣链路
改为更轻量的自由画布叠搭方式
重建前后端结构
统一 AI Provider 适配层
优化 UI，并支持中英文切换
已知限制
数据当前保存在浏览器 localStorage 中，不支持跨设备同步
AI 图像分析与建议能力依赖所选 Provider 的实际配置
画布编辑器目前是实用型 V1，不是专业设计工具
大量高分辨率图片可能占用较多本地存储空间
后续计划
更好的抠图与缩略图处理
画布吸附、对齐、锁定图层
穿搭历史与收藏
天气 / 场景联动推荐
更完善的移动端体验
云端同步与账户系统
