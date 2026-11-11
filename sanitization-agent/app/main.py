"""
FastAPI Local Sanitization Agent Service.
Provides local diagnostics, drive inspection, pairing triggers, and background poller.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List

from .config import load_config
from .services.device_discovery import discover_storage_drives
from .services.authentication import pair_with_backend
from .services.job_runner import send_heartbeat, poll_and_process_jobs
from .security.operation_allowlist import get_all_supported_capabilities
from .utils.logger import logger

class PairPayload(BaseModel):
    pairingCode: str
    agentName: Optional[str] = None

# Background polling worker
async def background_poll_loop():
    logger.info("Starting background agent polling & heartbeat worker...")
    while True:
        try:
            config = load_config()
            if config.agentId and config.apiKey:
                send_heartbeat()
                poll_and_process_jobs()
            await asyncio.sleep(config.pollIntervalSeconds)
        except asyncio.CancelledError:
            logger.info("Background polling loop stopped.")
            break
        except Exception as e:
            logger.error(f"Error in background poll loop: {e}")
            await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: spawn background poller task
    task = asyncio.create_task(background_poll_loop())
    yield
    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="ReTech Local Sanitization Agent",
    description="Local secure storage discovery, cryptographic data sanitization and verification engine.",
    version="1.0.0",
    lifespan=lifespan,
)

@app.get("/")
def get_agent_status():
    config = load_config()
    drives = discover_storage_drives()
    return {
        "status": "ONLINE",
        "service": "ReTech Local Sanitization Agent",
        "version": "1.0.0",
        "agentId": config.agentId or "UNPAIRED",
        "agentName": config.agentName,
        "isPaired": bool(config.agentId and config.apiKey),
        "dryRunMode": config.dryRunMode,
        "backendUrl": config.backendUrl,
        "discoveredDrivesCount": len(drives),
        "capabilities": get_all_supported_capabilities(),
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": asyncio.get_event_loop().time()}

@app.get("/drives")
def list_drives():
    drives = discover_storage_drives()
    return {
        "count": len(drives),
        "drives": [d.model_dump() for d in drives],
    }

@app.post("/pair")
def trigger_pairing(payload: PairPayload):
    success = pair_with_backend(payload.pairingCode, custom_name=payload.agentName)
    if not success:
        raise HTTPException(status_code=400, detail="Pairing failed. Check pairing code or backend connectivity.")
    config = load_config()
    return {
        "success": True,
        "message": "Agent paired successfully.",
        "agentId": config.agentId,
        "agentName": config.agentName,
    }

@app.post("/sync")
def force_sync():
    config = load_config()
    if not config.agentId or not config.apiKey:
        raise HTTPException(status_code=400, detail="Cannot sync: Agent is not paired.")
    
    send_heartbeat()
    processed = poll_and_process_jobs()
    return {
        "success": True,
        "message": f"Sync completed. Processed {processed} jobs.",
        "processedJobs": processed,
    }

