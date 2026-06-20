import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Asset } from '@/types/asset';
import { mockAssets } from '@/lib/mock-data';

const ASSETS_COLLECTION = 'assets';

// In-memory fallback for Mock mode
let localMockAssets = [...mockAssets];
type AssetListener = (assets: Asset[]) => void;
const mockListeners: AssetListener[] = [];

const notifyMockListeners = () => {
  mockListeners.forEach(listener => listener([...localMockAssets]));
};

export const assetService = {
  /**
   * Subscribe to real-time asset updates
   */
  subscribeToAssets: (callback: AssetListener): (() => void) => {
    if (!isFirebaseConfigured || !db) {
      // Mock mode: immediately call with current data, and add to listeners
      callback([...localMockAssets]);
      mockListeners.push(callback);
      return () => {
        const idx = mockListeners.indexOf(callback);
        if (idx > -1) mockListeners.splice(idx, 1);
      };
    }

    const q = query(collection(db, ASSETS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const assets: Asset[] = [];
      snapshot.forEach((doc) => {
        assets.push({ id: doc.id, ...doc.data() } as Asset);
      });
      callback(assets);
    }, (error) => {
      console.error("Error subscribing to assets:", error);
    });
  },

  /**
   * Add a new asset
   */
  addAsset: async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newAsset = {
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      const id = `mock-asset-${Date.now()}`;
      localMockAssets = [{ id, ...newAsset } as Asset, ...localMockAssets];
      notifyMockListeners();
      return id;
    }

    try {
      // Firebase uses serverTimestamp() for true timestamps, but ISO strings are easier for the UI
      const docRef = await addDoc(collection(db, ASSETS_COLLECTION), newAsset);
      return docRef.id;
    } catch (error) {
      console.error("Error adding asset:", error);
      throw error;
    }
  },

  /**
   * Update an existing asset
   */
  updateAsset: async (id: string, updates: Partial<Asset>): Promise<void> => {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      localMockAssets = localMockAssets.map(asset => 
        asset.id === id ? { ...asset, ...updatedData } : asset
      );
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, ASSETS_COLLECTION, id);
      await updateDoc(docRef, updatedData);
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  },

  /**
   * Delete an asset
   */
  deleteAsset: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      localMockAssets = localMockAssets.filter(asset => asset.id !== id);
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, ASSETS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting asset:", error);
      throw error;
    }
  },
};
