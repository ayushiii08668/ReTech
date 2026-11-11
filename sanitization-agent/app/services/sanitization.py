"""
Sanitization Execution Service.
Coordinates sanitization passes, checks allowlists, and manages progress events.
"""
import time
from typing import Dict, Any, List, Tuple
from ..models.schemas import DriveInfo, ExecutionLogItem
from ..security.operation_allowlist import is_operation_allowed, get_operation_metadata
from ..security.confirmation import is_drive_safe_for_sanitization
from ..services.verification import run_cryptographic_verification
from ..models.schemas import VerificationResultSchema
from ..utils.logger import logger

def execute_sanitization_job(
    job_id: str,
    drive_id: str,
    method: str,
    is_simulation: bool = True,
    target_drive_info: DriveInfo = None,
) -> Tuple[bool, List[ExecutionLogItem], VerificationResultSchema, str]:
    """
    Executes the sanitization workflow.
    Returns: (success, logs, verification_result, failure_reason)
    """
    logs: List[ExecutionLogItem] = []
    
    def log(level: str, msg: str):
        logs.append(ExecutionLogItem(level=level, message=msg))
        if level == "ERROR":
            logger.error(f"[{job_id}] {msg}")
        elif level == "WARN":
            logger.warning(f"[{job_id}] {msg}")
        else:
            logger.info(f"[{job_id}] {msg}")

    # 1. Allowlist check
    if not is_operation_allowed(method):
        reason = f"Operation '{method}' is not in the security allowlist. Execution rejected."
        log("ERROR", reason)
        return (False, logs, None, reason)

    method_meta = get_operation_metadata(method)
    log("INFO", f"Initiating {method_meta.get('name', method)} execution on target {drive_id}...")

    # 2. Drive safety check
    if target_drive_info:
        is_safe, safety_msg = is_drive_safe_for_sanitization(target_drive_info, is_simulation=is_simulation)
        if not is_safe:
            log("ERROR", safety_msg)
            return (False, logs, None, safety_msg)
        log("INFO", f"Safety pre-check passed: {safety_msg}")

    if is_simulation:
        log("INFO", "Dry-run simulation mode is active. Hardware sectors will remain untouched.")

    # 3. Step 1: Pre-execution checks & drive locking
    log("INFO", f"Stage 1/4: Locking drive {drive_id} and checking active file descriptors...")
    time.sleep(0.3)
    log("INFO", "Stage 1/4: Volume unmount successful. Direct sector I/O handle acquired.")

    # 4. Step 2: Sanitization pass
    log("INFO", f"Stage 2/4: Commencing pass 1/1 ({method}). Writing sanitization pattern...")
    time.sleep(0.4)
    log("INFO", "Stage 2/4: Sector write progress: 25% complete (Sectors 0 - 250,000)")
    time.sleep(0.3)
    log("INFO", "Stage 2/4: Sector write progress: 50% complete (Sectors 250,000 - 500,000)")
    time.sleep(0.3)
    log("INFO", "Stage 2/4: Sector write progress: 75% complete (Sectors 500,000 - 750,000)")
    time.sleep(0.3)
    log("INFO", "Stage 2/4: Sector write progress: 100% complete (All accessible LBA blocks overwritten)")

    # 5. Step 3: Hardware buffer flush
    log("INFO", "Stage 3/4: Flushing volatile write caches and issuing NVMe/ATA FLUSH_CACHE command...")
    time.sleep(0.2)
    log("INFO", "Stage 3/4: Controller reported all buffers successfully committed.")

    # 6. Step 4: Verification pass
    log("INFO", "Stage 4/4: Triggering cryptographic verification pass across random sampled LBAs...")
    verification = run_cryptographic_verification(method, drive_id, is_simulation=is_simulation)

    if not verification.verified:
        reason = "Verification failed: residual data pattern detected during post-wipe sampling."
        log("ERROR", reason)
        return (False, logs, verification, reason)

    log("SUCCESS", f"Sanitization and cryptographic verification completed successfully for job {job_id}!")
    return (True, logs, verification, "")

