"""
Outbound Job Polling & Execution Loop.
Communicates outbound to backend, claims pending tasks, executes sanitization, and posts cryptographic results.
"""
import time
import json
import platform
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
from ..config import load_config
from ..services.authentication import get_auth_headers
from ..services.device_discovery import discover_storage_drives
from ..security.operation_allowlist import get_all_supported_capabilities
from ..services.sanitization import execute_sanitization_job
from ..utils.logger import logger

def send_heartbeat() -> bool:
    """Send periodic heartbeat with discovered storage drives."""
    config = load_config()
    if not config.agentId or not config.apiKey:
        logger.warning("Heartbeat skipped: Agent is not paired yet.")
        return False

    backend_url = config.backendUrl.rstrip("/")
    heartbeat_url = f"{backend_url}/agent/heartbeat"
    headers = get_auth_headers()

    drives = discover_storage_drives()
    payload = {
        "hostname": platform.node(),
        "platform": f"{platform.system()} {platform.release()}",
        "agentVersion": "1.0.0",
        "supportedCapabilities": get_all_supported_capabilities(),
        "discoveredDrives": [d.model_dump() for d in drives],
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(heartbeat_url, headers=headers, json=payload)
            if res.status_code == 200:
                logger.info(f"Heartbeat sent successfully to backend.")
                return True
            else:
                logger.warning(f"Heartbeat rejected [{res.status_code}]: {res.text}")
                return False
    except Exception as e:
        logger.warning(f"Heartbeat connection error: {e}")
        return False

def claim_job(job_id: str) -> bool:
    config = load_config()
    url = f"{config.backendUrl.rstrip('/')}/agent/jobs/{job_id}/claim"
    headers = get_auth_headers()
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, headers=headers)
            return res.status_code == 200
    except Exception as e:
        logger.error(f"Error claiming job {job_id}: {e}")
        return False

def post_job_event(job_id: str, status: str, progress: int, logs: List[Dict[str, Any]] = None):
    config = load_config()
    url = f"{config.backendUrl.rstrip('/')}/agent/jobs/{job_id}/events"
    headers = get_auth_headers()
    payload = {
        "status": status,
        "progressPercent": progress,
        "logs": logs or [],
    }
    try:
        clean_payload = json.loads(json.dumps(payload, default=str))
        with httpx.Client(timeout=10.0) as client:
            client.post(url, headers=headers, json=clean_payload)
    except Exception as e:
        logger.error(f"Error posting job event for {job_id}: {e}")

def post_job_results(
    job_id: str,
    status: str,
    verification_dict: Dict[str, Any],
    logs: List[Dict[str, Any]],
    failure_reason: str = "",
) -> bool:
    config = load_config()
    url = f"{config.backendUrl.rstrip('/')}/agent/jobs/{job_id}/results"
    headers = get_auth_headers()
    payload = {
        "status": status,
        "verificationResult": verification_dict,
        "logs": logs,
        "failureReason": failure_reason,
    }
    try:
        clean_payload = json.loads(json.dumps(payload, default=str))
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=clean_payload)
            if res.status_code == 200:
                logger.info(f"Sanitization result posted successfully for job {job_id} [Status: {status}]")
                return True
            else:
                logger.error(f"Failed to post results for {job_id} [{res.status_code}]: {res.text}")
                return False
    except Exception as e:
        logger.error(f"Error sending final results for {job_id}: {e}")
        return False

def poll_and_process_jobs() -> int:
    """Poll backend for available jobs, claim and execute."""
    config = load_config()
    if not config.agentId or not config.apiKey:
        return 0

    url = f"{config.backendUrl.rstrip('/')}/agent/jobs"
    headers = get_auth_headers()

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code != 200:
                logger.warning(f"Job polling failed [{res.status_code}]")
                return 0

            data = res.json()
            jobs = data.get("data", [])
            if not jobs:
                return 0

            logger.info(f"Discovered {len(jobs)} pending sanitization job(s).")
            processed_count = 0

            for job in jobs:
                job_id = job.get("jobId")
                status = job.get("status")

                # Claim if pending
                if status in ("PENDING", "AGENT_CONNECTED"):
                    logger.info(f"Claiming job {job_id}...")
                    if not claim_job(job_id):
                        logger.error(f"Could not claim job {job_id}. Skipping.")
                        continue

                # Run job
                logger.info(f"Starting execution of job {job_id}...")
                post_job_event(job_id, status="RUNNING", progress=10, logs=[
                    {"level": "INFO", "message": "Agent commenced local sanitization pipeline."}
                ])

                drive_id = job.get("targetDriveId", "PhysicalDrive1")
                method = job.get("selectedMethod", "NIST_SP_800_88_CLEAR")
                is_simulation = job.get("isSimulation", True) or config.dryRunMode

                # Find matching DriveInfo from host
                drives = discover_storage_drives()
                matched_drive = next((d for d in drives if d.driveId == drive_id), None)
                if not matched_drive and drives:
                    matched_drive = drives[0]

                post_job_event(job_id, status="RUNNING", progress=40, logs=[
                    {"level": "INFO", "message": f"Executing pass 1/1 on {drive_id} with method {method}..."}
                ])

                success, logs, verification, failure_reason = execute_sanitization_job(
                    job_id=job_id,
                    drive_id=drive_id,
                    method=method,
                    is_simulation=is_simulation,
                    target_drive_info=matched_drive,
                )

                post_job_event(job_id, status="RUNNING", progress=85, logs=[
                    {"level": "INFO", "message": "Cryptographic readback sampling and entropy calculation in progress..."}
                ])

                final_status = "VERIFIED_SUCCESSFUL" if success else "OPERATION_FAILED"
                verification_dict = verification.model_dump(mode="json") if verification else None
                formatted_logs = [l.model_dump(mode="json") for l in logs]

                post_job_results(
                    job_id=job_id,
                    status=final_status,
                    verification_dict=verification_dict,
                    logs=formatted_logs,
                    failure_reason=failure_reason,
                )
                processed_count += 1

            return processed_count
    except Exception as e:
        logger.error(f"Error during job polling: {e}")
        return 0

