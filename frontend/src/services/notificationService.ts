import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

export interface AppNotification {
  id: string;
  recipientEmail: string;
  recipientUid?: string;
  title: string;
  message: string;
  type: 'warranty' | 'general' | 'assignment';
  isRead: boolean;
  assetId?: string;
  sendEmail?: boolean;
  emailType?: string;
  createdAt: string;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

// Local mock state for when Firebase is not configured
let localMockNotifications: AppNotification[] = [];
let mockListeners: (() => void)[] = [];

const notifyMockListeners = () => {
  mockListeners.forEach(listener => listener());
};

export const notificationService = {
  subscribeToNotifications: (email: string, uid: string, callback: (notifications: AppNotification[]) => void) => {
    if (!isFirebaseConfigured || !db) {
      // Mock subscription
      const listener = () => {
        const filtered = localMockNotifications.filter(n => 
          n.recipientEmail.toLowerCase() === email.toLowerCase() || n.recipientUid === uid
        );
        callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      };
      mockListeners.push(listener);
      listener(); // initial call
      return () => {
        mockListeners = mockListeners.filter(l => l !== listener);
      };
    }

    try {
      // Create a query that filters by recipientEmail OR recipientUid
      // Note: Firestore doesn't support OR queries perfectly on client, so we usually just query by email
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientEmail', '==', email),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppNotification[];
        callback(notifications);
      }, (error) => {
        console.error("Error subscribing to notifications:", error);
        // Fallback to empty if it fails
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up notification subscription:", error);
      callback([]);
      return () => {};
    }
  },

  sendNotification: async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<void> => {
    const newNotif = {
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      localMockNotifications = [
        { ...newNotif, id: `notif_${Date.now()}` },
        ...localMockNotifications
      ];
      notifyMockListeners();
      return;
    }

    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotif);
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      localMockNotifications = localMockNotifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
  
  deleteNotification: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      localMockNotifications = localMockNotifications.filter(n => n.id !== id);
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
};
