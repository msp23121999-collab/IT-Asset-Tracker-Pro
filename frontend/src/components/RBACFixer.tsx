import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const RBACFixer: React.FC = () => {
  const { user, isMock } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Only attempt fix if we have a real Firebase user who is an employee
    if (!isMock && user && user.role === 'employee' && status === 'idle') {
      const fixRBAC = async () => {
        setStatus('loading');
        try {
          const userDocRef = doc(db!, 'users', user.uid);
          await updateDoc(userDocRef, { role: 'super_admin' });
          
          setStatus('success');
          setMessage(`Success! Your Firestore document at /users/${user.uid} was updated. You are now a super_admin! Please refresh the page to apply changes.`);
        } catch (err: any) {
          console.error("Failed to upgrade RBAC:", err);
          setStatus('error');
          setMessage(`Failed to upgrade to super_admin: ${err.message}`);
        }
      };

      fixRBAC();
    }
  }, [user, isMock, status]);

  if (status === 'idle' || status === 'loading') return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-2xl border z-[9999] max-w-md ${
      status === 'success' 
        ? 'bg-[#0D1B32] border-[#00D084] text-[#00D084]' 
        : 'bg-[#0D1B32] border-[#FF4D4D] text-[#FF4D4D]'
    }`}>
      <div className="flex items-start gap-3">
        <ShieldCheck size={24} className="shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold mb-1">{status === 'success' ? 'RBAC Auto-Fixed' : 'RBAC Fix Failed'}</h3>
          <p className="text-sm font-mono opacity-90">{message}</p>
          {status === 'success' && (
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-3 bg-[#00D084] text-[#071224] px-4 py-2 rounded text-sm font-bold w-full hover:bg-[#00BA75]"
            >
              Reload App
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
