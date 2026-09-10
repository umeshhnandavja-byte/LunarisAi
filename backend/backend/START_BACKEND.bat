@echo off
title LUNARIS — Python Backend
color 0B

echo.
echo  ============================================
echo   LUNARIS — Python Backend Server
echo  ============================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [ERROR] Python is NOT installed!
    echo.
    echo  Please download and install Python from:
    echo  https://www.python.org/downloads/
    echo  (Make sure to check "Add Python to PATH" during install)
    echo.
    pause
    exit /b 1
)

echo  [OK] Python found:
python --version
echo.

REM Install Python dependencies
echo  [INFO] Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] pip install failed.
    echo  Try running: pip install flask flask-cors opencv-python numpy Pillow scipy
    pause
    exit /b 1
)

echo.
echo  [OK] Dependencies installed!
echo.
echo  [INFO] Starting backend server at http://localhost:5001
echo.
echo  ============================================
echo   Keep this window open while using Lunaris
echo   Press Ctrl+C to stop the backend
echo  ============================================
echo.

python app.py
pause
