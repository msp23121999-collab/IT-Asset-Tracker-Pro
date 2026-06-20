// ============================================================
// Asset Types — Core data model for IT assets
// Used by: AssetTable, AssetForm, AssetDetails, Dashboard, Reports
// ============================================================

export type AssetStatus = 'active' | 'in_use' | 'maintenance' | 'retired' | 'disposed';
export type AssetCondition = 'new' | 'good' | 'fair' | 'poor';
export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'monitor'
  | 'printer'
  | 'server'
  | 'router'
  | 'switch'
  | 'phone'
  | 'tablet'
  | 'accessory'
  | 'other';

export interface AssetAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface Asset {
  id: string;
  assetId: string;           // e.g., "IT-00451"
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  barcode: string;
  qrCode: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  cost: number;
  department: string;
  assignedTo: string;        // employeeId reference
  assignedToName: string;    // denormalized for display
  assignedToEmail?: string;  // denormalized for email sending
  location: string;
  status: AssetStatus;
  condition: AssetCondition;
  vendor: string;
  invoiceUrl: string;
  imageUrl: string;
  attachments: AssetAttachment[];
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  twentyDayReminderSent?: boolean;
  fiveDayReminderSent?: boolean;
}

export interface AssetFilters {
  search: string;
  status: AssetStatus | 'all';
  category: AssetCategory | 'all';
  department: string;
  location: string;
  vendor: string;
  dateRange: { from: string; to: string } | null;
  warrantyExpiring: boolean;
  costRange: { min: number; max: number } | null;
}

export interface AssetStats {
  total: number;
  active: number;
  inUse: number;
  maintenance: number;
  retired: number;
  disposed: number;
  expiringWarranty: number;
  totalValue: number;
}

export const ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; dotColor: string }> = {
  active: { label: 'Active', color: '#00D084', dotColor: '#00D084' },
  in_use: { label: 'In Use', color: '#18B6FF', dotColor: '#18B6FF' },
  maintenance: { label: 'Maintenance', color: '#FFB020', dotColor: '#FFB020' },
  retired: { label: 'Retired', color: '#FF4D4D', dotColor: '#FF4D4D' },
  disposed: { label: 'Disposed', color: '#6B7280', dotColor: '#6B7280' },
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  monitor: 'Monitor',
  printer: 'Printer',
  server: 'Server',
  router: 'Router',
  switch: 'Network Switch',
  phone: 'Phone',
  tablet: 'Tablet',
  accessory: 'Accessory',
  other: 'Other',
};
