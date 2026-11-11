@echo off
TITLE ReTech Development Environment Launcher
COLOR 0A

echo ================================================================
echo   RETECH - SMART E-WASTE & DATA SANITIZATION PLATFORM
echo ================================================================
echo.
echo [1/4] Checking and starting MongoDB service...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       MongoDB service is active.
) else (
    echo       MongoDB service already running or requires manual start.
)

echo.
echo [2/4] Launching ReTech Backend (Port 5000)...
start "ReTech Backend API [5000]" cmd /k "cd backend && pnpm dev"

echo.
echo [3/4] Launching ReTech Frontend (Port 5173)...
start "ReTech Frontend Web [5173]" cmd /k "cd frontend && pnpm dev"

echo.
echo [4/4] Launching Python Sanitization Agent (Port 8765)...
start "ReTech Python Agent [8765]" cmd /k "cd sanitization-agent && python run_agent.py"

echo.
echo ================================================================
echo   All ReTech services are launching in dedicated windows!
echo   Opening browser at http://localhost:5173 ...
echo ================================================================
timeout /t 3 >nul
start http://localhost:5173

