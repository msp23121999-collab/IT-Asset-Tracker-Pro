// ============================================================
// Employee Types — Data model for employee management
// Used by: EmployeeTable, AssetAssignment, CheckIn/Out
// ============================================================

export interface Employee {
  id: string;
  employeeId: string;        // e.g., "EMP-001"
  name: string;
  email: string;
  department: string;
  role: string;
  phone: string;
  userId: string;            // reference to auth user
  assignedAssets: string[];   // array of asset IDs
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  search: string;
  department: string;
  role: string;
  isActive: boolean | null;
}
