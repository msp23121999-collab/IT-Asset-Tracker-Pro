import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background text-textPrimary p-6">
      <div className="w-24 h-24 bg-[#FF4D4D]/10 rounded-full flex items-center justify-center mb-6 border border-[#FF4D4D]/20 shadow-[0_0_30px_rgba(255,77,77,0.15)]">
        <ShieldAlert size={48} className="text-[#FF4D4D]" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2 text-white">Access Denied</h1>
      <p className="text-textSecondary mb-8 text-center max-w-md">
        You do not have permission to access this page. This attempt has been logged.
      </p>
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-sidebar hover:bg-card border border-borderLight px-6 py-3 rounded-lg text-sm font-medium transition-colors shadow-lg"
      >
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );
};
