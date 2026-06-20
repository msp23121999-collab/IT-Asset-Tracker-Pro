import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Asset, AssetCategory, AssetStatus, AssetCondition } from '@/types/asset';
import { useEmployees } from '@/hooks/useEmployees';

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Asset | null;
  isLoading?: boolean;
}

const CATEGORIES: AssetCategory[] = [
  'laptop', 'desktop', 'monitor', 'printer', 'server', 
  'router', 'switch', 'phone', 'tablet', 'accessory', 'other'
];

const STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
  { value: 'disposed', label: 'Disposed' },
];

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const DEFAULT_FORM_DATA = {
  assetId: '',
  name: '',
  category: 'laptop' as AssetCategory,
  brand: '',
  model: '',
  serialNumber: '',
  barcode: '',
  qrCode: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  warrantyStart: '',
  warrantyEnd: '',
  cost: 0,
  department: '',
  assignedTo: '',
  assignedToName: '',
  location: '',
  status: 'active' as AssetStatus,
  condition: 'new' as AssetCondition,
  vendor: '',
  notes: '',
  imageUrl: '',
  attachments: [],
  isArchived: false,
  createdBy: 'Current User' // In reality, fetch from Auth
};

export const AssetForm: React.FC<AssetFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<any>(DEFAULT_FORM_DATA);
  const [error, setError] = useState<string | null>(null);
  const { employees } = useEmployees();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          purchaseDate: initialData.purchaseDate?.split('T')[0] || '',
          warrantyStart: initialData.warrantyStart?.split('T')[0] || '',
          warrantyEnd: initialData.warrantyEnd?.split('T')[0] || ''
        });
      } else {
        setFormData({ ...DEFAULT_FORM_DATA, assetId: `IT-${Math.floor(1000 + Math.random() * 9000)}` });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    


    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.assetId || !formData.name || !formData.model) {
      setError('Please fill in all required fields (Asset ID, Name, Model)');
      return;
    }

    // Gmail verification
    if (formData.assignedToEmail && !formData.assignedToEmail.toLowerCase().endsWith('@gmail.com')) {
      setError('Employee Email ID must be a valid @gmail.com address.');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#071224]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className="relative w-full max-w-2xl bg-[#0D1B32] border-l border-[#19304D] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#19304D] bg-[#071224]/50">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#19304D] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#19304D] scrollbar-track-transparent">
          {error && (
            <div className="mb-6 p-4 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-lg flex items-start gap-3 text-[#FF4D4D] text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form id="asset-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-[#18B6FF] mb-4 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Asset ID <span className="text-[#FF4D4D]">*</span></label>
                  <input type="text" name="assetId" value={formData.assetId} onChange={handleChange} required
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] focus:ring-1 focus:ring-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Asset Name <span className="text-[#FF4D4D]">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Developer MacBook"
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] focus:ring-1 focus:ring-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-[#19304D]" />

            {/* Hardware Details */}
            <div>
              <h3 className="text-sm font-semibold text-[#00D084] mb-4 uppercase tracking-wider">Hardware Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Model <span className="text-[#FF4D4D]">*</span></label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Serial Number</label>
                  <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none">
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-[#19304D]" />

            {/* Assignment & Status */}
            <div>
              <h3 className="text-sm font-semibold text-[#FFB020] mb-4 uppercase tracking-wider">Assignment & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none">
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Employee Name (Owner)</label>
                  <input type="text" name="assignedToName" value={formData.assignedToName || ''} onChange={handleChange} placeholder="e.g. John Doe"
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Employee Email ID</label>
                  <input type="email" name="assignedToEmail" value={formData.assignedToEmail || ''} onChange={handleChange} placeholder="e.g. john@company.com"
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
              </div>
            </div>

            <hr className="border-[#19304D]" />

            {/* Procurement */}
            <div>
              <h3 className="text-sm font-semibold text-[#B392F0] mb-4 uppercase tracking-wider">Procurement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Purchase Date</label>
                  <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Cost ($)</label>
                  <input type="number" name="cost" value={formData.cost} onChange={handleChange} min="0" step="0.01"
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Vendor</label>
                  <input type="text" name="vendor" value={formData.vendor} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Warranty End Date</label>
                  <input type="date" name="warrantyEnd" value={formData.warrantyEnd} onChange={handleChange}
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#94A3B8]">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none resize-none" />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#19304D] bg-[#071224]/50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#19304D] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="asset-form"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#18B6FF] hover:bg-[#0EA5E9] flex items-center gap-2 shadow-[0_0_15px_rgba(24,182,255,0.2)] hover:shadow-[0_0_20px_rgba(24,182,255,0.4)] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <><Save size={16} /> {initialData ? 'Save Changes' : 'Create Asset'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
