@echo off
setlocal enabledelayedexpansion
title ReTech Sanitization Agent (Docker Zero-Install Mode)
color 0B

echo ======================================================================
echo       RETECH SANITIZATION AGENT - DOCKER ZERO-INSTALL MODE
echo ======================================================================
echo [INFO] In Docker mode, Python 3.12 is bundled inside the container.
echo        No Python installation is required on your laptop!
echo ======================================================================

:: Check if Docker is installed and running
where docker >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Docker command not found!
    echo Please make sure Docker Desktop is installed and running,
    echo or run 'start.bat' instead to use native Python.
    echo ======================================================================
    pause
    exit /b 1
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Docker Desktop is installed but the Docker daemon is not running!
    echo Please start Docker Desktop and try again.
    echo ======================================================================
    pause
    exit /b 1
)

echo.
echo [STEP 1/3] Detecting Windows host physical storage hardware...
echo            (Bridges real drive info into Docker container safely)
echo.

:: Run the dedicated drive detection PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0detect_drives.ps1"

if not exist "%~dp0host_hardware.json" (
    echo [WARN] Could not detect drives. Creating fallback hardware info...
    echo {"Name":"C:\\","DriveType":3,"TotalSize":1000000000000,"VolumeLabel":"OS"} > "%~dp0host_hardware.json"
)

echo.
echo [STEP 2/3] Building ReTech Agent Docker image (Python 3.12 + all dependencies)...
docker build -t retech-sanitization-agent "%~dp0."

echo.
echo [STEP 3/3] Starting interactive agent container...
echo            Your real Windows drive info is mounted READ-ONLY into Docker.
echo            Docker CANNOT write to your C:\ drive. Data is 100%% safe.
echo            (Diagnostic REST API mapped to http://127.0.0.1:8000)
echo ======================================================================
docker run -it --rm -p 8000:8000 -v "%~dp0host_hardware.json:/app/host_hardware.json:ro" --name retech-agent-node retech-sanitization-agent python run_agent.py --menu

pause
