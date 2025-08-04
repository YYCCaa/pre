// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { socketService } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef(socketService.getSocket());

  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = socketService.connect(token);
    }

    return () => {
      if (!token && socketRef.current) {
        socketService.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return socketRef.current;
};