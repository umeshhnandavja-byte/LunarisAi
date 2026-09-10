@echo off
title LUNARIS — ISRO Lunar App Launcher
color 0A
cls

echo =========================================================
echo   LUNARIS — ISRO Lunar Image Registration Project
echo =========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    color 0C
    echo [X] Node.js is NOT installed on this computer!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node --version
echo.

REM Clean up any stale lock files from previous runs
if exist ".next\dev\logs" (
    rmdir /s /q ".next\dev\logs" 2>nul
)

REM Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [!] First time setup - installing dependencies...
    echo [!] This takes 1-2 minutes. Please wait...
    echo.
    call npm install
    if errorlevel 1 (
        color 0C
        echo.
        echo [X] Installation failed. Check internet connection.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
)

echo [>] Starting Lunaris web server on http://localhost:3000 ...
echo.
echo =========================================================
echo   Opening web browser automatically...
echo   KEEP THIS WINDOW OPEN while using the application.
echo   To stop the server, press Ctrl + C or close this window.
echo =========================================================
echo.

REM Open browser after 2 seconds
start http://localhost:3000

REM Run dev server
call npm run dev

echo.
color 0E
echo =========================================================
echo   Server stopped. Press any key to exit...
echo =========================================================
echo.
pause
