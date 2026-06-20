import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Employee } from '@/types/employee';
import { mockEmployees } from '@/lib/mock-data';

const EMPLOYEES_COLLECTION = 'employees';

let localMockEmployees = [...mockEmployees];
type EmployeeListener = (employees: Employee[]) => void;
const mockListeners: EmployeeListener[] = [];

const notifyMockListeners = () => {
  mockListeners.forEach(listener => listener([...localMockEmployees]));
};

export const employeeService = {
  subscribeToEmployees: (callback: EmployeeListener): (() => void) => {
    if (!isFirebaseConfigured || !db) {
      callback([...localMockEmployees]);
      mockListeners.push(callback);
      return () => {
        const idx = mockListeners.indexOf(callback);
        if (idx > -1) mockListeners.splice(idx, 1);
      };
    }

    const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const employees: Employee[] = [];
      snapshot.forEach((doc) => {
        employees.push({ id: doc.id, ...doc.data() } as Employee);
      });
      callback(employees);
    }, (error) => {
      console.error("Error subscribing to employees:", error);
    });
  },

  addEmployee: async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newEmployee = {
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      const id = `mock-emp-${Date.now()}`;
      localMockEmployees = [{ id, ...newEmployee } as Employee, ...localMockEmployees];
      notifyMockListeners();
      return id;
    }

    try {
      const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), newEmployee);
      return docRef.id;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<void> => {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      localMockEmployees = localMockEmployees.map(emp => 
        emp.id === id ? { ...emp, ...updatedData } : emp
      );
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, id);
      await updateDoc(docRef, updatedData);
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },

  deleteEmployee: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      localMockEmployees = localMockEmployees.filter(emp => emp.id !== id);
      notifyMockListeners();
      return;
    }

    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },
};
