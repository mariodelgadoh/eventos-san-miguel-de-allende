import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const userData: AuthResponse = await authService.login(email, password);
    // Convertir AuthResponse a User
    const user: User = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      token: userData.token,
      createdAt: new Date().toISOString(),
      isBlocked: false
    };
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const userData: AuthResponse = await authService.register(name, email, password, role);
    // Convertir AuthResponse a User
    const user: User = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      token: userData.token,
      createdAt: new Date().toISOString(),
      isBlocked: false
    };
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isOrganizer }}>
      {children}
    </AuthContext.Provider>
  );
};