// ============================================================
// Common/Shared Types — Reusable across modules
// Used by: All modules (assignments, notifications, audit, etc.)
// ============================================================

// --- Assignment ---
export type AssignmentType = 'check_out' | 'check_in' | 'transfer';
export type AssignmentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  type: AssignmentType;
  status: AssignmentStatus;
  approvedBy: string;
  checkOutDate: string;
  checkInDate: string;
  transferTo: string;
  notes: string;
  digitalReceipt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// --- Notification ---
export type NotificationType = 'warranty' | 'assignment' | 'system' | 'alert';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link: string;
  createdAt: string;
  expiresAt: string;
}

// --- Audit Log ---
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  details: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
  changes: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
}

// --- Software ---
export type LicenseType = 'perpetual' | 'subscription' | 'open_source';

export interface Software {
  id: string;
  name: string;
  version: string;
  vendor: string;
  licenseType: LicenseType;
  maxInstalls: number;
  currentInstalls: number;
  expiryDate: string;
  cost: number;
  assignedAssets: string[];
  createdAt: string;
  updatedAt: string;
}

// --- License ---
export type LicenseStatus = 'active' | 'expired' | 'revoked';

export interface License {
  id: string;
  softwareId: string;
  softwareName: string;
  licenseKey: string;
  activationDate: string;
  expiryDate: string;
  assignedTo: string;
  assignedToName: string;
  status: LicenseStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Procurement ---
export type ProcurementStatus = 'requested' | 'approved' | 'ordered' | 'received' | 'cancelled';

export interface Procurement {
  id: string;
  requestId: string;
  itemName: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  vendor: string;
  requestedBy: string;
  requestedByName: string;
  status: ProcurementStatus;
  approvedBy: string;
  expectedDelivery: string;
  actualDelivery: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// --- Settings ---
export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export interface SystemSettings {
  companyName: string;
  logo: string;
  departments: string[];
  categories: string[];
  locations: string[];
  vendors: Vendor[];
}

// --- Pagination ---
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// --- Table Column Sort ---
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  inRepairAssets: number;
  retiredAssets: number;
  expiringWarranty: number;
  totalValue: number;
  recentActivity: AuditLog[];
  departmentDistribution: { department: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  monthlyProcurement: { month: string; count: number; cost: number }[];
  assetLifecycle: { age: string; count: number }[];
}
