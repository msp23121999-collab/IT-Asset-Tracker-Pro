import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { User } from '@/types/user';

const AUDIT_COLLECTION = 'audit_logs';

export const auditService = {
  /**
   * Log an unauthorized access attempt to the database.
   */
  logUnauthorizedAccess: async (user: User | null, attemptedRoute: string) => {
    if (!isFirebaseConfigured || !db) {
      console.warn(`[MOCK AUDIT] Unauthorized access blocked for route: ${attemptedRoute}`);
      return;
    }

    try {
      await addDoc(collection(db, AUDIT_COLLECTION), {
        action: 'UNAUTHORIZED_ACCESS',
        userId: user?.uid || 'anonymous',
        email: user?.email || 'unknown',
        role: user?.role || 'none',
        routeAttempted: attemptedRoute,
        timestamp: serverTimestamp(),
        // IP address usually needs a Cloud Function to be recorded accurately, 
        // but we record the client-side attempt here.
        userAgent: navigator.userAgent
      });
      console.error(`Unauthorized access logged for route: ${attemptedRoute}`);
    } catch (error) {
      console.error("Failed to write to audit log", error);
    }
  },

  logAction: async (user: User | null, action: string, details: string) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      await addDoc(collection(db, AUDIT_COLLECTION), {
        action,
        details,
        userId: user?.uid || 'anonymous',
        email: user?.email || 'unknown',
        role: user?.role || 'none',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to write to audit log", error);
    }
  },

  fetchAuditLogs: async (maxLogs: number = 100) => {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(maxLogs));
      const querySnapshot = await getDocs(q);
      const logs: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
        });
      });
      return logs;
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
      return [];
    }
  }
};
