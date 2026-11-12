#!/bin/bash
echo "========================================================"
echo "  ReTech: Smart E-Waste & Data Sanitization Platform"
echo "  Launching Complete Dockerized Stack..."
echo "========================================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    echo "Please install Docker from https://www.docker.com/"
    exit 1
fi

echo "Starting MongoDB, ReTech Backend API, and Frontend..."
docker compose up -d --build

echo ""
echo "========================================================"
echo "  ReTech is running!"
echo "========================================================"
echo "  - Web Application: http://localhost (or http://localhost:5173)"
echo "  - Backend API:     http://localhost:5000/api/v1"
echo "  - Admin Login:     admin@retech.in / Admin@ReTech2026!"
echo "  - Customer Login:  customer@retech.in / Customer@2026!"
echo "========================================================"
echo ""
