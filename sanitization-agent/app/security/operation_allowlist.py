"""
Security allowlist for ReTech Data Sanitization operations.
Strictly restricts allowed methods and prevents arbitrary command execution.
"""
from typing import Dict, Any, List

ALLOWED_OPERATIONS: Dict[str, Dict[str, Any]] = {
    "NIST_SP_800_88_CLEAR": {
        "name": "NIST SP 800-88 Rev. 1 Clear",
        "category": "LOGICAL_OVERWRITE",
        "description": "Single-pass logical sector overwrite with verification pattern to protect against simple, non-invasive recovery.",
        "passes": 1,
        "requires_unmount": True,
        "destructive": True,
    },
    "NIST_SP_800_88_PURGE": {
        "name": "NIST SP 800-88 Rev. 1 Purge",
        "category": "PHYSICAL_PURGE",
        "description": "Cryptographic key destruction or block-level purge making target data recovery infeasible using state-of-the-art laboratory techniques.",
        "passes": 1,
        "requires_unmount": True,
        "destructive": True,
    },
    "ZERO_OVERWRITE": {
        "name": "Single-Pass Zero Fill",
        "category": "BASIC_OVERWRITE",
        "description": "Sequential overwrite of every accessible block with 0x00 bytes.",
        "passes": 1,
        "requires_unmount": True,
        "destructive": True,
    },
    "RANDOM_OVERWRITE": {
        "name": "Pseudorandom Overwrite",
        "category": "RANDOM_OVERWRITE",
        "description": "Sequential overwrite of storage blocks with cryptographically secure random bytes.",
        "passes": 1,
        "requires_unmount": True,
        "destructive": True,
    },
    "NVME_CRYPTO_ERASE": {
        "name": "NVMe Cryptographic Erase",
        "category": "CRYPTO_ERASE",
        "description": "NVMe hardware crypto-scramble command clearing Master Encryption Key on self-encrypting drives.",
        "passes": 1,
        "requires_unmount": True,
        "destructive": True,
    },
    "DRY_RUN_SIMULATION": {
        "name": "Dry Run / Safe Simulation",
        "category": "SIMULATION",
        "description": "Non-destructive safe simulation of multi-pass wipe and verification without altering hardware sectors.",
        "passes": 1,
        "requires_unmount": False,
        "destructive": False,
    },
}

def is_operation_allowed(method: str) -> bool:
    """Check if the requested sanitization method is within the strict allowlist."""
    return method in ALLOWED_OPERATIONS

def get_operation_metadata(method: str) -> Dict[str, Any]:
    return ALLOWED_OPERATIONS.get(method, {})

def get_all_supported_capabilities() -> List[str]:
    return list(ALLOWED_OPERATIONS.keys())

