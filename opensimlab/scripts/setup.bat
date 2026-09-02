@echo off
echo Setting up OpenSimLab development environment...

echo.
echo [1/4] Installing Node.js dependencies...
call npm install

echo.
echo [2/4] Starting PostgreSQL database...
docker compose up -d postgres

echo.
echo [3/4] Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Setup complete!
echo.
echo Run 'npm run dev' to start development servers.
