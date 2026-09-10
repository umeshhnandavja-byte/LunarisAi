@echo off
title LUNARIS — Team Launcher
color 0B
cls

echo ========================================================================
echo        LUNARIS: ISRO Lunar Image Registration & Analysis Platform
echo                       (Smart India Hackathon 2024)
echo ========================================================================
echo.
echo  Welcome Team Member! Choose what you want to launch:
echo.
echo   [1] Start Frontend Only (Fastest - Recommended for UI demo & presentation)
echo   [2] Start Full Stack (Both Frontend on :3000 and Python Backend on :5001)
echo   [3] Start Backend Server Only (Python Flask API)
echo   [4] Open Presentation Guide PDF
echo   [5] Exit
echo.
echo ========================================================================
set /p choice="Enter your choice (1-5) [Default is 1]: "

if "%choice%"=="" set choice=1
if "%choice%"=="1" goto start_frontend
if "%choice%"=="2" goto start_fullstack
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto open_pdf
if "%choice%"=="5" exit /b 0

echo Invalid choice. Starting Frontend by default...
pause

:start_frontend
echo.
echo Starting Lunaris Frontend...
cd /d "%~dp0lunaris"
call DOUBLE_CLICK_TO_RUN.bat
exit /b 0

:start_fullstack
echo.
echo Launching Python Backend in separate window...
start "Lunaris Backend (:5001)" cmd /c "cd /d ""%~dp0backend"" && call START_BACKEND.bat"
timeout /t 2 >nul
echo Launching Frontend...
cd /d "%~dp0lunaris"
call DOUBLE_CLICK_TO_RUN.bat
exit /b 0

:start_backend
echo.
echo Starting Python Backend...
cd /d "%~dp0backend"
call START_BACKEND.bat
exit /b 0

:open_pdf
echo.
echo Opening Presentation Guide PDF...
if exist "%~dp0lunaris\LUNARIS_SIH26166_Presentation_Guide.pdf" (
    start "" "%~dp0lunaris\LUNARIS_SIH26166_Presentation_Guide.pdf"
) else if exist "%~dp0LUNARIS_SIH26166_Presentation_Guide.pdf" (
    start "" "%~dp0LUNARIS_SIH26166_Presentation_Guide.pdf"
) else (
    echo PDF not found.
    pause
)
exit /b 0
