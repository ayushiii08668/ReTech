import api from "./api"

export interface SanitizationCertificate {
  _id: string
  certificateNumber: string
  verificationId: string
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
    storageType?: string
    storageCapacity?: string
  }
  retechDeviceId: string
  customerId: {
    _id: string
    fullName: string
    email: string
  }
  sanitizationJobCode: string
  sanitizationMethod: string
  standardReference: string
  operationCompletedAt: string
  verifiedAt: string
  issuedAt: string
  issuedByName: string
  verificationOutcome: string
  evidenceReference: string
  entropyScore?: number
  sectorsSampled?: number
  pdfUrl?: string
  status: "ACTIVE" | "REVOKED" | "SUPERSEDED"
  revocationReason?: string
  revokedAt?: string
  createdAt: string
}

export interface MarketplaceListing {
  _id: string
  listingId: string
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
    condition?: string
    storageType?: string
    storageCapacity?: string
    status?: string
  }
  retechDeviceId: string
  title: string
  description: string
  category: string
  brand: string
  model: string
  specifications: {
    processor?: string
    ram?: string
    storage?: string
    screenSize?: string
    operatingSystem?: string
    graphics?: string
    batteryHealth?: string
    color?: string
    [key: string]: any
  }
  images: string[]
  condition: "Like new" | "Good" | "Fair"
  refurbishmentStatus: string
  price: number
  originalEstimatedValue?: number
  warrantyInformation: string
  listingStatus: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "SOLD" | "RESERVED"
  availability: "AVAILABLE" | "RESERVED" | "SOLD"
  publishedAt?: string
  soldAt?: string
  soldPrice?: number
  buyerName?: string
  createdAt: string
}

export interface MarketplaceEnquiry {
  _id: string
  enquiryId: string
  listingId: {
    _id: string
    listingId: string
    title: string
    price: number
    images?: string[]
  }
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
  }
  customerName: string
  customerEmail: string
  customerPhone: string
  customerMessage: string
  offeredPrice?: number
  enquiryStatus: "PENDING" | "CONTACTED" | "RESERVED" | "COMPLETED" | "CANCELLED"
  adminNotes?: string
  createdAt: string
}

export interface Partner {
  _id: string
  partnerId: string
  partnerType: "REFURBISHMENT" | "RECYCLING"
  partnerName: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: {
    street?: string
    city?: string
    state?: string
    pinCode?: string
  }
  services: string[]
  supportedCategories: string[]
  authorisationReference: string
  status: "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE" | "SUSPENDED"
  internalNotes?: string
  createdAt: string
}

export interface RefurbishmentJob {
  _id: string
  jobId: string
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
    condition?: string
    status?: string
  }
  retechDeviceId: string
  partnerId: {
    _id: string
    partnerId: string
    partnerName: string
    companyName: string
    email: string
    phone: string
  }
  partnerName: string
  assignmentDate: string
  expectedCompletionDate?: string
  instructions: string
  status:
    | "NOT_REQUIRED"
    | "PENDING_ASSIGNMENT"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "QUALITY_CHECK"
    | "COMPLETED"
    | "FAILED"
    | "RETURNED"
  inspectionFindings?: string
  replacedComponents?: string[]
  refurbishmentCost?: number
  finalOutcome?: string
  completedAt?: string
  createdAt: string
}

export interface RecyclingRecord {
  _id: string
  recordId: string
  deviceId: {
    _id: string
    deviceId: string
    category: string
    brand: string
    model: string
    condition?: string
    status?: string
  }
  retechDeviceId: string
  recyclerId: {
    _id: string
    partnerId: string
    partnerName: string
    companyName: string
    email: string
    authorisationReference: string
  }
  recyclerName: string
  transferDate: string
  deviceCategory: string
  approximateWeightKg?: number
  handoverReference: string
  handoverReceipt?: string
  recyclerAcknowledgement?: string
  processingStatus:
    | "PENDING_APPROVAL"
    | "APPROVED_FOR_RECYCLING"
    | "READY_FOR_TRANSFER"
    | "TRANSFERRED"
    | "RECEIVED_BY_RECYCLER"
    | "PROCESSING"
    | "RECYCLED"
    | "REJECTED"
  finalOutcome?: string
  processingEvidence?: string
  internalNotes?: string
  completedAt?: string
  createdAt: string
}

export interface DeviceLifecycleEvent {
  _id: string
  deviceId: string
  retechDeviceId: string
  eventType: string
  title: string
  description: string
  previousStatus?: string
  newStatus?: string
  performedByName?: string
  sourceReference?: string
  eventTimestamp: string
}

