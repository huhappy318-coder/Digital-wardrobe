@echo off
setlocal

set BUILD_DIR=build
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%"
xcopy frontend "%BUILD_DIR%" /E /I /Y >nul

echo Build complete: %BUILD_DIR%
