import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { loginWithGoogle, error, isLoading, isMock } = useAuth();
  const navigate = useNavigate();
  
  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      navigate('/assets');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071224] text-[#E2E8F0] px-4 relative overflow-hidden font-sans">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#18B6FF]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D084]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0D1B32] border border-[#19304D] rounded-2xl p-8 shadow-[0_0_30px_rgba(24,182,255,0.05)] relative z-10">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/30 to-transparent"></div>
        
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#18B6FF]/15 border border-[#18B6FF]/30 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(24,182,255,0.1)]">
            <Shield className="text-[#18B6FF]" size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Join IT Asset Tracker Pro</p>
        </div>

        {/* Info Banner for Mock Mode */}
        {isMock && (
          <div className="mb-6 p-3 bg-[#18B6FF]/10 border border-[#18B6FF]/20 rounded-lg text-xs text-[#18B6FF] flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Mock Demo Mode Enabled</span>. Firebase credentials are not configured yet. This button will log you in as a mock demo user.
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="mb-6 p-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-lg text-xs text-[#FF4D4D] flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </button>
        </div>

        {/* Login footer link */}
        <div className="mt-6 text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#18B6FF] hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
