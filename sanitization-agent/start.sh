#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "            RETECH SECURE DATA SANITIZATION AGENT"
echo "======================================================================"

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed on this system."
    echo "Please install Python 3.10+ (e.g. sudo apt install python3 python3-venv python3-pip)"
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "Setting up Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

source .venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Environment ready! Launching ReTech Agent..."
python3 run_agent.py --menu
