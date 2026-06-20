import React, { useState } from 'react';
import {
  X, UserPlus, Copy, CheckCheck, Eye, EyeOff,
  Mail, Lock, User, Building2, AlertCircle, Phone,
  ShieldCheck, Info,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Generate a cryptographically strong 12-char password */
function generatePassword(length = 12): string {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const syms   = '@#$!%?&';
  const all    = upper + lower + digits + syms;
  const array  = new Uint8Array(length + 4);
  crypto.getRandomValues(array);
  const required = [
    upper[array[0]  % upper.length],
    lower[array[1]  % lower.length],
    digits[array[2] % digits.length],
    syms[array[3]   % syms.length],
  ];
  const rest = Array.from(array.slice(4)).map(b => all[b % all.length]);
  const combined = [...required, ...rest].slice(0, length);
  for (let i = combined.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
}

/** Pad number → EMP-001 */
function padId(n: number): string {
  return `EMP-${String(n).padStart(3, '0')}`;
}

/** Get next employee ID from localStorage list */
function getNextEmployeeId(): string {
  try {
    const raw1 = localStorage.getItem('mock_employees');
    const raw2 = localStorage.getItem('admin_created_employees');
    const list1: any[] = raw1 ? JSON.parse(raw1) : [];
    const list2: any[] = raw2 ? JSON.parse(raw2) : [];
    const all = [...list1, ...list2];
    const max = all.reduce((acc: number, e: any) => {
      const match = String(e.employeeId || '').match(/(\d+)$/);
      return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
    }, 0);
    return padId(max + 1);
  } catch {
    return padId(1);
  }
}

/** Save to mock_employees for auth lookup */
function saveMockEmployee(emp: NewEmployee) {
  try {
    const raw = localStorage.getItem('mock_employees');
    const list: any[] = raw ? JSON.parse(raw) : [];
    // avoid duplicates by email
    const filtered = list.filter((e: any) => e.email.toLowerCase() !== emp.email.toLowerCase());
    filtered.push(emp);
    localStorage.setItem('mock_employees', JSON.stringify(filtered));
  } catch (e) { console.error(e); }
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface NewEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;         // real Gmail entered by admin
  password: string;      // system-generated temp password
  department: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (emp: NewEmployee) => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const CreateEmployeeModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName]             = useState('');
  const [gmail, setGmail]           = useState('');      // real Gmail from admin
  const [department, setDepartment] = useState('Engineering');
  const [phone, setPhone]           = useState('');
  const [step, setStep]             = useState<'form' | 'done'>('form');
  const [created, setCreated]       = useState<NewEmployee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [copied, setCopied]         = useState<Record<string, boolean>>({});

  const departments = [
    'Engineering', 'HR', 'Finance', 'Operations',
    'Security', 'IT Support', 'Marketing', 'Legal',
  ];

  // basic Gmail validation
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleCreate = async () => {
    setError('');
    if (!name.trim())          { setError('Employee full name is required.'); return; }
    if (!gmail.trim())         { setError('Employee Gmail address is required.'); return; }
    if (!isValidEmail(gmail))  { setError('Please enter a valid email address.'); return; }

    setIsSubmitting(true);

    const employeeId = getNextEmployeeId();
    const password   = generatePassword(12);
    const email      = gmail.trim().toLowerCase();

    const emp: NewEmployee = {
      id:         `emp-${Date.now()}`,
      employeeId,
      name:       name.trim(),
      email,
      password,
      department,
      phone:      phone.trim(),
      role:       'employee',
      isActive:   true,
      createdAt:  new Date().toISOString(),
    };

    try {
      if (isFirebaseConfigured && auth && db) {
        // ── Real Firebase: create Auth user + Firestore doc ──
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = credential.user.uid;
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          displayName: emp.name,
          employeeId,
          role: 'employee',
          department,
          phone: emp.phone,
          isActive: true,
          createdAt: emp.createdAt,
          updatedAt: emp.createdAt,
        });
        emp.id = uid;
      } else {
        // ── Mock mode: save to localStorage ──
        await new Promise(r => setTimeout(r, 700));
        saveMockEmployee(emp);
      }

      setCreated(emp);
      setStep('done');
      onCreated?.(emp);
    } catch (err: any) {
      // Firebase: email already in use
      if (err.code === 'auth/email-already-in-use') {
        setError('This Gmail is already registered. Use a different address.');
      } else {
        setError(err.message || 'Failed to create employee account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const reset = () => {
    setStep('form'); setName(''); setGmail('');
    setDepartment('Engineering'); setPhone('');
    setCreated(null); setError(''); setShowPass(false);
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  /* ── Credential copy text for "Copy All" ── */
  const copyAllText = created
    ? `IT Asset Tracker – Employee Login Credentials\n\nEmployee Name: ${created.name}\nEmployee ID:   ${created.employeeId}\nEmail (Gmail): ${created.email}\nTemp Password: ${created.password}\nDepartment:    ${created.department}\n\nPortal URL: http://localhost:5175\nSteps:\n1. Open the portal URL\n2. Select "Employee" on the login page\n3. Enter your Gmail and the temp password above\n   (You can also click "Continue with Google" if your Gmail is already verified)\n\n⚠️ Change your password after first login.`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[460px] bg-[#0D1B32] border border-[#19304D] rounded-2xl shadow-[0_0_40px_rgba(24,182,255,0.12)] overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#18B6FF]/60 to-transparent" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#19304D]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18B6FF]/15 border border-[#18B6FF]/25 flex items-center justify-center">
              <UserPlus size={16} className="text-[#18B6FF]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#E2E8F0]">Create Employee Account</h2>
              <p className="text-[10px] text-[#64748B]">Enter Gmail · System generates ID & temp password</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-[#64748B] hover:text-[#E2E8F0] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">

          {/* ─── STEP 1: Form ─── */}
          {step === 'form' && (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 text-xs text-[#FF4D4D] bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-lg px-3 py-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">
                  Full Name <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="emp-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#071224] border border-[#19304D] focus:border-[#18B6FF]/50 focus:ring-1 focus:ring-[#18B6FF]/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#3F5570] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gmail */}
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">
                  Employee's Gmail Address <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="emp-gmail"
                    type="email"
                    placeholder="e.g. john.doe@gmail.com"
                    value={gmail}
                    onChange={e => setGmail(e.target.value)}
                    className="w-full bg-[#071224] border border-[#19304D] focus:border-[#18B6FF]/50 focus:ring-1 focus:ring-[#18B6FF]/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#3F5570] outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#475569] mt-1 ml-1">Enter the employee's real Gmail — they'll use this to log in.</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Department</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <select
                    id="emp-department"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-[#071224] border border-[#19304D] focus:border-[#18B6FF]/50 focus:ring-1 focus:ring-[#18B6FF]/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] outline-none transition-all appearance-none"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">
                  Phone <span className="text-[#64748B]">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="emp-phone"
                    type="tel"
                    placeholder="+91 99999 00000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#071224] border border-[#19304D] focus:border-[#18B6FF]/50 focus:ring-1 focus:ring-[#18B6FF]/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#3F5570] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Info box */}
              <div className="bg-[#071224] border border-[#00D084]/20 rounded-lg p-3 text-[11px] text-[#64748B] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#00D084] font-semibold mb-1">
                  <Info size={12} /> What happens next
                </div>
                <div>🆔 Employee ID auto-generated — e.g. <span className="text-[#18B6FF] font-mono">EMP-042</span></div>
                <div>📧 Login email = Gmail you enter above — e.g. <span className="text-[#18B6FF] font-mono">john.doe@gmail.com</span></div>
                <div>🔑 A secure 12-char temp password is generated</div>
                <div>🔐 Firebase Auth account created for the employee</div>
                <div>📋 Credentials shown once — share with employee to log in</div>
              </div>

              <button
                id="create-employee-submit"
                onClick={handleCreate}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#18B6FF,#0EA5E9)', boxShadow: '0 0 15px rgba(24,182,255,0.25)' }}
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><ShieldCheck size={15} /> Create Employee Account</>
                )}
              </button>
            </div>
          )}

          {/* ─── STEP 2: Done ─── */}
          {step === 'done' && created && (
            <div className="space-y-4">
              {/* Success */}
              <div className="flex items-center gap-2 text-xs text-[#00D084] bg-[#00D084]/10 border border-[#00D084]/20 rounded-lg px-3 py-2.5">
                <CheckCheck size={14} />
                <span>Account created for <strong>{created.name}</strong>!</span>
              </div>

              {/* Credentials card */}
              <div className="bg-[#071224] border border-[#19304D] rounded-xl p-4 space-y-3">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                  🔐 Credentials — Send these to <span className="text-[#E2E8F0]">{created.name}</span>
                </div>

                {/* Employee ID */}
                <CredRow label="Employee ID" icon={<User size={13} />} value={created.employeeId} fieldKey="id" copied={copied} onCopy={copyToClipboard} mono />

                {/* Gmail (login email) */}
                <CredRow label="Login Email (Gmail)" icon={<Mail size={13} />} value={created.email} fieldKey="email" copied={copied} onCopy={copyToClipboard} />

                {/* Temp Password */}
                <div className="flex items-center justify-between bg-[#0D1B32] border border-[#19304D] rounded-lg px-3 py-2.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Lock size={13} className="text-[#64748B] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#64748B]">Temporary Password</div>
                      <div className="font-mono text-xs text-[#E2E8F0] truncate">
                        {showPass ? created.password : '•'.repeat(created.password.length)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setShowPass(v => !v)} className="text-[#64748B] hover:text-[#E2E8F0] transition-colors p-1">
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => copyToClipboard('password', created.password)} className="text-[#64748B] hover:text-[#18B6FF] transition-colors p-1" title="Copy password">
                      {copied.password ? <CheckCheck size={13} className="text-[#00D084]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* How to login */}
              <div className="bg-[#071224] border border-[#18B6FF]/15 rounded-xl p-4 text-[11px] space-y-1.5 text-[#64748B]">
                <div className="text-[#18B6FF] font-semibold mb-1.5 flex items-center gap-1.5"><Info size={12} /> How the employee logs in</div>
                <div>1. Open <span className="text-[#E2E8F0]">http://localhost:5175</span></div>
                <div>2. Select the <span className="text-[#FFB020] font-semibold">Employee</span> tab</div>
                <div>3. Enter <span className="text-[#E2E8F0] font-mono">{created.email}</span> + the temp password</div>
                <div className="text-[#475569] pt-1">— OR — click <span className="text-white font-medium">"Continue with Google"</span> if their Gmail is verified in Google</div>
              </div>

              <p className="text-[10px] text-[#475569] leading-relaxed">
                ⚠️ These credentials are shown <strong>once here</strong> but are saved in the Employee Accounts panel on this page. Ask the employee to change their password after first login.
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(copyAllText).catch(() => {}); copyToClipboard('all', copyAllText); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg border border-[#19304D] hover:border-[#18B6FF]/40 hover:bg-[#18B6FF]/5 text-[#94A3B8] transition-all"
                >
                  {copied.all ? <CheckCheck size={13} className="text-[#00D084]" /> : <Copy size={13} />}
                  Copy All
                </button>
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#18B6FF,#0EA5E9)', boxShadow: '0 0 10px rgba(24,182,255,0.2)' }}
                >
                  <UserPlus size={13} /> Add Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Shared credential row
// ──────────────────────────────────────────────
const CredRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  fieldKey: string;
  copied: Record<string, boolean>;
  onCopy: (key: string, value: string) => void;
  mono?: boolean;
}> = ({ label, icon, value, fieldKey, copied, onCopy, mono }) => (
  <div className="flex items-center justify-between bg-[#0D1B32] border border-[#19304D] rounded-lg px-3 py-2.5 gap-2">
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[#64748B] shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] text-[#64748B]">{label}</div>
        <div className={`text-xs text-[#E2E8F0] truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
    </div>
    <button
      onClick={() => onCopy(fieldKey, value)}
      className="text-[#64748B] hover:text-[#18B6FF] transition-colors p-1 shrink-0"
      title={`Copy ${label}`}
    >
      {copied[fieldKey] ? <CheckCheck size={13} className="text-[#00D084]" /> : <Copy size={13} />}
    </button>
  </div>
);
