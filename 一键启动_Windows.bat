@echo off
chcp 65001 >nul
title 老年人体检阳性体征筛查系统 - 本地启动器
echo ========================================================
echo     老年人体检阳性体征筛查系统 (完全离线本地版)
echo ========================================================
echo.
echo [*] 正在检查运行环境...
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] 检测到电脑已安装 Node.js！
    echo [*] 准备启动完整开发服务器 (React + Vite)...
    if not exist node_modules (
        echo [*] 首次启动，正在安装本地依赖包，请稍候...
        call npm install
    )
    echo [*] 正在打开浏览器 (http://localhost:3000)...
    start http://localhost:3000
    call npm run dev
    goto finish
)

echo [提示] 当前电脑未检测到 Node.js 环境。
echo [提示] 系统自动为您切换至【100% 免安装纯离线版】（功能完整，可解析公卫Excel多表及导出清单）！
echo [*] 正在使用默认浏览器直接打开...
start 双击直接离线使用_免安装版.html

:finish
echo.
echo 程序运行中... 若需关闭请直接关闭本窗口。
pause
