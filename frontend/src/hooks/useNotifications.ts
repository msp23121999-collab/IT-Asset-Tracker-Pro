import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import type { AppNotification } from '@/services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = notificationService.subscribeToNotifications(user.email, user.uid, (data) => {
      setNotifications(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const sendNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    return await notificationService.sendNotification(notification);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    sendNotification,
  };
};
