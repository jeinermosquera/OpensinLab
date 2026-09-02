#!/bin/bash
set -e

echo "Setting up OpenSimLab development environment..."

echo ""
echo "[1/4] Installing Node.js dependencies..."
npm install

echo ""
echo "[2/4] Starting PostgreSQL database..."
docker compose up -d postgres

echo ""
echo "[3/4] Waiting for database to be ready..."
sleep 5

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "Run 'npm run dev' to start development servers."
