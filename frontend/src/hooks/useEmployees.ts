import { useState, useEffect } from 'react';
import type { Employee } from '@/types/employee';
import { employeeService } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { auditService } from '@/services/auditService';

export const useEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = employeeService.subscribeToEmployees((newEmployees) => {
      setEmployees(newEmployees);
      setIsLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await employeeService.addEmployee(employeeData);
      auditService.logAction(user, 'ADD_EMPLOYEE', `Added employee ${employeeData.name}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add employee');
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await employeeService.updateEmployee(id, updates);
      auditService.logAction(user, 'UPDATE_EMPLOYEE', `Updated employee ${updates.name || id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update employee');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);
      auditService.logAction(user, 'DELETE_EMPLOYEE', `Deleted employee ID ${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
      throw err;
    }
  };

  return {
    employees,
    isLoading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
