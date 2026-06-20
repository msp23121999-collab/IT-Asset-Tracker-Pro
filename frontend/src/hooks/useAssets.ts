import { useState, useEffect } from 'react';
import type { Asset } from '@/types/asset';
import { assetService } from '@/services/assetService';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = assetService.subscribeToAssets((newAssets) => {
      setAssets(newAssets);
      setIsLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const addAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await assetService.addAsset(assetData);
    } catch (err: any) {
      setError(err.message || 'Failed to add asset');
      throw err;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      await assetService.updateAsset(id, updates);
    } catch (err: any) {
      setError(err.message || 'Failed to update asset');
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await assetService.deleteAsset(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset');
      throw err;
    }
  };

  return {
    assets,
    isLoading,
    error,
    addAsset,
    updateAsset,
    deleteAsset
  };
};
