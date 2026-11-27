@echo off
title MYRA AI Launcher
color 0C
echo ==========================================
echo       MYRA AI - SYSTEM BOOTING
echo ==========================================
echo.

if not exist node_modules (
    echo [1/3] Installing required packages... Please wait.
    call npm install
) else (
    echo [1/3] Packages already installed.
)

echo.
echo [2/3] Building MYRA AI Interface...
call npm run build

echo.
echo [3/3] Launching MYRA AI Desktop App...
call npm run electron

pause
