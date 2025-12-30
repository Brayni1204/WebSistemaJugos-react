import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { http } from '@/lib/apiClient'; // Use the main http client

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: User | null;
  setAuthData: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('customerAuthToken');
        if (token) {
            try {
                // apiClient handles the token automatically, we just need to specify the authType
                const userData = await http.get<User>('/auth/me', { authType: 'customer' });
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to fetch user with token:', error);
                logout();
            }
        }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await http.post<LoginResponse>('/auth/login', { email, password });
      if (data.token && data.user) {
        localStorage.setItem('customerAuthToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('customerAuthToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Function to manually set auth state after verification
  const setAuthData = (token: string, userData: User) => {
    localStorage.setItem('customerAuthToken', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = { isAuthenticated, login, logout, user, setAuthData };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Also need to define LoginResponse type here or import it
interface LoginResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

