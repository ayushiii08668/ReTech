@echo off
cd /d "%~dp0"
title ReTech Agent - Status Checker
color 0A

echo.
echo  =========================================================================
echo         RETECH AGENT STATUS CHECKER
echo  =========================================================================
echo.

:: ── Check if container is running ───────────────────────────────────────────
echo  [1] Checking if ReTech Agent container is running...
docker ps --filter "name=retech-agent-node" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul
echo.

:: ── Check REST API health ────────────────────────────────────────────────────
echo  [2] Checking REST API health at http://127.0.0.1:8000/health ...
curl -s --connect-timeout 3 http://127.0.0.1:8000/health 2>nul
if %errorlevel% neq 0 (
    echo  [INFO] REST API not responding - agent menu mode is active (normal)
    echo         Start the API: press [6] in the agent menu window first.
)
echo.

:: ── Check agent config ───────────────────────────────────────────────────────
echo  [3] Agent config (agent_config.json):
if exist "%~dp0agent_config.json" (
    type "%~dp0agent_config.json"
) else (
    echo  [INFO] agent_config.json not found yet (created after pairing).
)
echo.

:: ── Check host hardware ──────────────────────────────────────────────────────
echo  [4] Detected host hardware (host_hardware.json):
if exist "%~dp0host_hardware.json" (
    type "%~dp0host_hardware.json"
) else (
    echo  [INFO] host_hardware.json not found. Run start_docker.bat first.
)
echo.

:: ── Useful commands ──────────────────────────────────────────────────────────
echo  =========================================================================
echo   USEFUL COMMANDS (run in any Command Prompt):
echo  =========================================================================
echo.
echo   See agent logs (live):
echo     docker logs -f retech-agent-node
echo.
echo   Run drive scan only (no menu):
echo     docker exec retech-agent-node python run_agent.py --drives
echo.
echo   Open Swagger REST API:
echo     start http://127.0.0.1:8000/docs
echo.
echo   Stop the agent container:
echo     docker stop retech-agent-node
echo.
echo   List all Docker containers:
echo     docker ps -a
echo.
echo   Remove old Docker image (to force fresh rebuild):
echo     docker rmi retech-sanitization-agent
echo  =========================================================================
echo.
pause
