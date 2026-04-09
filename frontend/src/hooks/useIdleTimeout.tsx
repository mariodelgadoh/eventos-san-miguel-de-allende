import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const useIdleTimeout = (timeoutMinutes: number = 5, isActive: boolean = true) => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowWarning(false);
    
    // Advertencia 30 segundos antes de cerrar
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      showToast('Tu sesión expirará en 30 segundos por inactividad', 'info');
    }, (timeoutMinutes * 60 - 30) * 1000);
    
    timerRef.current = setTimeout(() => {
      logout();
      showToast('Tu sesión ha expirado por inactividad', 'info');
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!isActive) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isActive]);
};

export default useIdleTimeout;