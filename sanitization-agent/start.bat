@echo off
setlocal enabledelayedexpansion
title ReTech Data Sanitization Agent
color 0A

echo ======================================================================
echo             RETECH SECURE DATA SANITIZATION AGENT
echo ======================================================================
echo Checking environment...

:: 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Python is not installed or not added to your system PATH!
        echo Please download and install Python 3.10+ from:
        echo   https://www.python.org/downloads/
        echo Make sure to CHECK "Add python.exe to PATH" during installation.
        echo ======================================================================
        pause
        exit /b 1
    )
    set PY_CMD=py
) else (
    set PY_CMD=python
)

:: 2. Check / Create Virtual Environment
if not exist ".venv\Scripts\activate.bat" (
    echo Setting up Python virtual environment (.venv)...
    %PY_CMD% -m venv .venv
    if %errorlevel% neq 0 (
        echo [WARNING] Could not create virtual environment. Running with system Python...
        set RUN_CMD=%PY_CMD%
    ) else (
        call .venv\Scripts\activate.bat
        set RUN_CMD=python
    )
) else (
    call .venv\Scripts\activate.bat
    set RUN_CMD=python
)

:: 3. Install requirements
echo Checking and installing dependencies (fastapi, uvicorn, httpx, pydantic)...
%RUN_CMD% -m pip install -r requirements.txt --quiet

:: 4. Launch Interactive Menu
echo Environment ready! Launching ReTech Agent...
echo ======================================================================
%RUN_CMD% run_agent.py --menu

pause
