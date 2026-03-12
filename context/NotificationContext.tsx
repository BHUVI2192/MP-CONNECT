
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  updateInternalNote: (id: string, note: string) => void;
  lastUpdatedEventId: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastUpdatedEventId, setLastUpdatedEventId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setLastUpdatedEventId(notification.eventId);
    
    // Reset flash effect after 3 seconds
    setTimeout(() => {
      setLastUpdatedEventId(null);
    }, 3000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updateInternalNote = (id: string, note: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, internalNotes: note } : n));
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      clearAll, 
      updateInternalNote,
      lastUpdatedEventId
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
