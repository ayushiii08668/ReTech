@echo off
echo ========================================================
echo   ReTech: Smart E-Waste ^& Data Sanitization Platform
echo   Launching Complete Dockerized Stack...
echo ========================================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo and make sure Docker Desktop is open and running.
    echo.
    pause
    exit /b 1
)

echo Starting MongoDB, ReTech Backend API, and Frontend...
docker compose up -d --build

echo.
echo ========================================================
echo   ReTech is running!
echo ========================================================
echo   - Web Application: http://localhost (or http://localhost:5173)
echo   - Backend API:     http://localhost:5000/api/v1
echo   - Admin Login:     admin@retech.in / Admin@ReTech2026!
echo   - Customer Login:  customer@retech.in / Customer@2026!
echo ========================================================
echo.
pause

