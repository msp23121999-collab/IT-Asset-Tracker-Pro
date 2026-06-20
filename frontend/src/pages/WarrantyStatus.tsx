import React, { useMemo } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export const WarrantyStatus: React.FC = () => {
  const { assets, isLoading } = useAssets();
  const { user } = useAuth();

  const myAssets = useMemo(() => {
    if (!user) return [];
    return assets.filter(a => {
      const emailMatch = a.assignedToEmail && a.assignedToEmail.toLowerCase() === user.email.toLowerCase();
      const uidMatch = a.assignedTo === user.uid;
      const nameMatch = a.assignedToName && a.assignedToName.toLowerCase() === user.displayName.toLowerCase();
      return emailMatch || uidMatch || nameMatch;
    });
  }, [assets, user]);

  const warrantyData = useMemo(() => {
    return myAssets.map(asset => {
      const end = asset.warrantyEnd ? new Date(asset.warrantyEnd) : null;
      const days = end ? differenceInDays(end, new Date()) : null;
      
      let status: 'valid' | 'expiring' | 'expired' | 'unknown' = 'unknown';
      if (days !== null) {
        if (days < 0) status = 'expired';
        else if (days <= 30) status = 'expiring';
        else status = 'valid';
      }

      return {
        ...asset,
        daysRemaining: days,
        warrantyStatus: status
      };
    }).sort((a, b) => {
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [myAssets]);

  const getStatusDisplay = (status: string, days: number | null) => {
    switch (status) {
      case 'expired':
        return (
          <div className="flex items-center gap-2 text-[#FF4D4D] bg-[#FF4D4D]/10 px-3 py-1.5 rounded-lg border border-[#FF4D4D]/20">
            <ShieldAlert size={16} />
            <span className="font-semibold text-sm">Expired {days !== null ? `(${Math.abs(days)} days ago)` : ''}</span>
          </div>
        );
      case 'expiring':
        return (
          <div className="flex items-center gap-2 text-[#FFB020] bg-[#FFB020]/10 px-3 py-1.5 rounded-lg border border-[#FFB020]/20">
            <Clock size={16} />
            <span className="font-semibold text-sm">Expiring Soon ({days} days)</span>
          </div>
        );
      case 'valid':
        return (
          <div className="flex items-center gap-2 text-[#00D084] bg-[#00D084]/10 px-3 py-1.5 rounded-lg border border-[#00D084]/20">
            <ShieldCheck size={16} />
            <span className="font-semibold text-sm">Valid ({days} days remaining)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-textMuted bg-sidebar px-3 py-1.5 rounded-lg border border-borderLight">
            <AlertTriangle size={16} />
            <span className="font-semibold text-sm">No Warranty Data</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent flex items-center gap-3">
          Warranty Status
          {isLoading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </h1>
        <p className="text-sm text-textMuted mt-1">Keep track of the warranty expiration dates for your assigned equipment.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-max overflow-y-auto pb-4 pr-2">
        {warrantyData.length === 0 ? (
          <div className="col-span-full bg-card border border-borderLight rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-64 opacity-80">
            <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
              <ShieldCheck size={24} className="text-[#00D084]" />
            </div>
            <h3 className="text-foreground font-medium mb-2">No Assets Found</h3>
            <p className="text-sm text-textMuted max-w-[250px]">You have no assigned assets to track warranties for.</p>
          </div>
        ) : (
          warrantyData.map(asset => (
            <div key={asset.id} className="bg-card border border-borderLight rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground truncate max-w-[200px]" title={asset.name || asset.model}>
                    {asset.name || asset.model}
                  </h3>
                  <div className="text-xs font-mono text-primary mt-1">{asset.assetId}</div>
                </div>
                {getStatusDisplay(asset.warrantyStatus, asset.daysRemaining)}
              </div>
              
              <div className="mt-auto pt-4 border-t border-borderLight flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-textMuted text-[11px] uppercase tracking-wider font-semibold">Purchase Date</span>
                  <span className="text-textSecondary mt-0.5">
                    {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'MMM d, yyyy') : 'Unknown'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-textMuted text-[11px] uppercase tracking-wider font-semibold">Expiration Date</span>
                  <span className="text-foreground font-medium mt-0.5">
                    {asset.warrantyEnd ? format(new Date(asset.warrantyEnd), 'MMM d, yyyy') : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
