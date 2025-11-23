/**
 * Enhanced Toast Notification Hook
 * Integrates with notification system to show toast notifications
 */

import { useEffect } from 'react';
import { useToast } from './use-toast';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export function useToastNotifications() {
  const { toasts, addToast } = useToast();
  const { notifications, markAsRead } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Get unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead);

    // Show toast for each unread notification
    unreadNotifications.forEach(notification => {
      // Only show toast for high/urgent priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        addToast({
          title: notification.title,
          description: notification.message,
          variant: notification.priority === 'urgent' ? 'destructive' : 'default',
          action: notification.actionUrl ? {
            label: notification.actionLabel || 'View',
            onClick: () => {
              window.location.href = notification.actionUrl!;
              markAsRead(notification.id);
            }
          } : undefined
        });

        // Mark as read after showing toast
        setTimeout(() => {
          markAsRead(notification.id);
        }, 5000);
      }
    });
  }, [notifications, user, addToast, markAsRead]);

  return { toasts };
}

