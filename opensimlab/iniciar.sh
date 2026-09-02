#!/bin/bash
cd "$(dirname "$0")"
echo "========================================"
echo " OpenSimLab - Iniciando..."
echo "========================================"
command -v npm >/dev/null 2>&1 || { echo "[ERROR] Node.js no encontrado"; exit 1; }
[ -d "node_modules" ] || { echo "[1/2] Instalando dependencias..."; npm install || exit 1; }
echo "[2/2] Iniciando en http://localhost:3000 ..."
npm run dev:web
