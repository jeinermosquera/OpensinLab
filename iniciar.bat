@echo off
title OpenSimLab
cd /d "%~dp0"
echo ========================================
echo  OpenSimLab - Iniciando...
echo ========================================
echo.
where npm >nul 2>nul || (echo [ERROR] Node.js no encontrado. Instala Node 18+ desde https://nodejs.org & pause & exit /b 1)
if not exist "node_modules" (
  echo [1/2] Instalando dependencias...
  call npm install || (echo [ERROR] npm install fallo & pause & exit /b 1)
) else (
  echo [1/2] Dependencias OK
)
echo [2/2] Iniciando servidor en http://localhost:3000 ...
echo.
echo Deja esta ventana abierta. Cierra con Ctrl+C o cerrando la ventana.
echo.
call npm run dev:web
pause
