import React, { createContext, useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    // Get token from localStorage directly (no dependency on AuthContext)
    const token = localStorage.getItem('token');

    if (!token) {
      // Don't connect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnectionError(error.message);
      setReconnectAttempts((prev) => prev + 1);
      
      if (reconnectAttempts >= 5) {
        toast.error('Connection lost. Trying to reconnect...', {
          duration: 5000,
          id: 'socket-error',
        });
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      setConnectionError(null);
      toast.success('Connection restored', { id: 'socket-error' });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setConnectionError('Failed to reconnect');
      toast.error('Unable to connect to server. Please refresh the page.', {
        duration: 0,
        id: 'socket-error',
      });
    });

    // Custom event handlers
    socket.on('notification', (data) => {
      toast(data.title || 'New notification', {
        icon: '🔔',
        description: data.message,
        duration: 5000,
      });
    });

    socket.on('case_update', (data) => {
      toast('Case Updated', {
        icon: '📋',
        description: `Case ${data.caseId} has been updated`,
      });
    });

    socket.on('new_message', (data) => {
      toast('New Message', {
        icon: '💬',
        description: data.preview || 'You have a new message',
      });
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect');
        socket.off('reconnect_attempt');
        socket.off('reconnect_error');
        socket.off('reconnect_failed');
        socket.off('notification');
        socket.off('case_update');
        socket.off('new_message');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token was set, connect socket
          if (socketRef.current) {
            socketRef.current.auth = { token: e.newValue };
            socketRef.current.connect();
          }
        } else {
          // Token was removed, disconnect socket
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Emit event helper
  const emit = useCallback((event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }, [connected]);

  // Subscribe to event helper
  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    }
    return () => {};
  }, []);

  // Unsubscribe from event helper
  const unsubscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Join a specific room
  const joinRoom = useCallback((room) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('join_room', room);
    }
  }, [connected]);

  // Leave a specific room
  const leaveRoom = useCallback((room) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('leave_room', room);
    }
  }, [connected]);

  // Join user room (called after login)
  const joinUserRoom = useCallback((userId) => {
    if (socketRef.current && connected && userId) {
      socketRef.current.emit('join', userId);
    }
  }, [connected]);

  // Manually reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  // Manually disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    socket: socketRef.current,
    connected,
    connectionError,
    reconnectAttempts,
    emit,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
    joinUserRoom,
    reconnect,
    disconnect,
  }), [
    connected,
    connectionError,
    reconnectAttempts,
    emit,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
    joinUserRoom,
    reconnect,
    disconnect,
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for using socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;