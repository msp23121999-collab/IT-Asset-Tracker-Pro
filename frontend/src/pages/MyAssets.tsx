import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Monitor, Box, Smartphone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { ASSET_STATUS_CONFIG } from '@/types/asset';
import type { Asset } from '@/types/asset';
import { format, differenceInDays } from 'date-fns';

const CATEGORY_IMAGES: Record<string, string> = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  desktop: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=400&q=80',
  monitor: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?auto=format&fit=crop&w=400&q=80',
  printer: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
  server: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
  router: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  switch: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
  tablet: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
  accessory: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
  other: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'
};

export const MyAssets: React.FC = () => {
  const { assets, isLoading } = useAssets();
  const { user } = useAuth();
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assets to only those assigned to the logged in employee
  const myAssets = useMemo(() => {
    if (!user) return [];
    return assets.filter(a => {
      // Check multiple possible linkage points
      const emailMatch = a.assignedToEmail && a.assignedToEmail.toLowerCase() === user.email.toLowerCase();
      const uidMatch = a.assignedTo === user.uid;
      const nameMatch = a.assignedToName && a.assignedToName.toLowerCase() === user.displayName.toLowerCase();
      return emailMatch || uidMatch || nameMatch;
    });
  }, [assets, user]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return myAssets;
    const q = searchQuery.toLowerCase();
    return myAssets.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.model.toLowerCase().includes(q) || 
      a.assetId.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q)
    );
  }, [myAssets, searchQuery]);

  useEffect(() => {
    if (filteredAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(filteredAssets[0]);
    }
  }, [filteredAssets, selectedAsset]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'laptop': return <Monitor size={20} className="text-[#18B6FF]" />;
      case 'desktop': return <Monitor size={20} className="text-[#18B6FF]" />;
      case 'mobile': return <Smartphone size={20} className="text-[#FFB020]" />;
      default: return <Box size={20} className="text-[#00D084]" />;
    }
  };

  const getWarrantyStatus = (dateStr?: string) => {
    if (!dateStr) return { text: 'Unknown', color: 'text-textMuted' };
    const end = new Date(dateStr);
    const days = differenceInDays(end, new Date());
    if (days < 0) return { text: 'Expired', color: 'text-[#FF4D4D]' };
    if (days < 30) return { text: `Expiring soon (${days} days)`, color: 'text-[#FFB020]' };
    return { text: `Valid (${days} days left)`, color: 'text-[#00D084]' };
  };

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent flex items-center gap-3">
            My Assigned Assets
            {isLoading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </h1>
          <p className="text-sm text-textMuted mt-1">View details and warranty information for your assigned equipment.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input
            type="text"
            placeholder="Search your assets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-borderLight rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-textMuted"
          />
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 relative">
        {/* ── Asset List ── */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
          {filteredAssets.length === 0 ? (
            <div className="bg-card border border-borderLight rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-64 opacity-80">
              <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-[#00D084]" />
              </div>
              <h3 className="text-foreground font-medium mb-2">No Assets Assigned</h3>
              <p className="text-sm text-textMuted max-w-[250px]">You currently have no equipment assigned to you. Contact IT if you believe this is a mistake.</p>
            </div>
          ) : (
            filteredAssets.map(asset => {
              const wStatus = getWarrantyStatus(asset.warrantyEnd);
              return (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${
                    selectedAsset?.id === asset.id 
                      ? 'border-[#18B6FF] shadow-[0_0_15px_rgba(24,182,255,0.15)] bg-gradient-to-r from-[#18B6FF]/5 to-transparent' 
                      : 'border-borderLight hover:border-[#18B6FF]/50 hover:bg-cardHover'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-sidebar border border-borderLight flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={CATEGORY_IMAGES[asset.category?.toLowerCase()] || CATEGORY_IMAGES.other} 
                      alt={asset.model} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{asset.name || asset.model}</h3>
                    <div className="flex items-center gap-3 text-xs text-textMuted mt-1">
                      <span className="font-mono">{asset.assetId}</span>
                      <span>•</span>
                      <span className="capitalize">{asset.brand}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_STATUS_CONFIG[asset.status].color }} />
                      <span className="text-xs font-medium capitalize" style={{ color: ASSET_STATUS_CONFIG[asset.status].color }}>
                        {ASSET_STATUS_CONFIG[asset.status].label}
                      </span>
                    </div>
                    <div className={`text-[11px] font-medium ${wStatus.color}`}>{wStatus.text}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Asset Details Sidebar ── */}
        <div className="w-80 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1 pb-4">
          {selectedAsset ? (
            <div className="bg-card border border-borderLight rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: ASSET_STATUS_CONFIG[selectedAsset.status].color }} />
              
              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-20 h-20 rounded-lg bg-background border border-borderLight flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <img 
                    src={CATEGORY_IMAGES[selectedAsset.category?.toLowerCase()] || CATEGORY_IMAGES.other} 
                    alt={selectedAsset.model} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">{selectedAsset.name || selectedAsset.model}</h3>
                  <div className="text-sm text-[#18B6FF] font-mono bg-[#18B6FF]/10 inline-block px-2 py-0.5 rounded border border-[#18B6FF]/20">{selectedAsset.assetId}</div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Specs Section */}
                <div>
                  <h4 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Box size={14} /> Basic Details
                  </h4>
                  <div className="bg-sidebar rounded-lg p-3 space-y-2.5 text-sm border border-borderLight/50">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Category</span>
                      <span className="text-foreground capitalize">{selectedAsset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Brand / Model</span>
                      <span className="text-foreground">{selectedAsset.brand} {selectedAsset.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Serial Number</span>
                      <span className="text-foreground font-mono text-[11px] bg-background px-1.5 py-0.5 rounded border border-borderLight">{selectedAsset.serialNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Warranty Section */}
                <div>
                  <h4 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} /> Warranty & Support
                  </h4>
                  <div className="bg-sidebar rounded-lg p-3 space-y-2.5 text-sm border border-borderLight/50">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Purchase Date</span>
                      <span className="text-foreground">
                        {selectedAsset.purchaseDate ? format(new Date(selectedAsset.purchaseDate), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Warranty Ends</span>
                      <span className="text-foreground">
                        {selectedAsset.warrantyEnd ? format(new Date(selectedAsset.warrantyEnd), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-borderLight/30">
                      <span className="text-textSecondary flex items-center gap-1"><Clock size={12}/> Status</span>
                      <span className={`font-medium ${getWarrantyStatus(selectedAsset.warrantyEnd).color}`}>
                        {getWarrantyStatus(selectedAsset.warrantyEnd).text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-borderLight rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-64 opacity-70">
              <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
                <Eye size={24} className="text-textMuted" />
              </div>
              <p className="text-sm text-textMuted max-w-[200px]">Select an asset to view its warranty and specifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
