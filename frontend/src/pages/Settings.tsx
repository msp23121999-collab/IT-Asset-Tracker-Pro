import React, { useState, useEffect } from 'react';
import { Save, Shield, Bell, Database, Mail, Monitor, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import type { EmailSettings } from '@/services/settingsService';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'database' | 'email'>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({ enabled: false, notificationEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (activeTab === 'email' && isSuperAdmin) {
      setEmailLoading(true);
      settingsService.getEmailSettings()
        .then(settings => setEmailSettings(settings))
        .catch(console.error)
        .finally(() => setEmailLoading(false));
    }
  }, [activeTab, isSuperAdmin]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'email' && isSuperAdmin) {
        await settingsService.updateEmailSettings({
          ...emailSettings,
          appPassword: passwordInput || undefined
        });
        setPasswordInput('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-semibold text-white">System Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#18B6FF] hover:bg-[#0EA5E9] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(24,182,255,0.2)] disabled:opacity-50"
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Settings Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-[#18B6FF]/10 text-[#18B6FF] border border-[#18B6FF]/30' : 'text-textSecondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <Monitor size={18} /> General Settings
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-[#18B6FF]/10 text-[#18B6FF] border border-[#18B6FF]/30' : 'text-textSecondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <Bell size={18} /> Notifications
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'email' ? 'bg-[#18B6FF]/10 text-[#18B6FF] border border-[#18B6FF]/30' : 'text-textSecondary hover:bg-card hover:text-white border border-transparent'}`}
            >
              <Mail size={18} /> Email Server
            </button>
          )}
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-[#18B6FF]/10 text-[#18B6FF] border border-[#18B6FF]/30' : 'text-textSecondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <Shield size={18} /> Security
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-[#18B6FF]/10 text-[#18B6FF] border border-[#18B6FF]/30' : 'text-textSecondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <Database size={18} /> Database Backup
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-card border border-borderLight rounded-xl p-8 shadow-lg">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Company Information</h3>
                <p className="text-sm text-textMuted mb-4">Update your company details and branding.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-textSecondary">Company Name</label>
                    <input type="text" defaultValue="TechCorp Global" className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-textSecondary">Support Email</label>
                    <input type="email" defaultValue="it-support@techcorp.com" className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-borderLight">
                <h3 className="text-lg font-medium text-white mb-1">Asset Configuration</h3>
                <p className="text-sm text-textMuted mb-4">Configure default settings for new assets.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textSecondary">Enable Barcode Generation</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18B6FF]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textSecondary">Require Invoice for New Assets</span>
                    <input type="checkbox" className="w-4 h-4 accent-[#18B6FF]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-textSecondary">Default Depreciation Period (Years)</label>
                    <select className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
                      <option>3 Years</option>
                      <option>4 Years</option>
                      <option>5 Years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && isSuperAdmin && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Backend Email System</h3>
                <p className="text-sm text-textMuted mb-4">Configure the sender credentials for automated background emails. Only Super Admins can access this.</p>
                
                {emailLoading ? (
                  <div className="text-sm text-textSecondary">Loading settings...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background border border-borderLight rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          <Key size={16} className="text-[#18B6FF]" /> 
                          Enable Background Emails
                        </div>
                        <div className="text-xs text-textMuted mt-1">If enabled, Cloud Functions will dispatch emails automatically.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailSettings.enabled}
                        onChange={(e) => setEmailSettings(s => ({ ...s, enabled: e.target.checked }))}
                        className="w-4 h-4 accent-[#18B6FF]" 
                      />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-medium text-textSecondary">Notification Sender Email (e.g., admin@company.com)</label>
                      <input 
                        type="email" 
                        value={emailSettings.notificationEmail}
                        onChange={(e) => setEmailSettings(s => ({ ...s, notificationEmail: e.target.value }))}
                        className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" 
                        placeholder="admin@company.com"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-medium text-textSecondary">App Password (Write-Only)</label>
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" 
                        placeholder="******** (Leave blank to keep existing)"
                      />
                      <p className="text-[10px] text-textMuted">For security, the saved password is never displayed. Enter a new one to override.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Email Alerts</h3>
                <p className="text-sm text-textMuted mb-4">Manage automated system emails.</p>
                <div className="space-y-4">
                  {[
                    'Low Stock Alerts',
                    'Warranty Expiration (30 Days)',
                    'Asset Reassignment Needs Approval',
                    'Daily Digest to IT Admins'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background border border-borderLight rounded-lg">
                      <span className="text-sm text-textSecondary flex items-center gap-2"><Mail size={16} /> {item}</span>
                      <input type="checkbox" defaultChecked={i % 2 === 0} className="w-4 h-4 accent-[#18B6FF]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Security Policies</h3>
                <p className="text-sm text-textMuted mb-4">Control access and authentication rules.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background border border-borderLight rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">Require Two-Factor Auth (2FA)</div>
                      <div className="text-xs text-textMuted">Force all IT Admins to use 2FA</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18B6FF]" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="text-xs font-medium text-textSecondary">Session Timeout (Minutes)</label>
                    <input type="number" defaultValue="30" className="w-full bg-background border border-borderLight rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Data Management</h3>
                <p className="text-sm text-textMuted mb-4">Backup and restore system data.</p>
                
                <div className="p-4 bg-background border border-borderLight rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Last Backup</span>
                    <span className="text-xs text-[#00D084]">Successful</span>
                  </div>
                  <div className="text-xs text-textMuted">Today at 03:00 AM</div>
                </div>

                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-[#00D084] hover:bg-[#00BA75] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(0,208,132,0.2)]">
                    <Database size={16} /> Run Manual Backup
                  </button>
                  <button className="flex items-center gap-2 bg-transparent border border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D]/10 px-4 py-2 rounded-md text-sm transition-colors">
                    Reset System Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
