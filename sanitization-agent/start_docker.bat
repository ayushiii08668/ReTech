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

echo Detecting Windows host storage hardware for safe inspection...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady } | Select-Object Name, DriveType, TotalSize, VolumeLabel | ConvertTo-Json -Compress | Out-File -FilePath host_hardware.json -Encoding utf8"

echo Building ReTech Agent Docker image (contains Python 3.12 & all dependencies)...
docker build -t retech-sanitization-agent .

echo Starting interactive agent container...
echo (Diagnostic REST API mapped to http://127.0.0.1:8000)
echo ======================================================================
docker run -it --rm -p 8000:8000 -v "%cd%/host_hardware.json:/app/host_hardware.json:ro" --name retech-agent-node retech-sanitization-agent python run_agent.py --menu

pause
