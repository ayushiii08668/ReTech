from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class DriveInfo(BaseModel):
    driveId: str
    model: str = "Generic Drive"
    serialNumber: Optional[str] = ""
    capacityBytes: Optional[int] = 0
    capacityFormatted: Optional[str] = "Unknown"
    storageType: Optional[str] = "SSD"
    interfaceType: Optional[str] = "NVMe"
    isSystemDrive: bool = False
    isRemovable: bool = False
    supportedMethods: List[str] = [
        "NIST_SP_800_88_CLEAR",
        "ZERO_OVERWRITE",
        "DRY_RUN_SIMULATION",
    ]

class PairingRequest(BaseModel):
    pairingCode: str
    name: Optional[str] = None
    hostname: Optional[str] = None
    platform: Optional[str] = None
    agentVersion: Optional[str] = "1.0.0"
    supportedCapabilities: Optional[List[str]] = None
    discoveredDrives: Optional[List[DriveInfo]] = None

class HeartbeatPayload(BaseModel):
    hostname: str
    platform: str
    agentVersion: str
    supportedCapabilities: List[str]
    discoveredDrives: List[DriveInfo]

class ExecutionLogItem(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str = "INFO"
    message: str

class VerificationResultSchema(BaseModel):
    verified: bool
    methodUsed: str
    entropyScore: Optional[float] = 0.0
    sectorsSampled: Optional[int] = 1000
    sectorsVerifiedClean: Optional[int] = 1000
    sha256VerificationHash: str
    notes: Optional[str] = None

class JobEventPayload(BaseModel):
    status: Optional[str] = None
    progressPercent: Optional[int] = None
    logs: Optional[List[ExecutionLogItem]] = None

class JobResultPayload(BaseModel):
    status: str
    verificationResult: Optional[VerificationResultSchema] = None
    logs: Optional[List[ExecutionLogItem]] = None
    failureReason: Optional[str] = None

class AgentConfig(BaseModel):
    backendUrl: str = "http://localhost:5000/api/v1"
    agentId: Optional[str] = None
    agentName: Optional[str] = None
    apiKey: Optional[str] = None
    dryRunMode: bool = True
    pollIntervalSeconds: int = 10

