@echo off
REM 构建脚本：将环境变量注入到HTML文件中（Windows版本）

echo 开始构建直搭数字衣柜...

REM 创建构建目录
set BUILD_DIR=build
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%"

REM 复制前端文件
xcopy frontend "%BUILD_DIR%" /E /I /Y

REM 读取环境变量（如果没有设置，使用默认值）
if "%NEXT_PUBLIC_API_URL%"=="" set NEXT_PUBLIC_API_URL=/api
if "%NEXT_PUBLIC_DEEPSEEK_API_URL%"=="" set NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1
if "%NEXT_PUBLIC_QWEN_API_URL%"=="" set NEXT_PUBLIC_QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
if "%NEXT_PUBLIC_DOUBAO_API_URL%"=="" set NEXT_PUBLIC_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
if "%NEXT_PUBLIC_KIMI_API_URL%"=="" set NEXT_PUBLIC_KIMI_API_URL=https://api.moonshot.cn/v1

REM 创建环境变量注入脚本
echo // 自动生成的环境变量配置 > "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_API_URL = "%NEXT_PUBLIC_API_URL%"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_DEEPSEEK_API_URL = "%NEXT_PUBLIC_DEEPSEEK_API_URL%"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_QWEN_API_URL = "%NEXT_PUBLIC_QWEN_API_URL%"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_DOUBAO_API_URL = "%NEXT_PUBLIC_DOUBAO_API_URL%"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_KIMI_API_URL = "%NEXT_PUBLIC_KIMI_API_URL%"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_DEEPSEEK_MODEL = "deepseek-chat"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_QWEN_MODEL = "qwen-plus"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_DOUBAO_MODEL = "doubao-pro-4k"; >> "%BUILD_DIR%\env-config.js"
echo window.NEXT_PUBLIC_KIMI_MODEL = "moonshot-v1-8k"; >> "%BUILD_DIR%\env-config.js"

REM 复制config.js到构建目录
copy frontend\config.js "%BUILD_DIR%\static\config.js"

REM 更新HTML文件以包含环境变量配置
for %%f in ("%BUILD_DIR%\*.html") do (
  if exist "%%f" (
    REM 在head部分添加meta标签用于环境变量
    powershell -Command "(Get-Content '%%f') -replace '<head>', '<head>\n    <meta name=\"NEXT_PUBLIC_API_URL\" content=\"%NEXT_PUBLIC_API_URL%\">\n    <meta name=\"NEXT_PUBLIC_DEEPSEEK_API_URL\" content=\"%NEXT_PUBLIC_DEEPSEEK_API_URL%\">\n    <meta name=\"NEXT_PUBLIC_QWEN_API_URL\" content=\"%NEXT_PUBLIC_QWEN_API_URL%\">\n    <meta name=\"NEXT_PUBLIC_DOUBAO_API_URL\" content=\"%NEXT_PUBLIC_DOUBAO_API_URL%\">\n    <meta name=\"NEXT_PUBLIC_KIMI_API_URL\" content=\"%NEXT_PUBLIC_KIMI_API_URL%\">' | Set-Content '%%f'"
  )
)

echo 构建完成！构建目录: %BUILD_DIR%