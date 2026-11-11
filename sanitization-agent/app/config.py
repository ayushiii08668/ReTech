import os
import json
from pathlib import Path
from .models.schemas import AgentConfig
from .utils.logger import logger

CONFIG_FILE_PATH = Path(__file__).resolve().parent.parent / "agent_config.json"

DEFAULT_CONFIG = {
    "backendUrl": os.getenv("RETECH_BACKEND_URL", "http://localhost:5000/api/v1"),
    "agentId": os.getenv("RETECH_AGENT_ID", None),
    "agentName": os.getenv("RETECH_AGENT_NAME", "ReTech Local Agent Node"),
    "apiKey": os.getenv("RETECH_AGENT_KEY", None),
    "dryRunMode": os.getenv("RETECH_DRY_RUN", "true").lower() in ("true", "1", "yes"),
    "pollIntervalSeconds": int(os.getenv("RETECH_POLL_INTERVAL", "10")),
}

def load_config() -> AgentConfig:
    if CONFIG_FILE_PATH.exists():
        try:
            with open(CONFIG_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = {**DEFAULT_CONFIG, **data}
                return AgentConfig(**merged)
        except Exception as e:
            logger.warning(f"Failed to read agent_config.json: {e}. Using defaults.")
    return AgentConfig(**DEFAULT_CONFIG)

def save_config(config: AgentConfig) -> bool:
    try:
        with open(CONFIG_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(config.model_dump(), f, indent=2)
        logger.info(f"Agent configuration saved to {CONFIG_FILE_PATH}")
        return True
    except Exception as e:
        logger.error(f"Failed to save agent configuration: {e}")
        return False

