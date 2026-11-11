export type UserRole = "CUSTOMER" | "ADMIN"
export type AccountStatus = "ACTIVE" | "DEACTIVATED"

export interface IUserAddress {
  street?: string
  city?: string
  state?: string
  pinCode?: string
}

export interface IUser {
  _id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
  accountStatus: AccountStatus
  address?: IUserAddress
  createdAt: string
  updatedAt: string
}

export type DeviceCondition =
  | "Like new"
  | "Good"
  | "Fair"
  | "Damaged"
  | "Not working"
  | "Unknown"

export type DeviceClassification = "A" | "B" | "C" | "D" | "PENDING"

export type DeviceStatus =
  | "SUBMITTED"
  | "PICKUP_SCHEDULED"
  | "COLLECTION_CONFIRMED"
  | "RECEIVED"
  | "INSPECTION_PENDING"
  | "INSPECTED"
  | "SANITIZATION_PENDING"
  | "SANITIZED"
  | "READY_FOR_RESALE"
  | "RECYCLED"

export interface IDeviceInspection {
  physicalCondition?: string
  powersOn?: boolean
  storageType?: string
  storageCapacity?: string
  inspectionNotes?: string
  reusePotential?: string
  inspectedAt?: string
  inspectedBy?: {
    _id: string
    fullName: string
    email: string
  }
}

export interface IDevice {
  _id: string
  deviceId: string
  customerId: string | { _id: string; fullName: string; email: string; phone?: string; address?: IUserAddress }
  category: string
  brand: string
  model: string
  purchaseYear?: number | string
  condition: DeviceCondition
  powersOn: boolean
  storageType?: string
  storageCapacity?: string
  description?: string
  images: string[]
  inspection?: IDeviceInspection
  classification: DeviceClassification
  status: DeviceStatus
  pickupRequestId?: string | IPickupRequest
  createdAt: string
  updatedAt: string
}

export type PickupStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SCHEDULED"
  | "COLLECTION_CONFIRMED"
  | "RECEIVED"
  | "CANCELLED"

export interface IStatusHistoryItem {
  status: PickupStatus
  timestamp: string
  remarks?: string
  updatedBy?: {
    _id: string
    fullName: string
    role?: string
  }
}

export interface IPickupRequest {
  _id: string
  requestId: string
  customerId: string | { _id: string; fullName: string; email: string; phone?: string; address?: IUserAddress }
  deviceId: string | IDevice
  pickupAddress: string
  city: string
  state: string
  pinCode: string
  contactNumber: string
  preferredDate: string
  preferredTimeSlot: string
  instructions?: string
  status: PickupStatus
  adminRemarks?: string
  statusHistory: IStatusHistoryItem[]
  createdAt: string
  updatedAt: string
}

export interface INotification {
  _id: string
  userId: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ALERT"
  isRead: boolean
  relatedDeviceId?: string
  createdAt: string
}

