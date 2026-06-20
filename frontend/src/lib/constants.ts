// ============================================================
// Constants — Application-wide configuration values
// Used by: All modules. Single source of truth for labels, options, config.
// ============================================================

// --- Admin Navigation Items ---
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'assets', label: 'Assets', icon: 'Monitor', path: '/assets' },
  { id: 'employees', label: 'Employees', icon: 'Users', path: '/employees' },
  { id: 'software', label: 'Software', icon: 'AppWindow', path: '/software' },
  { id: 'licenses', label: 'Licenses', icon: 'KeyRound', path: '/licenses' },
  { id: 'procurement', label: 'Procurement', icon: 'ShoppingCart', path: '/procurement' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports' },
  { id: 'warranty-automations', label: 'Warranty Autos', icon: 'ShieldCheck', path: '/warranty-automations' },
] as const;

export const ADMIN_BOTTOM_NAV = [
  { id: 'audit', label: 'Audit Logs', icon: 'ShieldAlert', path: '/audit-logs' },
] as const;

// --- Employee Navigation Items ---
export const EMPLOYEE_NAV_ITEMS = [
  { id: 'my-assets', label: 'My Assets', icon: 'Monitor', path: '/my-assets' },
  { id: 'warranty', label: 'Warranty Status', icon: 'ShieldCheck', path: '/warranty' },
  { id: 'notifications', label: 'Notifications', icon: 'LayoutDashboard', path: '/notifications' },
] as const;

export const EMPLOYEE_BOTTOM_NAV = [
  { id: 'profile', label: 'Profile', icon: 'UserCheck', path: '/profile' },
] as const;

// --- Departments ---
export const DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Operations',
  'Security',
  'IT Support',
  'Marketing',
  'Sales',
  'Legal',
  'Executive',
] as const;

// --- Locations ---
export const LOCATIONS = [
  'New York, Desk 4B',
  'New York, Floor 2',
  'San Francisco, Floor 3',
  'San Francisco, Lab B',
  'London, Room 201',
  'London, Floor 5',
  'Austin, Cubicle 12',
  'Austin, Server Room',
  'Seattle, Lab A',
  'Seattle, Floor 4',
] as const;

// --- Vendors ---
export const VENDORS = [
  'Apple',
  'Dell',
  'Lenovo',
  'HP',
  'Cisco',
  'Ubiquiti',
  'Samsung',
  'LG',
  'Brother',
  'Juniper',
  'Microsoft',
  'Logitech',
] as const;

// --- Asset Models by Brand ---
export const ASSET_MODELS: Record<string, string[]> = {
  Apple: ['MacBook Pro M2 Max, 16"', 'MacBook Pro M3 Pro, 14"', 'MacBook Pro M2, 14"', 'iPad Pro 12.9"', 'Mac Mini M2'],
  Dell: ['Latitude 5540', 'Latitude 7440', 'Latitude 9440', 'PowerEdge R750', 'U2723QE Monitor'],
  Lenovo: ['ThinkPad X1 Carbon', 'ThinkPad T14s', 'ThinkPad L14', 'ThinkStation P360'],
  HP: ['EliteBook 840 G10', 'EliteBook 860 G10', 'LaserJet Pro MFP', 'ProLiant DL380 Gen10'],
  Cisco: ['Meraki MR46', 'Catalyst 9200', 'Catalyst 9300'],
  Ubiquiti: ['UniFi U6 Pro', 'UniFi U6 Enterprise', 'EdgeRouter 4'],
  Samsung: ['Odyssey G7 27"', 'ViewFinity S8 32"'],
  LG: ['27UK850-W', 'UltraFine 5K'],
  Brother: ['MFC-L8900CDW', 'HL-L6400DW'],
  Juniper: ['EX3400-48T', 'EX2300-24T'],
};

// --- API Endpoints ---
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Pagination ---
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// --- Date Format ---
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// --- Application Info ---
export const APP_NAME = 'IT Asset Tracker';
export const APP_VERSION = 'v2.1';
export const APP_TITLE = `${APP_NAME} ${APP_VERSION} | Company Assets`;

// --- Colors (match reference image exactly) ---
export const COLORS = {
  background: '#071224',
  sidebar: '#0A172B',
  card: '#0D1B32',
  cardHover: '#112240',
  border: '#19304D',
  borderLight: '#1E3A5F',
  primary: '#18B6FF',
  primaryHover: '#0EA5E9',
  primaryMuted: 'rgba(24, 182, 255, 0.15)',
  success: '#00D084',
  successMuted: 'rgba(0, 208, 132, 0.15)',
  warning: '#FFB020',
  warningMuted: 'rgba(255, 176, 32, 0.15)',
  danger: '#FF4D4D',
  dangerMuted: 'rgba(255, 77, 77, 0.15)',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  white: '#FFFFFF',
} as const;

// --- Warranty Alert Thresholds ---
export const WARRANTY_ALERT_DAYS = {
  critical: 30,   // <= 30 days = red
  warning: 90,    // <= 90 days = yellow
  normal: 180,    // <= 180 days = green reminder
} as const;
