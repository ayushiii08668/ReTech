"""
System Safety Guard & OS Protection Module.
Guarantees that active operating system drives cannot be wiped in-OS.
"""
from typing import Tuple
from ..models.schemas import DriveInfo
from ..utils.logger import logger

def is_drive_safe_for_sanitization(
    drive: DriveInfo,
    is_simulation: bool = False,
) -> Tuple[bool, str]:
    """
    Evaluates whether a target storage drive is safe to sanitize.
    
    CRITICAL SAFETY RULES:
    1. Active OS Drive: A drive marked as isSystemDrive=True can NEVER be wiped in-OS.
       Attempting to erase the boot drive from inside the running OS causes instant blue-screen / kernel panic
       and leaves the device in an undefined, corrupted state without verifiable evidence.
    2. Simulation mode: Allows execution in dry-run/mock mode only, clearly segregated.
    """
    if is_simulation:
        return (
            True,
            "Operation approved: Dry-run non-destructive simulation mode selected.",
        )

    # Active system drive protection check
    if drive.isSystemDrive:
        msg = (
            f"SAFETY LOCK TRIGGERED: Target drive {drive.driveId} ({drive.model}) is identified as the "
            f"Active Operating System / Boot drive. In-OS drive erasure is blocked to prevent host destruction. "
            f"Boot into ReTech Bare-Metal Live USB environment to sanitize this system disk."
        )
        logger.error(msg)
        return (False, msg)

    # Allowlist of target drive identifiers
    if not drive.driveId or drive.driveId.strip() == "":
        return (False, "Invalid target drive ID specified.")

    return (
        True,
        f"Drive {drive.driveId} ({drive.model}) validated as non-system auxiliary/secondary storage. Safe for sanitization.",
    )

