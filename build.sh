#!/bin/bash

# 构建脚本：将环境变量注入到HTML文件中

echo "开始构建直搭数字衣柜..."

# 创建构建目录
BUILD_DIR="build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 复制前端文件
cp -r frontend/* "$BUILD_DIR/"

# 读取环境变量
API_BASE_URL="${API_BASE_URL:-/api}"
DEEPSEEK_API_URL="${DEEPSEEK_API_URL:-https://api.deepseek.com/v1}"
QWEN_API_URL="${QWEN_API_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}"
DOUBAO_API_URL="${DOUBAO_API_URL:-https://ark.cn-beijing.volces.com/api/v3}"
KIMI_API_URL="${KIMI_API_URL:-https://api.moonshot.cn/v1}"

# 创建环境变量注入脚本
echo "// 自动生成的环境变量配置" > "$BUILD_DIR/env-config.js"
cat << EOF >> "$BUILD_DIR/env-config.js"
window.AppConfig = {
  API_BASE_URL: "$API_BASE_URL",
  DEEPSEEK_API_URL: "$DEEPSEEK_API_URL",
  QWEN_API_URL: "$QWEN_API_URL",
  DOUBAO_API_URL: "$DOUBAO_API_URL",
  KIMI_API_URL: "$KIMI_API_URL",
  DEEPSEEK_MODEL: "deepseek-chat",
  QWEN_MODEL: "qwen-plus",
  DOUBAO_MODEL: "doubao-pro-4k",
  KIMI_MODEL: "moonshot-v1-8k"
};
EOF

# 更新HTML文件以包含环境变量配置
for html_file in "$BUILD_DIR"/*.html; do
  if [ -f "$html_file" ]; then
    # 在第一个script标签前插入env-config.js
    sed -i 's|<script src="/static/config.js"></script>|<script src="/env-config.js"></script>\n    <script src="/static/config.js"></script>|' "$html_file"
  fi
done

# 复制config.js到构建目录
cp frontend/config.js "$BUILD_DIR/static/config.js"

echo "构建完成！构建目录: $BUILD_DIR"