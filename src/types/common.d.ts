// Common utility types used across the application

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  pages: number
}

export interface SortParams {
  sortBy?: string
  sortOrder: "asc" | "desc"
}

export interface LocationData {
  province: string
  district: string
  sector: string
  address?: string
}

export interface UploadResponse {
  url: string
  publicId: string
  secureUrl: string
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
}

// Enum types for better type safety
export type UserRole = "FARMER" | "SELLER" | "ADMIN"
export type FarmCapacity = "SMALL" | "MEDIUM" | "LARGE"
export type ProductStatus = "ACTIVE" | "SOLD_OUT" | "INACTIVE" | "DRAFT"
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "DISPUTED"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "ESCROWED" | "RELEASED"
export type ReviewEntityType = "PRODUCT" | "FARMER"
export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "PAYMENT_RECEIVED"
  | "MESSAGE_RECEIVED"
  | "REVIEW_RECEIVED"
  | "SYSTEM_ANNOUNCEMENT"

// Filter types
export interface ProductFilters {
  categoryId?: string
  farmerId?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
  search?: string
  location?: string
}

export interface OrderFilters {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface UserFilters {
  role?: UserRole
  isVerified?: boolean
  search?: string
}

// Statistics types
export interface UserStats {
  totalUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  recentUsers: number
  roleDistribution: Record<UserRole, number>
}

export interface PlatformStats {
  products: {
    total: number
    active: number
    inactive: number
  }
  orders: {
    total: number
    completed: number
    pending: number
  }
  revenue: {
    total: number
  }
  reviews: {
    pendingModeration: number
  }
}

export interface EscrowStats {
  totalEscrowed: number
  eligibleForRelease: number
  releasedToday: number
  totalEscrowedAmount: number
}
