@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title ReTech Secure Data Sanitization Agent
color 0B

echo.
echo  =========================================================================
echo         RETECH SECURE DATA SANITIZATION AGENT - DOCKER MODE
echo  =========================================================================
echo  [INFO] Double-click mode detected. Opening in this window...
echo  [INFO] Python 3.12 is bundled inside Docker - no installation needed!
echo  =========================================================================
echo.

:: ── STEP 0: Check Docker ────────────────────────────────────────────────────
where docker >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Docker Desktop is NOT installed on this PC!
    echo.
    echo  Please install it from: https://www.docker.com/products/docker-desktop
    echo  After installing, restart this PC and double-click start_docker.bat again.
    echo.
    pause
    exit /b 1
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Docker Desktop is not running!
    echo.
    echo  Please open Docker Desktop from your Start Menu,
    echo  wait for the green "Engine Running" icon, then run this file again.
    echo.
    pause
    exit /b 1
)

echo  [OK] Docker Desktop is running.
echo.

:: ── STEP 1: Detect Windows physical drives ──────────────────────────────────
echo  [STEP 1/3] Scanning your Windows hardware drives...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0detect_drives.ps1"

if not exist "%~dp0host_hardware.json" (
    echo  [WARN] Drive detection failed. Using fallback hardware profile...
    echo [{"Name":"C:\\","DriveType":3,"TotalSize":1000000000000,"VolumeLabel":"OS"}] > "%~dp0host_hardware.json"
)
echo.

:: ── STEP 2: Build Docker image ───────────────────────────────────────────────
echo  [STEP 2/3] Preparing clean build context and building Docker image...
echo  -------------------------------------------------------------------------
set "BUILD_DIR=%TEMP%\retech_agent_build"
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%" >nul 2>nul
mkdir "%BUILD_DIR%" >nul 2>nul
mkdir "%BUILD_DIR%\app" >nul 2>nul

:: Copy clean source files to local temp folder (completely bypasses OneDrive reparse points)
xcopy /s /e /y /q "%~dp0app\*" "%BUILD_DIR%\app\" >nul
copy /y "%~dp0Dockerfile" "%BUILD_DIR%\" >nul
copy /y "%~dp0requirements.txt" "%BUILD_DIR%\" >nul
copy /y "%~dp0run_agent.py" "%BUILD_DIR%\" >nul
copy /y "%~dp0agent_config.json" "%BUILD_DIR%\" >nul
copy /y "%~dp0create_test_photos.py" "%BUILD_DIR%\" >nul
copy /y "%~dp0wipe_test_photos.py" "%BUILD_DIR%\" >nul

docker build -t retech-sanitization-agent "%BUILD_DIR%"
set BUILD_STATUS=%errorlevel%

:: Clean up temp build folder
rd /s /q "%BUILD_DIR%" >nul 2>nul

if %BUILD_STATUS% neq 0 (
    color 0C
    echo.
    echo  [ERROR] Docker build failed! Check your internet connection and try again.
    pause
    exit /b 1
)

:: Copy host_hardware.json to clean local temp location for reliable container mounting
copy /y "%~dp0host_hardware.json" "%TEMP%\retech_host_hardware.json" >nul

:: ── STEP 3: Start agent ──────────────────────────────────────────────────────
echo.
echo  =========================================================================
echo  [STEP 3/3] Launching ReTech Agent...
echo.
echo   * Your Windows drive info is passed to Docker (READ-ONLY - 100%% safe)
echo   * Docker CANNOT modify your C:\ drive or personal files
echo   * REST API available at: http://127.0.0.1:8000/docs
echo   * To check agent status from ANOTHER CMD window, run: check_status.bat
echo  =========================================================================
echo.

docker run -it --rm ^
    -p 8000:8000 ^
    --name retech-agent-node ^
    -v "%TEMP%\retech_host_hardware.json:/app/host_hardware.json:ro" ^
    retech-sanitization-agent ^
    python run_agent.py --menu

echo.
echo  =========================================================================
echo  ReTech Agent has exited. Press any key to close this window.
echo  =========================================================================
pause
