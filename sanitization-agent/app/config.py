import sys
import os
import json
from pathlib import Path
from .models.schemas import AgentConfig
from .utils.logger import logger

def get_config_path() -> Path:
    if getattr(sys, "frozen", False):
        exe_dir = Path(sys.executable).resolve().parent
        if (exe_dir / "agent_config.json").exists():
            return exe_dir / "agent_config.json"
        return Path.cwd() / "agent_config.json"
    return Path(__file__).resolve().parent.parent / "agent_config.json"

CONFIG_FILE_PATH = get_config_path()

DEFAULT_CONFIG = {
    "backendUrl": os.getenv("RETECH_BACKEND_URL", "https://retech-3x97.onrender.com/api/v1"),
    "agentId": os.getenv("RETECH_AGENT_ID", None),
    "agentName": os.getenv("RETECH_AGENT_NAME", "ReTech Local Agent Node"),
    "apiKey": os.getenv("RETECH_AGENT_KEY", None),
    "dryRunMode": os.getenv("RETECH_DRY_RUN", "true").lower() in ("true", "1", "yes"),
    "pollIntervalSeconds": int(os.getenv("RETECH_POLL_INTERVAL", "10")),
}

def load_config() -> AgentConfig:
    config_path = get_config_path()
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = {**DEFAULT_CONFIG, **data}
                return AgentConfig(**merged)
        except Exception as e:
            logger.warning(f"Failed to read {config_path}: {e}. Using defaults.")
    return AgentConfig(**DEFAULT_CONFIG)

def save_config(config: AgentConfig) -> bool:
    config_path = get_config_path()
    try:
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config.model_dump(), f, indent=2)
        logger.info(f"Agent configuration saved to {config_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save agent configuration: {e}")
        return False
        logger.error(f"Failed to save agent configuration: {e}")
        return False

