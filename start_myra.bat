@echo off
title MYRA AI Setup
echo ==========================================
echo       MYRA AI - AUTO SETUP & LAUNCH
echo ==========================================
echo.

if not exist node_modules (
    echo [1/2] Installing required packages... Please wait.
    call npm install
) else (
    echo [1/2] Packages already installed.
)

echo.
echo [2/2] Starting MYRA AI... Please wait.
echo.
call npm run dev

pause
