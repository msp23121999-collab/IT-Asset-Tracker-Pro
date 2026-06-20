import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Upload, Edit, Trash2, ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Employee } from '@/types/employee';
import { DataTable } from '@/components/shared/DataTable';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeForm } from '@/components/dashboard/EmployeeForm';
import { cn } from '@/lib/utils';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Employees: React.FC = () => {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering
  const [globalFilter, setGlobalFilter] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredEmployees = useMemo(() => {
    if (statusFilter === 'all') return employees;
    const isAct = statusFilter === 'active';
    return employees.filter(e => e.isActive === isAct);
  }, [employees, statusFilter]);

  const handleExport = (format: 'excel' | 'pdf') => {
    setShowExportMenu(false);
    if (format === 'excel') {
      const wsData = [
        ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Status'],
        ...filteredEmployees.map((e) => [
          e.employeeId,
          e.name,
          e.email,
          e.department,
          e.role,
          e.isActive ? 'Active' : 'Inactive'
        ])
      ];
      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(wsData);
      utils.book_append_sheet(wb, ws, 'Employees');
      writeFile(wb, `Employee_Export_${new Date().getTime()}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Employee List Export', 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Emp ID', 'Name', 'Department', 'Role', 'Status']],
        body: filteredEmployees.map(e => [e.employeeId, e.name, e.department, e.role, e.isActive ? 'Active' : 'Inactive']),
        theme: 'grid',
        styles: { fontSize: 9 }
      });
      doc.save(`Employee_Export_${new Date().getTime()}.pdf`);
    }
  };

  const handleEdit = (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id);
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data);
      } else {
        await addEmployee(data);
      }
      setIsFormOpen(false);
      setEditingEmployee(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Employee Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-sidebar border border-borderLight shrink-0">
              {row.original.avatar ? (
                <img src={row.original.avatar} alt={row.original.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-textMuted bg-[#0D1B32]">
                  {row.original.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-foreground">{row.original.name}</div>
              <div className="text-[10px] text-textMuted">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'employeeId',
        header: 'Emp ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.employeeId}</span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role;
          let icon = <UserCheck size={12} className="text-[#FFB020]" />;
          let colorClass = "text-[#FFB020] border-[#FFB020]/30 bg-[#FFB020]/10";
          let label = "Employee";
          
          if (role === 'super_admin') {
            icon = <ShieldAlert size={12} className="text-[#18B6FF]" />;
            colorClass = "text-[#18B6FF] border-[#18B6FF]/30 bg-[#18B6FF]/10";
            label = "Super Admin";
          } else if (role === 'it_admin') {
            icon = <ShieldCheck size={12} className="text-[#00D084]" />;
            colorClass = "text-[#00D084] border-[#00D084]/30 bg-[#00D084]/10";
            label = "IT Admin";
          }

          return (
            <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold", colorClass)}>
              {icon}
              {label}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", row.original.isActive ? "bg-status-active" : "bg-textMuted")}></div>
            <span className={cn("text-xs font-medium", row.original.isActive ? "text-status-active" : "text-textMuted")}>
              {row.original.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center justify-start gap-3 opacity-50 group-hover:opacity-100 transition-opacity text-textMuted">
            <button className="hover:text-[#00D084] transition-colors" title="Edit employee" onClick={(e) => handleEdit(e, row.original)}>
              <Edit size={16} />
            </button>
            <button className="hover:text-[#FF4D4D] transition-colors" title="Delete employee" onClick={(e) => handleDelete(e, row.original)}>
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          Employee Management
          {isLoading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input
            type="text"
            placeholder="Search employees..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-card border border-borderLight rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-textMuted"
          />
        </div>
        <button 
          onClick={() => {
            setEditingEmployee(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-[#00D084] hover:bg-[#00BA75] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(0,208,132,0.2)]"
        >
          <Plus size={16} /> Add Employee
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 bg-transparent border border-borderLight hover:bg-card px-4 py-2 rounded-md text-sm transition-colors text-foreground"
          >
            <Filter size={16} /> Filter
          </button>
          {showFilterMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-borderLight rounded-md shadow-lg z-50 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-textMuted uppercase tracking-wider">Status</div>
              {['all', 'active', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status as any); setShowFilterMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-sidebar transition-colors ${statusFilter === status ? 'text-primary font-medium bg-primary/5' : 'text-foreground'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-transparent border border-borderLight hover:bg-card px-4 py-2 rounded-md text-sm transition-colors text-foreground"
          >
            <Upload size={16} className="rotate-180" /> Export
          </button>
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-card border border-borderLight rounded-md shadow-lg z-50 py-1">
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm hover:bg-sidebar transition-colors text-foreground">Export as Excel</button>
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm hover:bg-sidebar transition-colors text-foreground">Export as PDF</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1 min-h-0 relative">
        <div className="flex-1 flex flex-col bg-card border border-borderLight rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,208,132,0.03)] relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D084]/30 to-transparent"></div>
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-borderLight/50 shrink-0 bg-[#0D1B32]/50">
            <h2 className="font-medium text-sm text-foreground">Personnel Roster</h2>
            <div className="text-xs text-textSecondary bg-background px-2 py-1 rounded border border-borderLight">
              {filteredEmployees.length} employees total
            </div>
          </div>

          <DataTable 
            data={filteredEmployees}
            columns={columns}
            globalFilter={globalFilter}
          />
        </div>
      </div>
      
      {/* Forms Overlay */}
      <EmployeeForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }} 
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        isLoading={isSubmitting}
      />
    </div>
  );
};
