Set-Location $PSScriptRoot
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " OpenSimLab - Iniciando..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Host "[ERROR] Node.js no encontrado" -ForegroundColor Red; pause; exit 1 }
if (-not (Test-Path "node_modules")) {
  Write-Host "[1/2] Instalando dependencias..." -ForegroundColor Yellow
  npm install; if ($LASTEXITCODE -ne 0) { pause; exit 1 }
} else { Write-Host "[1/2] Dependencias OK" -ForegroundColor Green }
Write-Host "[2/2] Iniciando en http://localhost:3000 ..." -ForegroundColor Green
Write-Host "Deja esta ventana abierta. Ctrl+C para detener." -ForegroundColor DarkGray
npm run dev:web
