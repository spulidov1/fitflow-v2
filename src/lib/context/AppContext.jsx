// ============================================================================
// APP CONTEXT - Global State & Command System
// ============================================================================
// Manages: Command palette, Undo queue, Notifications, Voice state
// Design: Linear/Facebook 2024 standards

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppContextProvider');
  return context;
};

export const AppContextProvider = ({ children }) => {
  // Command Palette State
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  
  // Undo Toast Queue
  const [undoQueue, setUndoQueue] = useState([]);
  const undoTimers = useRef({});
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Voice Input State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  // Navigation callback ref
  const navigationCallback = useRef(null);

  // ============================================================================
  // COMMAND PALETTE
  // ============================================================================

  const openCommand = useCallback(() => {
    setIsCommandOpen(true);
    setCommandQuery('');
  }, []);

  const closeCommand = useCallback(() => {
    setIsCommandOpen(false);
    setCommandQuery('');
  }, []);

  // Global keyboard listener for Command+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommand();
      }
      // Escape to close
      if (e.key === 'Escape' && isCommandOpen) {
        closeCommand();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, openCommand, closeCommand]);

  const executeCommand = useCallback((command) => {
    console.log('Executing command:', command);
    closeCommand();
    
    // Handle navigation commands
    if (command.type === 'navigate' && navigationCallback.current) {
      navigationCallback.current(command.view);
    }
    
    // Handle quick actions (log weight, mood, etc)
    if (command.type === 'action' && command.action) {
      command.action();
    }
  }, [closeCommand]);

  // ============================================================================
  // UNDO SYSTEM
  // ============================================================================

  const addUndo = useCallback((item) => {
    const id = Date.now() + Math.random();
    const undoItem = {
      id,
      message: item.message,
      onUndo: item.onUndo,
      duration: item.duration || 5000,
      createdAt: Date.now()
    };

    setUndoQueue(prev => [...prev, undoItem]);

    // Auto-remove after duration
    undoTimers.current[id] = setTimeout(() => {
      setUndoQueue(prev => prev.filter(u => u.id !== id));
      delete undoTimers.current[id];
    }, undoItem.duration);

    return id;
  }, []);

  const executeUndo = useCallback((id) => {
    const item = undoQueue.find(u => u.id === id);
    if (item && item.onUndo) {
      item.onUndo();
    }
    
    // Clear timer and remove from queue
    if (undoTimers.current[id]) {
      clearTimeout(undoTimers.current[id]);
      delete undoTimers.current[id];
    }
    
    setUndoQueue(prev => prev.filter(u => u.id !== id));
  }, [undoQueue]);

  const dismissUndo = useCallback((id) => {
    if (undoTimers.current[id]) {
      clearTimeout(undoTimers.current[id]);
      delete undoTimers.current[id];
    }
    setUndoQueue(prev => prev.filter(u => u.id !== id));
  }, []);

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info', // info, success, warning
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // ============================================================================
  // VOICE INPUT
  // ============================================================================

  const startVoiceInput = useCallback(() => {
    setIsVoiceActive(true);
    setVoiceTranscript('');
  }, []);

  const stopVoiceInput = useCallback(() => {
    setIsVoiceActive(false);
  }, []);

  const updateVoiceTranscript = useCallback((transcript) => {
    setVoiceTranscript(transcript);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // Command Palette
    isCommandOpen,
    commandQuery,
    setCommandQuery,
    openCommand,
    closeCommand,
    executeCommand,
    navigationCallback,

    // Undo System
    undoQueue,
    addUndo,
    executeUndo,
    dismissUndo,

    // Notifications
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,

    // Voice Input
    isVoiceActive,
    voiceTranscript,
    startVoiceInput,
    stopVoiceInput,
    updateVoiceTranscript
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
