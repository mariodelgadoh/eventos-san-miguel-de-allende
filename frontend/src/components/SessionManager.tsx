import React from 'react';
import useIdleTimeout from '../hooks/useIdleTimeout';
import { useAuth } from '../contexts/AuthContext';

const SessionManager: React.FC = () => {
  const { user } = useAuth();
  
  useIdleTimeout(5, !!user);
  
  return null;
};

export default SessionManager;