// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { http } from '@/lib/apiClient';
import type { Role } from '@/api/roleApi'; // Assuming Role has permissions

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Set<string>; // A set for quick lookups
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: AdminUser | null;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Helper to get user data from localStorage
const getStoredAdminUser = (): AdminUser | null => {
    const userString = localStorage.getItem('adminUser');
    if (!userString) return null;
    try {
        const userData = JSON.parse(userString);
        // Re-create the Set from the stored array
        userData.permissions = new Set(userData.permissions || []);
        return userData;
    } catch {
        return null;
    }
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(getStoredAdminUser());
  const isAdminAuthenticated = !!localStorage.getItem('adminAuthToken') && !!user;

  useEffect(() => {
    // This effect listens for logout events from other tabs
    const handleLogout = () => {
        setUser(null);
        window.location.href = '/admin/login';
    };
    window.addEventListener('AUTH_LOGOUT_ADMIN', handleLogout);
    return () => window.removeEventListener('AUTH_LOGOUT_ADMIN', handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await http.post<{token: string, user: any}>('/admin/auth/login', { email, password });
      
      // Process permissions into a Set for efficient lookups
      const permissionsSet = new Set<string>();
      userData.roles?.forEach((role: any) => {
          role.permissions?.forEach((perm: any) => {
              if (perm && perm.name) { // Defensive check
                permissionsSet.add(perm.name);
              }
          });
      });
      // Also add role names as permissions for role-based checks if needed
       userData.roles?.forEach((role: any) => {
          if (role && role.name) { // Defensive check
            permissionsSet.add(role.name);
          }
      });

      const fullUser: AdminUser = {
          ...userData,
          permissions: permissionsSet,
      };
      
      // Convert Set to array for JSON serialization, filtering out any invalid values
      const permissionsArray = Array.from(permissionsSet).filter(p => p);
      const storableUser = { ...fullUser, permissions: permissionsArray };

      localStorage.setItem('adminAuthToken', token);
      localStorage.setItem('adminUser', JSON.stringify(storableUser));
      setUser(fullUser);
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    window.location.href = '/admin/login';
  };
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // The 'Admin' role has all permissions
    if (user.permissions.has('Admin')) {
        return true;
    }
    return user.permissions.has(permission);
  };

  const value = { isAdminAuthenticated, login, logout, user, hasPermission };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
