import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmployees } from '@/hooks/useEmployees';
import { Camera, Mail, Building2, UserCircle, Phone, MapPin, ShieldCheck, UploadCloud } from 'lucide-react';
import { storage, db, isFirebaseConfigured } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { employees, updateEmployee } = useEmployees();
  
  const [employeeRecord, setEmployeeRecord] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && employees.length > 0) {
      const record = employees.find(e => e.email?.toLowerCase() === user.email?.toLowerCase());
      if (record) {
        setEmployeeRecord(record);
        setPhone(record.phone || '');
      }
    }
  }, [user, employees]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isFirebaseConfigured || !storage) {
      alert("Firebase Storage is not configured. Cannot upload image.");
      return;
    }

    setIsUploading(true);
    setSuccessMsg('');
    try {
      const storageRef = ref(storage, `avatars/${user?.uid}_${Date.now()}`);
      
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Upload timed out.")), 15000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 1. Update Employee Record (For Admins)
      if (employeeRecord) {
        await updateEmployee(employeeRecord.id, { avatar: downloadURL });
      }

      // 2. Update Auth User Record (For Sidebar/Header)
      if (user?.uid && db) {
        await updateDoc(doc(db, 'users', user.uid), { avatar: downloadURL });
      }

      setSuccessMsg('Profile picture updated successfully! (Refresh to see changes in sidebar)');
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!employeeRecord) return;
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateEmployee(employeeRecord.id, { phone });
      
      if (user?.uid && db) {
        await updateDoc(doc(db, 'users', user.uid), { phone });
      }
      
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      alert(`Failed to update profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent flex items-center gap-3">
            My Profile
          </h1>
          <p className="text-sm text-textMuted mt-1">Manage your personal information and profile picture.</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-[#00D084]/10 border border-[#00D084]/30 text-[#00D084] rounded-xl flex items-center gap-3">
          <ShieldCheck size={20} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-sidebar bg-card overflow-hidden shadow-2xl relative">
              <img 
                src={employeeRecord?.avatar || user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                {isUploading ? (
                  <span className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera size={28} className="text-white mb-2" />
                    <span className="text-xs font-medium text-white">Change Picture</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-1">{employeeRecord?.name || user.displayName}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sidebar border border-borderLight text-xs text-textSecondary mb-4">
            <Building2 size={12} />
            {employeeRecord?.department || user.department || 'General'} Department
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2">
          <div className="bg-card border border-borderLight rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <UserCircle size={20} className="text-primary" />
              Account Details
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={employeeRecord?.name || user.displayName || ''}
                    className="w-full bg-sidebar border border-borderLight rounded-lg px-4 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Employee ID</label>
                  <input
                    type="text"
                    disabled
                    value={employeeRecord?.employeeId || 'N/A'}
                    className="w-full bg-sidebar border border-borderLight rounded-lg px-4 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                  <input
                    type="email"
                    disabled
                    value={employeeRecord?.email || user.email || ''}
                    className="w-full bg-sidebar border border-borderLight rounded-lg pl-10 pr-4 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
                  />
                </div>
                <p className="text-[11px] text-textMuted mt-1.5">Contact IT to change your email address.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-borderLight focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground transition-all outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Role</label>
                  <input
                    type="text"
                    disabled
                    value={employeeRecord?.role || user.role || 'Employee'}
                    className="w-full bg-sidebar border border-borderLight rounded-lg px-4 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                    <input
                      type="text"
                      disabled
                      value={employeeRecord?.location || 'Main Office'}
                      className="w-full bg-sidebar border border-borderLight rounded-lg pl-10 pr-4 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-borderLight flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !employeeRecord}
                className="flex items-center gap-2 bg-[#18B6FF] hover:bg-[#0EA5E9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(24,182,255,0.2)]"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UploadCloud size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
