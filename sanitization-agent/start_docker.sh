#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "      RETECH SANITIZATION AGENT - DOCKER ZERO-INSTALL MODE"
echo "======================================================================"
echo "[INFO] Python 3.12 is bundled inside Docker. No host Python needed!"

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed. Please install Docker or use ./start.sh with Python."
    exit 1
fi

docker build -t retech-sanitization-agent .
if [ -f host_hardware.json ]; then
    docker run -it --rm -p 8000:8000 -v "$(pwd)/host_hardware.json:/app/host_hardware.json:ro" --name retech-agent-node retech-sanitization-agent python run_agent.py --menu
else
    docker run -it --rm -p 8000:8000 --name retech-agent-node retech-sanitization-agent python run_agent.py --menu
fi
