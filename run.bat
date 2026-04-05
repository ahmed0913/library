@echo off
title Library System Launcher
color 0B

echo ==============================================
echo    Welcome to Library Management System
echo ==============================================
echo.

cd /d "%~dp0"

:: 1. Setup & Check Backend
if not exist "venv\Scripts\python.exe" (
    echo [*] First time setup: Creating Python virtual environment...
    python -m venv venv
    
    :: Copy .env.example if .env does not exist
    if not exist "backend\.env" if exist ".env.example" (
        copy .env.example backend\.env
    )

    echo [*] Installing Backend dependencies...
    venv\Scripts\python.exe -m pip install -r backend\requirements.txt
    
    echo [*] Initializing database with dummy data...
    venv\Scripts\python.exe backend\seed.py
    echo.
)

:: 2. Setup & Check Frontend
if not exist "frontend\node_modules\" (
    echo [*] First time setup: Installing Frontend Node.js modules...
    cd frontend
    call npm install
    cd ..
    echo.
)

:: 3. Start Backend
echo [*] Starting Backend Server (Flask)...
start "Library Backend Server" cmd /k ".\venv\Scripts\python.exe backend\run.py"

:: 4. Start Frontend
echo [*] Starting Frontend Server (Vite)...
cd frontend
start "Library Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ==============================================
echo   Services are starting up!
echo   - Backend terminal opened in new window.
echo   - Frontend terminal opened in new window.
echo.
echo   Your website: http://localhost:3000/
echo ==============================================
echo.
echo Opening your browser in a few seconds...
timeout /t 4 >nul
start http://localhost:3000/
