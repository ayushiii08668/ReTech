"""
Agent Authentication & Pairing Client Service.
Exchanges single-use pairing codes with the ReTech backend for scoped API keys.
"""
import platform
import httpx
from typing import Dict, Any, Optional
from ..config import load_config, save_config
from ..services.device_discovery import discover_storage_drives
from ..security.operation_allowlist import get_all_supported_capabilities
from ..utils.logger import logger

def get_auth_headers() -> Dict[str, str]:
    config = load_config()
    headers = {"Content-Type": "application/json"}
    if config.agentId:
        headers["x-agent-id"] = config.agentId
    if config.apiKey:
        headers["x-agent-key"] = config.apiKey
    return headers

def pair_with_backend(pairing_code: str, custom_name: Optional[str] = None) -> bool:
    """Pairs the local agent with the ReTech backend using an Admin-generated pairing code."""
    config = load_config()
    backend_url = config.backendUrl.rstrip("/")
    pair_endpoint = f"{backend_url}/agent/pair"

    logger.info(f"Initiating pairing with backend at {pair_endpoint} using code {pairing_code}...")

    discovered_drives = discover_storage_drives()
    capabilities = get_all_supported_capabilities()

    payload = {
        "pairingCode": pairing_code.strip().toUpperCase() if hasattr(pairing_code, "toUpperCase") else pairing_code.strip().upper(),
        "name": custom_name or f"Agent Node ({platform.node()})",
        "hostname": platform.node(),
        "platform": f"{platform.system()} {platform.release()}",
        "agentVersion": "1.0.0",
        "supportedCapabilities": capabilities,
        "discoveredDrives": [d.model_dump() for d in discovered_drives],
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(pair_endpoint, json=payload)

            if response.status_code == 200:
                data = response.json().get("data", {})
                config.agentId = data.get("agentId")
                config.apiKey = data.get("apiKey")
                config.agentName = data.get("name", payload["name"])
                save_config(config)
                logger.info(f"Pairing SUCCESSFUL! Agent registered as ID: {config.agentId}")
                return True
            else:
                logger.error(f"Pairing failed [{response.status_code}]: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Network error during pairing with {pair_endpoint}: {e}")
        return False

