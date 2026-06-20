import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { DEPARTMENTS } from '@/lib/constants';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Employee | null;
  isLoading?: boolean;
}

const ROLES = ['employee', 'it_admin', 'super_admin'];

const DEFAULT_FORM_DATA = {
  employeeId: '',
  name: '',
  email: '',
  department: 'Engineering',
  role: 'employee',
  phone: '',
  userId: '',
  assignedAssets: [],
  avatar: '',
  isActive: true,
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<any>(DEFAULT_FORM_DATA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ 
          ...DEFAULT_FORM_DATA, 
          employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.employeeId || !formData.name || !formData.email) {
      setError('Please fill in all required fields (Employee ID, Name, Email)');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#071224]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0D1B32] border-l border-[#19304D] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#19304D] bg-[#071224]/50">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#19304D] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#19304D] scrollbar-track-transparent">
          {error && (
            <div className="mb-6 p-4 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-lg flex items-start gap-3 text-[#FF4D4D] text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Employee ID <span className="text-[#FF4D4D]">*</span></label>
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Full Name <span className="text-[#FF4D4D]">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Email Address <span className="text-[#FF4D4D]">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Department</label>
                <select name="department" value={formData.department} onChange={handleChange}
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Role (Access Level)</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#18B6FF] outline-none capitalize">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
                <p className="text-[10px] text-[#FFB020] mt-1 italic">Note: Changing a role affects what pages they can view.</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#19304D]">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} 
                  className="rounded border-[#19304D] bg-[#071224] text-[#18B6FF] focus:ring-[#18B6FF]" />
                <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
                  Active Employee Account
                </label>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-[#19304D] bg-[#071224]/50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#19304D] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="employee-form" disabled={isLoading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#00D084] hover:bg-[#00BA75] flex items-center gap-2 shadow-[0_0_15px_rgba(0,208,132,0.2)] hover:shadow-[0_0_20px_rgba(0,208,132,0.4)] transition-all disabled:opacity-50">
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <><Save size={16} /> {initialData ? 'Save Changes' : 'Create Employee'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