export const phase4Service = {
  // --- CERTIFICATES ---
  getAdminCertificates: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get("/certificates", { params })
    return res.data.data
  },

  getEligibleDevicesForCert: async () => {
    const res = await api.get("/certificates/eligible-devices")
    return res.data.data
  },

  generateCertificate: async (deviceId: string) => {
    const res = await api.post(`/certificates/${deviceId}/generate`)
    return res.data.data as SanitizationCertificate
  },

  revokeCertificate: async (certificateId: string, reason: string) => {
    const res = await api.patch(`/certificates/${certificateId}/revoke`, { reason })
    return res.data.data as SanitizationCertificate
  },

  publicVerifyCertificate: async (verificationId: string) => {
    const res = await api.get(`/certificates/verify/${verificationId}`)
    return res.data.data
  },

  downloadCertificatePdf: async (certificateId: string, certNumber?: string) => {
    const res = await api.get(`/certificates/${certificateId}/download`, {
      responseType: "blob",
    })
    const blob = new Blob([res.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ReTech-Certificate-${certNumber || certificateId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // --- MARKETPLACE ---
  getPublicListings: async (params?: {
    search?: string
    category?: string
    condition?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    page?: number
    limit?: number
  }) => {
    const res = await api.get("/marketplace/listings", { params })
    return res.data.data
  },

  getPublicListingById: async (id: string) => {
    const res = await api.get(`/marketplace/listings/${id}`)
    return res.data.data as MarketplaceListing
  },

  submitEnquiry: async (data: {
    listingId: string
    customerMessage: string
    offeredPrice?: number
    contactPhone?: string
  }) => {
    const res = await api.post("/marketplace/enquiries", data)
    return res.data.data as MarketplaceEnquiry
  },

  getAdminListings: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get("/marketplace/admin/listings", { params })
    return res.data.data
  },

  createListing: async (data: any) => {
    const res = await api.post("/marketplace/admin/listings", data)
    return res.data.data as MarketplaceListing
  },

  updateListing: async (id: string, data: any) => {
    const res = await api.patch(`/marketplace/admin/listings/${id}`, data)
    return res.data.data as MarketplaceListing
  },

  markListingSold: async (id: string, data: { buyerName?: string; buyerContact?: string; soldPrice?: number }) => {
    const res = await api.patch(`/marketplace/admin/listings/${id}/sold`, data)
    return res.data.data as MarketplaceListing
  },

  deleteListing: async (id: string) => {
    const res = await api.delete(`/marketplace/admin/listings/${id}`)
    return res.data.data
  },

  getAdminEnquiries: async () => {
    const res = await api.get("/marketplace/admin/enquiries")
    return res.data.data as MarketplaceEnquiry[]
  },

  // --- PARTNERS ---
  getPartners: async (params?: { partnerType?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get("/admin/partners", { params })
    return res.data.data
  },

  createPartner: async (data: any) => {
    const res = await api.post("/admin/partners", data)
    return res.data.data as Partner
  },

  updatePartner: async (id: string, data: any) => {
    const res = await api.patch(`/admin/partners/${id}`, data)
    return res.data.data as Partner
  },

  deletePartner: async (id: string) => {
    const res = await api.delete(`/admin/partners/${id}`)
    return res.data
  },

  // --- REFURBISHMENT ---
  getRefurbishmentJobs: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get("/admin/refurbishment/jobs", { params })
    return res.data.data
  },

  createRefurbishmentJob: async (data: {
    deviceId: string
    partnerId: string
    expectedCompletionDate?: string
    instructions?: string
  }) => {
    const res = await api.post("/admin/refurbishment/jobs", data)
    return res.data.data as RefurbishmentJob
  },

  updateRefurbishmentJob: async (id: string, data: any) => {
    const res = await api.patch(`/admin/refurbishment/jobs/${id}`, data)
    return res.data.data as RefurbishmentJob
  },

  // --- RECYCLING ---
  getRecyclingRecords: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get("/admin/recycling/records", { params })
    return res.data.data
  },

  createRecyclingRecord: async (data: {
    deviceId: string
    recyclerId: string
    transferDate?: string
    approximateWeightKg?: number
    handoverReference: string
    handoverReceipt?: string
    internalNotes?: string
  }) => {
    const res = await api.post("/admin/recycling/records", data)
    return res.data.data as RecyclingRecord
  },

  updateRecyclingRecord: async (id: string, data: any) => {
    const res = await api.patch(`/admin/recycling/records/${id}`, data)
    return res.data.data as RecyclingRecord
  },

  // --- LIFECYCLE ---
  getDeviceLifecycle: async (deviceId: string) => {
    const res = await api.get(`/lifecycle/devices/${deviceId}`)
    return res.data.data as {
      device: any
      eventsCount: number
      events: DeviceLifecycleEvent[]
    }
  },

  addCustomLifecycleEvent: async (deviceId: string, data: any) => {
    const res = await api.post(`/lifecycle/devices/${deviceId}/events`, data)
    return res.data.data as DeviceLifecycleEvent
  },

  // --- CUSTOMER REPORTS & CERTIFICATES ---
  getCustomerReports: async () => {
    const res = await api.get("/customer/reports")
    return res.data.data
  },

  getCustomerCertificates: async () => {
    const res = await api.get("/customer/certificates")
    return res.data.data as SanitizationCertificate[]
  },
}

