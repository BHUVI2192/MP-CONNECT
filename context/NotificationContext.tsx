
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';

interface DbNotification {
  notif_id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  dbNotifications: DbNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markDbAsRead: (notifId: string) => void;
  clearAll: () => void;
  updateInternalNote: (id: string, note: string) => void;
  lastUpdatedEventId: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dbNotifications, setDbNotifications] = useState<DbNotification[]>([]);
  const [lastUpdatedEventId, setLastUpdatedEventId] = useState<string | null>(null);

  const localUnread = notifications.filter(n => !n.isRead).length;
  const dbUnread = dbNotifications.filter(n => !n.is_read).length;
  const unreadCount = localUnread + dbUnread;

  // Fetch DB notifications on mount and subscribe to new ones
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from('notifications')
        .select('notif_id, type, title, body, is_read, created_at, metadata')
        .eq('recipient_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setDbNotifications(data as DbNotification[]);

      // Realtime subscription for new notifications
      const channel = supabase
        .channel('notif-ctx')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userData.user.id}`,
        }, (payload) => {
          setDbNotifications(prev => [payload.new as DbNotification, ...prev]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    fetchAndSubscribe();
  }, []);

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

  const markDbAsRead = async (notifId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notif_id', notifId);
    setDbNotifications(prev =>
      prev.map(n => n.notif_id === notifId ? { ...n, is_read: true } : n)
    );
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
      dbNotifications,
      unreadCount, 
      addNotification, 
      markAsRead,
      markDbAsRead,
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
