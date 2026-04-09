import React from 'react';
import useIdleTimeout from '../hooks/useIdleTimeout';
import { useAuth } from '../contexts/AuthContext';

const SessionManager: React.FC = () => {
  const { user } = useAuth();
  
  // 5 minutos de inactividad (cambia a 1 para pruebas)
  useIdleTimeout(5, !!user);
  
  return null;
};

export default SessionManager;