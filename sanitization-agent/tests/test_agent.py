"""
Phase 5 Python Local Agent Test Suite.
Verifies:
- Security Allowlist & Arbitrary Command Prevention
- Operating System & System Drive Protection Safeguards
- Shannon Entropy & Cryptographic Verification Calculations
- Dry-Run Simulation vs Destructive Execution Segregation
- FastAPI Health & Discovery Endpoints
"""
import pytest
from app.security.operation_allowlist import is_operation_allowed, ALLOWED_OPERATIONS
from app.security.confirmation import is_drive_safe_for_sanitization
from app.services.verification import calculate_shannon_entropy, run_cryptographic_verification
from app.services.sanitization import execute_sanitization_job
from app.models.schemas import DriveInfo


def test_operation_allowlist_allowed():
    """Verify that only authorized, documented NIST SP 800-88 and wiping methods are permitted."""
    assert is_operation_allowed("NIST_SP_800_88_CLEAR") is True
    assert is_operation_allowed("NIST_SP_800_88_PURGE") is True
    assert is_operation_allowed("ZERO_OVERWRITE") is True
    assert is_operation_allowed("RANDOM_OVERWRITE") is True
    assert is_operation_allowed("NVME_CRYPTO_ERASE") is True
    assert is_operation_allowed("DRY_RUN_SIMULATION") is True


def test_operation_allowlist_blocks_arbitrary_commands():
    """Verify arbitrary shell or destructive commands outside the allowlist are strictly blocked."""
    assert is_operation_allowed("rm -rf /") is False
    assert is_operation_allowed("format C: /fs:NTFS") is False
    assert is_operation_allowed("dd if=/dev/urandom of=/dev/sda") is False
    assert is_operation_allowed("DROP_DATABASE") is False
    assert is_operation_allowed("") is False
    assert is_operation_allowed("CUSTOM_SHELL_COMMAND") is False


def test_system_drive_safety_guard_blocks_os_erasure():
    """Verify that in-OS sanitization of the active boot/system drive is hard-blocked."""
    system_drive = DriveInfo(
        driveId="DRV-SYS-0",
        model="Samsung SSD 980 PRO 1TB",
        serial="S5GXNF0R123456",
        capacityBytes=1000204886016,
        capacityHuman="1.0 TB",
        storageType="NVMe SSD",
        interface="PCIe 4.0 x4",
        isSystemDrive=True,
        mountPoints=["C:\\", "/"],
        healthStatus="PASSED",
    )
    
    # Destructive wipe on active OS drive MUST be blocked
    is_safe, reason = is_drive_safe_for_sanitization(system_drive, is_simulation=False)
    assert is_safe is False
    assert "SAFETY LOCK TRIGGERED" in reason
    assert "Active Operating System" in reason


def test_secondary_auxiliary_drive_is_permitted():
    """Verify that non-system secondary drives pass the safety pre-check."""
    secondary_drive = DriveInfo(
        driveId="DRV-AUX-1",
        model="Crucial MX500 500GB",
        serial="2048E4410299",
        capacityBytes=500107862016,
        capacityHuman="500 GB",
        storageType="SATA SSD",
        interface="SATA 6Gb/s",
        isSystemDrive=False,
        mountPoints=["D:\\"],
        healthStatus="PASSED",
    )
    
    is_safe, reason = is_drive_safe_for_sanitization(secondary_drive, is_simulation=False)
    assert is_safe is True
    assert "validated as non-system" in reason


def test_simulation_mode_is_safe_and_segregated():
    """Verify that dry-run simulation mode allows execution safely without touching hardware."""
    system_drive = DriveInfo(
        driveId="DRV-SYS-0",
        model="Test Boot Drive",
        capacityBytes=512000000000,
        isSystemDrive=True,
    )
    
    is_safe, reason = is_drive_safe_for_sanitization(system_drive, is_simulation=True)
    assert is_safe is True
    assert "Dry-run non-destructive simulation mode" in reason


def test_shannon_entropy_calculation():
    """Verify Shannon entropy mathematics: zero-bytes = 0.0, pseudo-random = near 8.0."""
    zero_bytes = bytes([0x00] * 1024)
    assert calculate_shannon_entropy(zero_bytes) == 0.0

    # Patterned repeated byte
    pattern_bytes = bytes([0xAA] * 2048)
    assert calculate_shannon_entropy(pattern_bytes) == 0.0

    # Random distribution
    import os
    random_bytes = os.urandom(4096)
    random_entropy = calculate_shannon_entropy(random_bytes)
    assert 7.8 <= random_entropy <= 8.0


def test_cryptographic_verification_generation():
    """Verify that cryptographic verification produces valid SHA-256 evidence."""
    result = run_cryptographic_verification(
        method_used="NIST_SP_800_88_CLEAR",
        drive_id="DRV-NVME-0",
        is_simulation=True,
    )
    
    assert result.verified is True
    assert result.methodUsed == "NIST_SP_800_88_CLEAR"
    assert len(result.sha256VerificationHash) == 64  # Valid hex SHA-256 string
    assert result.sectorsSampled == 1024
    assert result.sectorsVerifiedClean == 1024
    assert result.entropyScore <= 0.05


def test_execute_sanitization_job_simulation():
    """Verify execution of full simulated NIST SP 800-88 job returns logs and verified proof."""
    target_drive = DriveInfo(
        driveId="DRV-TARGET-2",
        model="WD Blue 1TB",
        capacityBytes=1000000000000,
        isSystemDrive=False,
    )

    success, logs, verification_result, failure_reason = execute_sanitization_job(
        job_id="TEST-JOB-001",
        drive_id="DRV-TARGET-2",
        method="NIST_SP_800_88_CLEAR",
        is_simulation=True,
        target_drive_info=target_drive,
    )

    assert success is True
    assert failure_reason == ""
    assert len(logs) >= 5
    assert verification_result is not None
    assert verification_result.verified is True
    assert len(verification_result.sha256VerificationHash) == 64

