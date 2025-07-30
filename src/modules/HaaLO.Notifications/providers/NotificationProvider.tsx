import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationService } from '../services/NotificationService';
import type { NotificationEvent, NotificationMessage } from '../types';

interface NotificationContextType {
  notifications: NotificationMessage[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Subscribe to new notifications
    const handleNewNotification = (event: NotificationEvent) => {
      if (event.type === 'notification_delivered' && event.payload.message) {
        const message = event.payload.message as NotificationMessage;
        if (message.channels.includes('in_app')) {
          setNotifications(prev => [message, ...prev.slice(0, 49)]); // Keep last 50
        }
      }
    };

    notificationService.subscribe('notification_delivered', handleNewNotification);

    // Load existing notifications on mount
    loadNotifications();

    return () => {
      notificationService.unsubscribe('notification_delivered', handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    // Mock implementation - in real app would load from database
    const mockNotifications: NotificationMessage[] = [
      {
        id: '1',
        type: 'success',
        title: 'Payroll Processed',
        body: 'Your payroll for October 2024 has been processed successfully.',
        channels: ['in_app'],
        recipients: [],
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'delivered',
        retryCount: 0,
        sourceModule: 'HaaLO.PayrollEngine',
      },
      {
        id: '2',
        type: 'info',
        title: 'Benefits Enrollment',
        body: 'Don\'t forget to complete your benefits enrollment by the deadline.',
        channels: ['in_app'],
        recipients: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'delivered',
        retryCount: 0,
        sourceModule: 'HaaLO.Benefits',
      },
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, metadata: { ...notification.metadata, read: true } }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.metadata?.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};