import api from "./api"

export interface SanitizationJob {
  _id: string
  jobId: string
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
    condition?: string
    storageType?: string
    storageCapacity?: string
  }
  retechDeviceId: string
  agentId?: {
    _id: string
    agentId: string
    name: string
    hostname: string
    platform: string
    status: string
  }
  agentCode?: string
  targetDriveId: string
  targetDriveModel?: string
  targetStorageType?: string
  targetCapacity?: string
  selectedMethod: string
  sanitizationStandard: string
  reason?: string
  authorizedByName?: string
  authorizationConfirmedAt: string
  status: string
  isSimulation: boolean
  progressPercent: number
  startedAt?: string
  completedAt?: string
  executionLogs: Array<{
    timestamp: string
    level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS"
    message: string
  }>
  verificationResult?: {
    verified: boolean
    methodUsed: string
    entropyScore?: number
    sectorsSampled?: number
    sectorsVerifiedClean?: number
    sha256VerificationHash: string
    verificationTimestamp: string
    certificateId?: string
    notes?: string
  }
  failureReason?: string
  statusHistory: Array<{
    status: string
    timestamp: string
    note?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface SanitizationStats {
  totalJobs: number
  runningJobs: number
  verifiedSuccessfulJobs: number
  pendingVerificationJobs: number
  failedJobs: number
  activeAgentsCount: number
}

export interface ConnectedAgent {
  _id: string
  agentId: string
  name: string
  hostname: string
  platform: string
  agentVersion: string
  status: "ONLINE" | "OFFLINE" | "REVOKED" | "PAIRING_PENDING"
  lastSeenAt: string
  pairedAt?: string
  supportedCapabilities: string[]
  discoveredDrives: Array<{
    driveId: string
    model: string
    serialNumber?: string
    capacityBytes?: number
    capacityFormatted?: string
    storageType?: string
    interfaceType?: string
    isSystemDrive: boolean
    isRemovable: boolean
  }>
}

export const sanitizationService = {
  // Admin endpoints
  getDashboardStats: async () => {
    const res = await api.get("/admin/sanitization/dashboard")
    return res.data.data
  },

  getJobs: async (params?: {
    search?: string
    status?: string
    method?: string
    isSimulation?: string
    page?: number
    limit?: number
  }) => {
    const res = await api.get("/admin/sanitization/jobs", { params })
    return res.data.data
  },

  getJobById: async (id: string) => {
    const res = await api.get(`/admin/sanitization/jobs/${id}`)
    return res.data.data
  },

  createJob: async (data: {
    deviceId: string
    targetDriveId?: string
    targetDriveModel?: string
    targetStorageType?: string
    targetCapacity?: string
    selectedMethod: string
    sanitizationStandard?: string
    reason?: string
    isSimulation?: boolean
    agentId?: string
    confirmAuthorization: boolean
  }) => {
    const res = await api.post("/admin/sanitization/jobs", data)
    return res.data.data
  },

  cancelJob: async (id: string, reason?: string) => {
    const res = await api.patch(`/admin/sanitization/jobs/${id}/cancel`, { reason })
    return res.data.data
  },

  deleteJob: async (id: string) => {
    try {
      const res = await api.delete(`/admin/sanitization/jobs/${id}`)
      return res.data.data
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallbackRes = await api.post(`/admin/sanitization/jobs/${id}/delete`)
        return fallbackRes.data.data
      }
      throw err
    }
  },

  getAgents: async () => {
    const res = await api.get("/admin/sanitization/agents")
    return res.data.data as ConnectedAgent[]
  },

  generatePairingCode: async () => {
    const res = await api.post("/admin/sanitization/agents/pairing-code")
    return res.data.data as {
      agentId: string
      pairingCode: string
      expiresAt: string
    }
  },

  revokeAgent: async (id: string) => {
    const res = await api.post(`/admin/sanitization/agents/${id}/revoke`)
    return res.data.data
  },

  deleteAgent: async (id: string) => {
    try {
      const res = await api.delete(`/admin/sanitization/agents/${id}`)
      return res.data.data
    } catch (err: any) {
      // Fallback to POST in case HTTP DELETE is restricted by proxy
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallbackRes = await api.post(`/admin/sanitization/agents/${id}/delete`)
        return fallbackRes.data.data
      }
      throw err
    }
  },

  // Customer endpoints
  getCustomerDeviceSanitization: async (deviceId: string) => {
    const res = await api.get(`/customer/devices/${deviceId}/sanitization`)
    return res.data.data
  },
}

