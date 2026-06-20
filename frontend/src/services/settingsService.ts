import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

export interface EmailSettings {
  enabled: boolean;
  notificationEmail: string;
  gmailUser?: string;
  appPassword?: string; // We only send this, never read it back to UI
}

const SETTINGS_DOC = 'system_settings/email_config';

// In-memory fallback
let mockSettings: EmailSettings = {
  enabled: false,
  notificationEmail: '',
  gmailUser: '',
};

export const settingsService = {
  getEmailSettings: async (): Promise<EmailSettings> => {
    if (!isFirebaseConfigured || !db) return { ...mockSettings };

    try {
      const docRef = doc(db, 'system_settings', 'email_config');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          enabled: data.enabled || false,
          notificationEmail: data.notificationEmail || '',
          gmailUser: data.gmailUser || '',
          // Never return appPassword
        };
      }
      return { enabled: false, notificationEmail: '', gmailUser: '' };
    } catch (err) {
      console.error('Error fetching email settings:', err);
      throw err;
    }
  },

  updateEmailSettings: async (settings: EmailSettings): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      mockSettings = { ...mockSettings, ...settings };
      return;
    }

    try {
      const docRef = doc(db, 'system_settings', 'email_config');
      
      // We only update the password if a new one is provided.
      // Otherwise we keep the existing one in Firestore.
      const dataToSave: any = {
        enabled: settings.enabled,
        notificationEmail: settings.notificationEmail,
        gmailUser: settings.gmailUser || '',
        updatedAt: new Date().toISOString()
      };

      if (settings.appPassword) {
        dataToSave.appPassword = settings.appPassword;
      }

      await setDoc(docRef, dataToSave, { merge: true });
    } catch (err) {
      console.error('Error updating email settings:', err);
      throw err;
    }
  }
};
