// src/contexts/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { WEBSOCKET_CONFIG } from '@/lib/constants';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const connectSocket = () => {
    if (socket?.connected) return;

    setConnecting(true);
    setError(null);

    try {
      const newSocket = socketService.connect(token);
      setSocket(newSocket);

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);
      newSocket.on('reconnect', handleReconnect);
      newSocket.on('reconnect_error', handleReconnectError);

      // Application-specific events
      newSocket.on('new-event', handleNewEvent);
      newSocket.on('device-status', handleDeviceStatus);
      newSocket.on('analytics-update', handleAnalyticsUpdate);
      newSocket.on('system-notification', handleSystemNotification);

    } catch (err: any) {
      setError(err.message);
      setConnecting(false);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.removeAllListeners();
      socketService.disconnect();
      setSocket(null);
      setConnected(false);
      setConnecting(false);
    }
  };

  const handleConnect = () => {
    setConnected(true);
    setConnecting(false);
    setError(null);
    setReconnectAttempts(0);
    console.log('✅ WebSocket connected');
  };

  const handleDisconnect = (reason: string) => {
    setConnected(false);
    setConnecting(false);
    console.log('❌ WebSocket disconnected:', reason);
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try to reconnect
      setTimeout(connectSocket, WEBSOCKET_CONFIG.reconnectDelay);
    }
  };

  const handleConnectError = (error: any) => {
    setError(error.message || 'Connection failed');
    setConnecting(false);
    console.error('❌ WebSocket connection error:', error);
  };

  const handleReconnect = (attemptNumber: number) => {
    setReconnectAttempts(attemptNumber);
    console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
  };

  const handleReconnectError = (error: any) => {
    setError(error.message || 'Reconnection failed');
    console.error('❌ WebSocket reconnection error:', error);
  };

  // Application-specific event handlers
  const handleNewEvent = (event: any) => {
    console.log('📡 New event received:', event);
    // Event will be handled by individual components that listen to this context
  };

  const handleDeviceStatus = (data: { deviceId: string; status: string }) => {
    console.log('📱 Device status update:', data);
    toast.success(`Device ${data.deviceId} is now ${data.status}`);
  };

  const handleAnalyticsUpdate = (data: any) => {
    console.log('📊 Analytics update:', data);
  };

  const handleSystemNotification = (notification: { type: string; message: string }) => {
    console.log('🔔 System notification:', notification);
    
    switch (notification.type) {
      case 'info':
        toast(notification.message);
        break;
      case 'success':
        toast.success(notification.message);
        break;
      case 'warning':
        toast(notification.message, { icon: '⚠️' });
        break;
      case 'error':
        toast.error(notification.message);
        break;
      default:
        toast(notification.message);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    connecting,
    error,
    reconnectAttempts,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};













