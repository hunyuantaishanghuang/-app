#!/usr/bin/env bash
# 老年人体检阳性体征筛查系统 - 本地启动脚本
cd "$(dirname "$0")" || exit

echo "========================================================"
echo "    老年人体检阳性体征筛查系统 (完全离线本地版)"
echo "========================================================"
echo ""

if command -v node >/dev/null 2>&1; then
    echo "[✓] 检测到电脑已安装 Node.js！"
    if [ ! -d "node_modules" ]; then
        echo "[*] 正在安装本地依赖包..."
        npm install
    fi
    echo "[*] 启动本地服务器..."
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:3000" &
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:3000" &
    fi
    npm run dev
else
    echo "[提示] 未检测到 Node.js 环境，直接为您在浏览器打开完全免安装的离线版..."
    if command -v open >/dev/null 2>&1; then
        open "双击直接离线使用_免安装版.html"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "双击直接离线使用_免安装版.html"
    fi
fi
