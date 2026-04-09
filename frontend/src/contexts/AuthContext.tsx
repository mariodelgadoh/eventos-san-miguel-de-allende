import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';
import { useToast } from './ToastContext';

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
  const { showToast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData: AuthResponse = await authService.login(email, password);
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
      showToast(`¡Bienvenido, ${user.name}!`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al iniciar sesión', 'error');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const userData: AuthResponse = await authService.register(name, email, password, role);
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
      showToast(`¡Cuenta creada exitosamente! Bienvenido, ${user.name}`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al registrarse', 'error');
      throw error;
    }
  };

  const logout = () => {
    const userName = user?.name;
    authService.logout();
    setUser(null);
    showToast(`¡Hasta luego, ${userName}! Has cerrado sesión`, 'info');
  };

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isOrganizer }}>
      {children}
    </AuthContext.Provider>
  );
};