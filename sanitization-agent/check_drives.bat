@echo off
cd /d "%~dp0"
title ReTech - Drive Scanner
color 0E

echo.
echo  =========================================================================
echo         RETECH - HOST DRIVE SCANNER (Read-Only, 100%% Safe)
echo  =========================================================================
echo.

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Docker is not running. Start Docker Desktop first.
    pause
    exit /b 1
)

echo  Scanning your Windows hardware drives...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0detect_drives.ps1"
echo.

copy /y "%~dp0host_hardware.json" "%TEMP%\retech_host_hardware.json" >nul

echo  Running drive audit inside Docker...
echo  -------------------------------------------------------------------------
docker run --rm ^
    --name retech-drive-scan ^
    -v "%TEMP%\retech_host_hardware.json:/app/host_hardware.json:ro" ^
    retech-sanitization-agent ^
    python run_agent.py --drives

echo.
echo  =========================================================================
echo  Scan complete! Press any key to close.
echo  =========================================================================
pause
