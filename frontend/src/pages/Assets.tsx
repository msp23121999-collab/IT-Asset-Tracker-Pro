import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Plus, Filter, Upload, Eye, Edit, Trash2,
  CloudSync, CheckCircle2, FileUp, UserPlus, Mail,
  Lock, Copy, CheckCheck, EyeOff, Users, Trash,
  ChevronDown, ChevronUp, Bell, ImageOff
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { ASSET_STATUS_CONFIG } from '@/types/asset';
import type { Asset } from '@/types/asset';
import { DataTable } from '@/components/shared/DataTable';
import { useAssets } from '@/hooks/useAssets';
import { AssetForm } from '@/components/dashboard/AssetForm';
import { CreateEmployeeModal } from '@/components/dashboard/CreateEmployeeModal';
import { SendNotificationModal } from '@/components/modals/SendNotificationModal';
import { useEmployees } from '@/hooks/useEmployees';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { storage, isFirebaseConfigured } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── types ─── */
interface EmployeeCredential {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  password: string;
  department: string;
  createdAt: string;
}

/* ─── localStorage helpers ─── */
const LS_KEY = 'admin_created_employees';
function loadCreated(): EmployeeCredential[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCreated(list: EmployeeCredential[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

/* ─── Copy button ─── */
const CopyBtn: React.FC<{ value: string }> = ({ value }) => {
  const [done, setDone] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button onClick={handle} title="Copy" className="text-[#475569] hover:text-[#18B6FF] transition-colors">
      {done ? <CheckCheck size={12} className="text-[#00D084]" /> : <Copy size={12} />}
    </button>
  );
};

const CATEGORY_IMAGES: Record<string, string> = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  desktop: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=400&q=80',
  monitor: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?auto=format&fit=crop&w=400&q=80',
  printer: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
  server: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
  router: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  switch: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
  tablet: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
  accessory: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
  other: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'
};

/* ─── Password cell ─── */
const PassCell: React.FC<{ value: string }> = ({ value }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[11px] text-[#E2E8F0]">
        {show ? value : '•'.repeat(Math.min(value.length, 12))}
      </span>
      <button onClick={() => setShow(v => !v)} className="text-[#475569] hover:text-[#94A3B8] transition-colors">
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      <CopyBtn value={value} />
    </div>
  );
};

/* ══════════════════════════════════════════════
   Main Page Component
══════════════════════════════════════════════ */
export const Assets: React.FC = () => {
  const { assets, isLoading, addAsset, updateAsset, deleteAsset } = useAssets();
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'it_admin';

  /* asset state */
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingAsset, setEditingAsset]     = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [globalFilter, setGlobalFilter]     = useState('');
  const [isUploading, setIsUploading]       = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter]     = useState<string>('all');

  const { addEmployee, employees } = useEmployees();
  const { sendNotification } = useNotifications();

  /* employee credentials panel */
  const [isEmpModalOpen, setIsEmpModalOpen]       = useState(false);
  const [createdEmployees, setCreatedEmployees]   = useState<EmployeeCredential[]>(loadCreated);
  const [empPanelOpen, setEmpPanelOpen]           = useState(true);
  const [empSearch, setEmpSearch]                 = useState('');
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // persist to localStorage whenever list changes
  useEffect(() => { saveCreated(createdEmployees); }, [createdEmployees]);

  // keep selected asset in sync without stale closures
  useEffect(() => {
    setSelectedAsset(current => {
      if (assets.length === 0) return null;
      if (!current) return assets[0];
      const updated = assets.find(a => a.id === current.id);
      return updated || current;
    });
  }, [assets]);

  const handleEdit = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    setEditingAsset(asset);
    setIsFormOpen(true);
  };
  const handleDelete = async (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${asset.assetId} (${asset.model})?`)) {
      await deleteAsset(asset.id).catch(console.error);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (!file || !selectedAsset) return;

    if (!isFirebaseConfigured || !storage) {
      alert("Firebase Storage is not configured! Cannot upload image.");
      if (target) target.value = '';
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadAndSave = async () => {
        const storageRef = ref(storage, `assets/${selectedAsset.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        const newAttachment = {
          id: `att_${Date.now()}`,
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        
        const currentAttachments = selectedAsset.attachments || [];
        
        await updateAsset(selectedAsset.id, { 
          imageUrl: downloadURL,
          attachments: [...currentAttachments, newAttachment]
        });
      };

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Process timed out. Please check your network or Firebase rules.")), 20000)
      );

      await Promise.race([uploadAndSave(), timeoutPromise]);

    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (target) target.value = '';
    }
  };
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let createdAsset;
      if (editingAsset) {
        await updateAsset(editingAsset.id, data);
        createdAsset = data;
      } else {
        await addAsset(data);
        createdAsset = data;
      }
      
      // Implicitly create employee if email is provided
      if (data.assignedToEmail) {
        const emailLower = data.assignedToEmail.toLowerCase();
        const exists = employees.some(e => (e.email || '').toLowerCase() === emailLower);
        if (!exists) {
          const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
          
          // Map asset status to employee active status (e.g., if asset is active/in_use, employee is active)
          const isEmpActive = ['active', 'in_use'].includes(data.status);
          
          try {
            await addEmployee({
              employeeId: newEmpId,
              name: data.assignedToName || data.assignedToEmail.split('@')[0],
              email: data.assignedToEmail,
              department: data.department || 'General',
              role: 'Employee',
              phone: data.location || '', // Using phone field for location temporarily if needed, or just let it be empty
              userId: '',
              assignedAssets: [data.assetId || ''],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.assignedToName || 'User'}`,
              isActive: isEmpActive
            });
            console.log("Successfully implicitly created employee:", newEmpId);
          } catch (err: any) {
            console.error('Failed to implicitly create employee:', err);
            alert(`Asset saved, but failed to auto-create employee: ${err.message}`);
          }
        }
      }

      setIsFormOpen(false);
      setEditingAsset(null);
    } finally { setIsSubmitting(false); }
  };

  const handleEmployeeCreated = useCallback((emp: any) => {
    const cred: EmployeeCredential = {
      id:         emp.id,
      name:       emp.name,
      employeeId: emp.employeeId,
      email:      emp.email,
      password:   emp.password,
      department: emp.department,
      createdAt:  emp.createdAt,
    };
    setCreatedEmployees(prev => [cred, ...prev]);
    setEmpPanelOpen(true);
  }, []);

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Remove this employee credential from the list?')) {
      setCreatedEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  /* filtered employees for search */
  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return createdEmployees;
    const q = empSearch.toLowerCase();
    return createdEmployees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }, [createdEmployees, empSearch]);

  const filteredAssets = useMemo(() => {
    if (statusFilter === 'all') return assets;
    return assets.filter(a => a.status === statusFilter);
  }, [assets, statusFilter]);

  const handleExport = (format: 'excel' | 'pdf') => {
    setShowExportMenu(false);
    if (format === 'excel') {
      const wsData = [
        ['Asset ID', 'Asset Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Department', 'Assigned Employee', 'Status', 'Warranty End Date'],
        ...filteredAssets.map((a) => [
          a.assetId,
          a.name,
          a.category,
          a.brand,
          a.model,
          a.serialNumber,
          a.department,
          a.assignedToName || a.assignedTo || 'Unassigned',
          a.status,
          a.warrantyEnd ? new Date(a.warrantyEnd).toLocaleDateString() : 'N/A'
        ])
      ];
      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(wsData);
      utils.book_append_sheet(wb, ws, 'Assets');
      writeFile(wb, `Asset_Export_${new Date().getTime()}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Asset Inventory Export', 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Asset ID', 'Name', 'Category', 'Model', 'Status']],
        body: filteredAssets.map(a => [a.assetId, a.name, a.category, a.model, a.status]),
        theme: 'grid',
        styles: { fontSize: 9 }
      });
      doc.save(`Asset_Export_${new Date().getTime()}.pdf`);
    }
  };

  /* asset table columns */
  const columns = useMemo<ColumnDef<Asset>[]>(() => [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const cfg = ASSET_STATUS_CONFIG[row.original.status];
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
            <span style={{ color: cfg.color }} className="capitalize text-xs font-medium">{cfg.label}</span>
          </div>
        );
      },
    },
    { accessorKey: 'assetId', header: 'Asset ID' },
    {
      accessorKey: 'model',
      header: 'Model',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.model}</span>,
    },
    {
      accessorKey: 'serialNumber',
      header: 'Serial Number',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.serialNumber}</span>,
    },
    { accessorKey: 'assignedToName', header: 'User' },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span className="text-xs">{row.original.location}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity text-textMuted pr-4">
          <button className="hover:text-[#18B6FF] transition-colors" title="View" onClick={() => setSelectedAsset(row.original)}><Eye size={16} /></button>
          {isAdmin && <button className="hover:text-[#00D084] transition-colors" title="Edit" onClick={e => handleEdit(e, row.original)}><Edit size={16} /></button>}
          {isAdmin && <button className="hover:text-[#FF4D4D] transition-colors" title="Delete" onClick={e => handleDelete(e, row.original)}><Trash2 size={16} /></button>}
        </div>
      ),
    },
  ], [isAdmin]);

  /* ── render ── */
  return (
    <div className="flex flex-col h-full bg-background text-textPrimary">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          Asset Inventory
          {isLoading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </h1>
        <div className="flex items-center gap-2 text-sm text-textSecondary text-right">
          <div>
            <div className="flex items-center justify-end gap-1 font-medium text-foreground">
              Live Sync <CheckCircle2 size={16} className="text-status-active" />
            </div>
            <div className="text-xs">Real-time DB</div>
            <div className="text-status-active text-xs mt-0.5">Connected: Firebase</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-md min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input
            type="text"
            placeholder="Search assets..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full bg-card border border-borderLight rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-textMuted"
          />
        </div>

        {isAdmin && (
          <button
            onClick={() => { setEditingAsset(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 bg-[#18B6FF] hover:bg-[#0EA5E9] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(24,182,255,0.2)]"
          >
            <Plus size={16} /> Add New Asset
          </button>
        )}



        {isAdmin && (
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
                {['all', 'active', 'in_use', 'maintenance', 'retired', 'disposed'].map(status => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-sidebar transition-colors ${statusFilter === status ? 'text-primary font-medium bg-primary/5' : 'text-foreground'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {isAdmin && (
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
        )}
      </div>



      {/* ── Main Content Area ── */}
      <div className="flex gap-6 flex-1 min-h-0 relative">

        {/* Table */}
        <div className="flex-1 flex flex-col bg-card border border-borderLight rounded-xl overflow-hidden shadow-[0_0_15px_rgba(24,182,255,0.05)] relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-borderLight/50 shrink-0 bg-[#0D1B32]/50">
            <h2 className="font-medium text-sm text-foreground">Inventory List</h2>
            <div className="text-xs text-textSecondary bg-background px-2 py-1 rounded border border-borderLight">
              {filteredAssets.length} items total
            </div>
          </div>
          <DataTable
            data={filteredAssets}
            columns={columns}
            onRowClick={setSelectedAsset}
            selectedRowId={selectedAsset?.id}
            globalFilter={globalFilter}
          />
        </div>

        {/* Right Panel – Asset Details */}
        <div className="w-80 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1 pb-4">
          {selectedAsset ? (
            <>
              {/* Asset Details Card */}
              <div className="bg-card border border-borderLight rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: ASSET_STATUS_CONFIG[selectedAsset.status].color }} />
                <div className="flex justify-between items-start mb-4 mt-2">
                  <h3 className="font-semibold text-foreground truncate max-w-[200px]" title={selectedAsset.assetId}>
                    {selectedAsset.assetId}
                  </h3>
                  {isAdmin && (
                    <div className="flex gap-1">
                      {selectedAsset.assignedToEmail && (
                        <button 
                          onClick={() => setIsNotifyModalOpen(true)} 
                          className="p-1.5 text-textMuted hover:text-[#FFB020] hover:bg-[#FFB020]/10 rounded-md transition-colors mr-2 border border-transparent hover:border-[#FFB020]/30"
                          title="Notify Employee"
                        >
                          <Bell size={14} />
                        </button>
                      )}
                      <button onClick={e => handleEdit(e, selectedAsset)} className="p-1.5 text-textMuted hover:text-[#00D084] hover:bg-background rounded-md transition-colors"><Edit size={14} /></button>
                      <button onClick={e => handleDelete(e, selectedAsset)} className="p-1.5 text-textMuted hover:text-[#FF4D4D] hover:bg-background rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-lg bg-background border border-borderLight flex items-center justify-center overflow-hidden shrink-0">
                    {(() => {
                      const imageAttachments = selectedAsset.attachments?.filter(a => a.type?.startsWith('image/')) || [];
                      let displayUrl = imageAttachments.length > 0 ? imageAttachments[0].url : selectedAsset.imageUrl;
                      if (!displayUrl || displayUrl.includes('unsplash.com') || displayUrl.includes('dicebear.com')) {
                        displayUrl = CATEGORY_IMAGES[selectedAsset.category?.toLowerCase()] || CATEGORY_IMAGES.other;
                      }
                      return (
                        <img src={displayUrl} alt={selectedAsset.model} className="w-full h-full object-cover" />
                      );
                    })()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{selectedAsset.brand}</div>
                    <div className="text-xs text-textMuted capitalize">{selectedAsset.category}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    ['Status', <span className="capitalize font-medium" style={{ color: ASSET_STATUS_CONFIG[selectedAsset.status].color }}>{ASSET_STATUS_CONFIG[selectedAsset.status].label}</span>],
                    ['Model', selectedAsset.model],
                    ['User', selectedAsset.assignedToName || 'Unassigned'],
                    ['Serial', <span className="font-mono text-[11px]">{selectedAsset.serialNumber}</span>],
                    ['Dept', selectedAsset.department || 'N/A'],
                  ].map(([label, val], i, arr) => (
                    <div key={String(label)} className={`flex justify-between ${i < arr.length - 1 ? 'border-b border-borderLight/30 pb-2' : 'pb-1'}`}>
                      <span className="text-textSecondary">{label}</span>
                      <span className="text-right max-w-[150px] truncate text-foreground">{val as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-card border border-borderLight rounded-xl p-5 shadow-lg">
                <h3 className="font-medium mb-4 text-sm text-foreground">File Attachments</h3>
                <label className="border border-dashed border-primary/30 bg-sidebar/50 rounded-lg p-5 flex flex-col items-center justify-center text-center mb-5 cursor-pointer hover:bg-sidebar transition-colors group relative overflow-hidden">
                  {isUploading && (
                    <div className="absolute inset-0 bg-sidebar/80 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading || !isAdmin} />
                  <CloudSync className="text-primary/70 mb-2 group-hover:text-primary transition-colors" size={28} />
                  <div className="text-primary text-xs font-medium mb-1">Upload Asset Image</div>
                  <div className="text-[10px] text-textMuted">Using Firebase Storage</div>
                </label>
                {(!selectedAsset.attachments || selectedAsset.attachments.length === 0) ? (
                  <div className="text-center text-xs text-textMuted py-2">No attachments found</div>
                ) : (
                  <div className="space-y-2">
                    {selectedAsset.attachments.map((file, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 bg-sidebar rounded-md border border-borderLight/50">
                        <FileUp className="text-textSecondary shrink-0 mt-0.5" size={16} />
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium truncate text-foreground">{file.name || `Attachment_${i + 1}.pdf`}</div>
                          <div className="text-[9px] text-textMuted">Document</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card border border-borderLight rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-64 opacity-70">
              <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
                <Eye size={24} className="text-textMuted" />
              </div>
              <h3 className="text-foreground font-medium mb-2">No Asset Selected</h3>
              <p className="text-xs text-textMuted max-w-[200px]">Select an asset from the table to view its full details and attachments.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Asset Form Overlay ── */}
      <AssetForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingAsset(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingAsset}
        isLoading={isSubmitting}
      />

      {/* ── Create Employee Modal ── */}
      <CreateEmployeeModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        onCreated={handleEmployeeCreated}
      />

      {/* ── Send Notification Modal ── */}
      <SendNotificationModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        asset={selectedAsset}
        onSend={async (data) => {
          if (!selectedAsset) return;
          await sendNotification({
            recipientEmail: selectedAsset.assignedToEmail!,
            recipientUid: selectedAsset.assignedTo,
            title: data.title,
            message: data.message,
            type: 'warranty',
            assetId: selectedAsset.assetId
          });
        }}
      />
    </div>
  );
};
