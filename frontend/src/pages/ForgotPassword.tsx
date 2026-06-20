import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, error, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to send password reset email. Check if email is correct.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071224] text-[#E2E8F0] px-4 relative overflow-hidden font-sans">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#18B6FF]/5 rounded-full blur-[120px] pointer-events-none"></div>
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
            Reset Password
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Recover your IT Asset Tracker account access</p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-[#00D084]/15 border border-[#00D084]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,208,132,0.1)] text-[#00D084] animate-bounce">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-lg font-semibold text-white">Reset Email Sent!</h2>
            <p className="text-xs text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
              We've sent a password reset link to <span className="text-[#18B6FF] font-medium">{email}</span>. 
              Please check your inbox and follow the instructions.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#18B6FF] hover:underline font-semibold"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Errors */}
            {(formError || error) && (
              <div className="mb-6 p-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-lg text-xs text-[#FF4D4D] flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{formError || error}</div>
              </div>
            )}

            <p className="text-xs text-[#94A3B8] mb-6 text-center leading-relaxed">
              Enter the email address associated with your account, and we will email you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#071224] border border-[#19304D] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#18B6FF]/50 focus:ring-1 focus:ring-[#18B6FF]/50 transition-all"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#18B6FF] hover:bg-[#0EA5E9] active:scale-[0.98] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(24,182,255,0.15)] hover:shadow-[0_0_20px_rgba(24,182,255,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Login link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#94A3B8] hover:text-[#18B6FF] transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
