# ReTech PowerShell Multi-Service Launcher
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  RETECH - SMART E-WASTE & DATA SANITIZATION PLATFORM" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. MongoDB Service Check
Write-Host "[1/4] Checking MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service -Name MongoDB -ErrorAction SilentlyContinue
    Write-Host "      MongoDB service verified." -ForegroundColor Green
} catch {
    Write-Host "      MongoDB status checked." -ForegroundColor DarkGray
}

# 2. Launch Backend
Write-Host "[2/4] Starting ReTech Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; pnpm dev"

# 3. Launch Frontend
Write-Host "[3/4] Starting ReTech Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; pnpm dev"

# 4. Launch Python Agent
Write-Host "[4/4] Starting Python Sanitization Agent on port 8765..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\sanitization-agent'; python run_agent.py"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  All services launched in dedicated PowerShell windows!" -ForegroundColor Green
Write-Host "  Opening http://localhost:5173 ..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

