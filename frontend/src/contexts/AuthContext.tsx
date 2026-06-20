import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { auditService } from '@/services/auditService';
import type { User, UserRole } from '@/types/user';

type LoginMode = 'super_admin' | 'employee';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isMock: boolean;
  login: (email: string, password: string, mode: LoginMode) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole, department: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithGoogle: (mode: LoginMode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock] = useState(!isFirebaseConfigured);

  // Helper to load mock employees for login checks
  const getMockEmployee = (email: string) => {
    try {
      const mockEmployeesRaw = localStorage.getItem('mock_employees');
      if (mockEmployeesRaw) {
        const list = JSON.parse(mockEmployeesRaw);
        return list.find((e: any) => e.email.toLowerCase() === email.toLowerCase());
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock Auth State Restoring
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
      return;
    }

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db!, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userDoc.data(),
            } as User);
          } else {
            // Lazy Backfill: Create user profile in Firestore if it doesn't exist
            const newUserProfile = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: 'employee' as UserRole,
              department: 'General',
              phone: '',
              avatar: firebaseUser.photoURL || '',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            try {
              await setDoc(userDocRef, newUserProfile);
              console.log(`[Lazy Backfill] Created Firestore document for ${firebaseUser.uid} at users/${firebaseUser.uid}`);
            } catch (createErr: any) {
              console.error("Failed to lazy backfill user document", createErr);
            }

            setUser({
              uid: firebaseUser.uid,
              ...newUserProfile
            });
          }
        } catch (err: any) {
          console.error("Error fetching user profile:", err);
          setError(err.message || 'Failed to fetch user profile');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper: check if a role is allowed for a login mode
  const isRoleAllowedForMode = (role: UserRole, mode: LoginMode): boolean => {
    if (mode === 'super_admin') {
      // Super IT Admin mode: only super_admin and it_admin can log in
      return role === 'super_admin' || role === 'it_admin';
    }
    // Employee mode: only employees
    return role === 'employee';
  };

  const getModeLabel = (mode: LoginMode): string => {
    return mode === 'super_admin' ? 'Super IT Admin' : 'Employee';
  };

  const login = async (email: string, password: string, mode: LoginMode) => {
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Login Flow
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          const emailLower = email.toLowerCase();
          
          let role: UserRole = 'employee';
          let displayName = 'Employee User';
          let department = 'Engineering';
          let phone = '';
          let uid = 'mock-user-123';

          if (emailLower === 'superadmin@company.com') {
            role = 'super_admin';
            displayName = 'Super Admin';
            department = 'IT Support';
            uid = 'mock-superadmin-001';
          } else if (emailLower === 'itadmin@company.com') {
            role = 'it_admin';
            displayName = 'IT Admin';
            department = 'IT Support';
            uid = 'mock-itadmin-002';
          } else {
            // Check if matches a mock employee created by admin
            const emp = getMockEmployee(email);
            if (emp) {
              // Validate the generated password (exact match required)
              if (emp.password && password !== emp.password) {
                setError('Invalid password. Check the credentials provided by your IT Admin.');
                setIsLoading(false);
                reject(new Error('Invalid password'));
                return;
              }
              displayName = emp.name;
              department = emp.department;
              phone = emp.phone || '';
              uid = `mock-emp-${emp.id}`;
              role = 'employee';
            } else if (emailLower.includes('admin')) {
              role = 'it_admin';
              displayName = 'Mock Admin';
              department = 'IT Support';
            } else {
              role = 'employee';
              displayName = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            }
          }

          // ── STRICT MODE ENFORCEMENT ──
          if (!isRoleAllowedForMode(role, mode)) {
            const msg = mode === 'super_admin'
              ? 'Access denied. This account is registered as an Employee. Please use the Employee login mode.'
              : 'Access denied. This account is an Admin account. Please use the Super IT Admin login mode.';
            setError(msg);
            setIsLoading(false);
            reject(new Error(msg));
            return;
          }

          const mockUser: User = {
            uid,
            email,
            displayName,
            role,
            department,
            phone,
            avatar: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUser(mockUser);
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
          setIsLoading(false);
          resolve();
        }, 800);
      });
    }

    try {
      const credential = await signInWithEmailAndPassword(auth!, email, password);
      // Fetch role from Firestore and enforce mode
      const userDocRef = doc(db!, 'users', credential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const role = userDoc.exists() ? (userDoc.data().role as UserRole) : 'employee';

      if (!isRoleAllowedForMode(role, mode)) {
        // Sign out immediately — wrong mode
        await signOut(auth!);
        const msg = mode === 'super_admin'
          ? 'Access denied. This account is registered as an Employee. Please use the Employee login mode.'
          : 'Access denied. This account is an Admin account. Please use the Super IT Admin login mode.';
        setError(msg);
        setIsLoading(false);
        throw new Error(msg);
      }

      const firebaseUser = credential.user;
      const userProfile: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: userDoc.exists() ? userDoc.data().displayName : firebaseUser.displayName || '',
        role: role,
        department: userDoc.exists() ? userDoc.data().department : '',
        phone: userDoc.exists() ? userDoc.data().phone : '',
        avatar: userDoc.exists() ? userDoc.data().avatar : '',
        isActive: userDoc.exists() ? userDoc.data().isActive : true,
        createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
        updatedAt: userDoc.exists() ? userDoc.data().updatedAt : new Date().toISOString()
      };

      auditService.logAction(userProfile, 'USER_LOGIN', `Logged in as ${mode}`);
    } catch (err: any) {
      if (!error) setError(err.message || 'Login failed');
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole, 
    department: string, 
    phone: string = ''
  ) => {
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Register Flow
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const mockUser: User = {
            uid: `mock-user-${Date.now()}`,
            email,
            displayName,
            role,
            department,
            phone,
            avatar: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(mockUser);
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
          setIsLoading(false);
          resolve();
        }, 800);
      });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const firebaseUser = userCredential.user;

      // Save user record to Firestore
      const userProfile: Omit<User, 'uid'> = {
        email,
        displayName,
        role,
        department,
        phone,
        avatar: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db!, 'users', firebaseUser.uid), userProfile);
      
      setUser({
        uid: firebaseUser.uid,
        ...userProfile
      });
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Logout Flow
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setUser(null);
          localStorage.removeItem('auth_user');
          setIsLoading(false);
          resolve();
        }, 500);
      });
    }

    try {
      await signOut(auth!);
      setUser(null);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      setIsLoading(false);
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Reset Flow
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 500);
      });
    }

    try {
      await sendPasswordResetEmail(auth!, email);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (mode: LoginMode) => {
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Login Flow for Google
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // In mock mode, Google login creates a user matching the selected mode
          const mockRole: UserRole = mode === 'super_admin' ? 'super_admin' : 'employee';

          const mockUser: User = {
            uid: `mock-google-${Date.now()}`,
            email: 'demo.user@company.com',
            displayName: 'Demo User',
            role: mockRole,
            department: 'General',
            phone: '',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(mockUser);
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
          setIsLoading(false);
          resolve();
        }, 800);
      });
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth!, provider);
      
      // Check if this is a new user
      const additionalInfo = getAdditionalUserInfo(result);
      let role: UserRole = 'employee';
      
      if (additionalInfo?.isNewUser) {
        // Create user document in Firestore
        const userProfile: Omit<User, 'uid'> = {
          email: result.user.email || '',
          displayName: result.user.displayName || 'New User',
          role: 'employee',
          department: 'General',
          phone: result.user.phoneNumber || '',
          avatar: result.user.photoURL || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db!, 'users', result.user.uid), userProfile);
        role = 'employee';
      } else {
        // Existing user — fetch role from Firestore
        const userDocRef = doc(db!, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        role = userDoc.exists() ? (userDoc.data().role as UserRole) : 'employee';
      }

      // ── STRICT MODE ENFORCEMENT ──
      if (!isRoleAllowedForMode(role, mode)) {
        await signOut(auth!);
        const msg = mode === 'super_admin'
          ? 'Access denied. This Google account is registered as an Employee. Please use the Employee login mode.'
          : 'Access denied. This Google account is an Admin account. Please use the Super IT Admin login mode.';
        setError(msg);
        setUser(null);
        setIsLoading(false);
        throw new Error(msg);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (!error) setError(err.message || 'Google Sign-In failed');
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      isMock,
      login,
      register,
      logout,
      forgotPassword,
      loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
