import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';
import type { Asset } from '@/types/asset';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSend: (data: { title: string; message: string; sendEmail: boolean }) => Promise<void>;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, onClose, asset, onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Auto-fill template if asset is provided
  React.useEffect(() => {
    if (isOpen && asset) {
      setTitle(`Asset Update: ${asset.name || asset.model}`);
      setMessage(`Hello ${asset.assignedToName || 'Employee'},\n\nThis is a notification regarding your assigned asset (ID: ${asset.assetId}).\n\n[Please add your message here...]`);
      setSendEmail(true); // Default to true
    }
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await onSend({ title, message, sendEmail });
      
      onClose();
    } catch (err: any) {
      alert(`Failed to send notification: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-borderLight rounded-xl w-full max-w-lg shadow-[0_0_30px_rgba(24,182,255,0.1)] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-borderLight shrink-0 bg-[#0D1B32]/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Send size={18} className="text-primary" />
              Notify Employee
            </h2>
            <p className="text-xs text-textMuted mt-0.5">Send a message to {asset.assignedToName || asset.assignedToEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sidebar rounded-lg text-textMuted hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-5 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Recipient</label>
              <input
                type="text"
                disabled
                value={asset.assignedToEmail || 'No email assigned'}
                className="w-full bg-sidebar border border-borderLight rounded-lg px-3.5 py-2.5 text-sm text-textSecondary cursor-not-allowed opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Subject / Title <span className="text-[#FF4D4D]">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-background border border-borderLight focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none transition-all"
                placeholder="e.g. Warranty Expiring Soon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Message <span className="text-[#FF4D4D]">*</span></label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="w-full bg-background border border-borderLight focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none transition-all resize-none"
                placeholder="Type your message here..."
              />
            </div>

            <label className="flex items-center gap-3 p-3 border border-borderLight rounded-lg cursor-pointer hover:bg-sidebar/50 transition-colors">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="rounded border-borderLight bg-background text-primary focus:ring-primary/30"
              />
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-textSecondary" />
                <span className="text-sm font-medium text-foreground">Also send an email to user</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-borderLight">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-foreground hover:bg-sidebar rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !asset.assignedToEmail}
              className="flex items-center gap-2 bg-[#18B6FF] hover:bg-[#0EA5E9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(24,182,255,0.2)]"
            >
              {isSending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {sendEmail ? 'Send Email & Notification' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
