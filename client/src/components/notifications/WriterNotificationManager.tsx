import { useState, useEffect, useMemo, useRef } from 'react';
import { WriterAlertBanner } from './WriterAlertBanner';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { useToast } from '../../contexts/ToastContext';
import type { Notification } from '../../types/notification';
import { getWriterIdForUser } from '../../utils/writer';

/**
 * Manager component that displays urgent alerts and handles real-time notifications
 * Should be placed at the top of writer pages
 */
export function WriterNotificationManager() {
  const { user } = useAuth();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const { orders } = useOrders();
  const { showToast } = useToast();
  
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const lastProcessedNotificationsRef = useRef<Set<string>>(new Set());

  // Get writer's notifications
  const writerNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => 
      (n.userId === user.id || n.userId === user.id.toString()) && 
      !dismissedAlerts.has(n.id)
    );
  }, [notifications, user, dismissedAlerts]);

  // Get urgent/high priority notifications for banners
  const urgentNotifications = useMemo(() => {
    return writerNotifications
      .filter(n => (n.priority === 'urgent' || n.priority === 'high') && !n.isRead)
      .slice(0, 3); // Show max 3 banners
  }, [writerNotifications]);

  // Track new notifications and show toasts
  useEffect(() => {
    if (!user) return;

    const currentNotificationIds = new Set(writerNotifications.map(n => n.id));
    const newNotifications = writerNotifications.filter(
      n => !lastProcessedNotificationsRef.current.has(n.id)
    );

    newNotifications.forEach(notification => {
      // Show toast for important notifications
      if (notification.priority === 'urgent' || notification.priority === 'high') {
        const toastType = 
          notification.type === 'order_rejected' ? 'error' :
          notification.type === 'revision' ? 'warning' :
          'info';

        showToast({
          type: toastType,
          title: notification.title,
          message: notification.message,
          duration: notification.priority === 'urgent' ? 10000 : 5000
        });
      }
    });

    lastProcessedNotificationsRef.current = currentNotificationIds;
  }, [writerNotifications, user, showToast]);

  // Track order status changes for real-time alerts
  useEffect(() => {
    if (!user) return;
    
    const currentWriterId = getWriterIdForUser(user.id);
    const writerOrders = orders.filter(o => o.writerId === currentWriterId);

    // Check for new revision requests
    writerOrders.forEach(order => {
      if (order.status === 'Revision' && order.revisionExplanation) {
        const hasNotification = writerNotifications.some(n => 
          n.metadata?.orderId === order.id && n.type === 'revision'
        );
        
        if (!hasNotification) {
          showToast({
            type: 'warning',
            title: 'Revision Required ⚠️',
            message: `"${order.title}" needs revision. Please check details.`,
            duration: 8000
          });
        }
      }
    });
  }, [orders, user, writerNotifications, showToast]);

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  const handleNotificationAction = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Navigation will be handled by the banner's action button
  };

  if (urgentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 pt-4 space-y-3 max-w-7xl mx-auto pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {urgentNotifications.map(notification => (
          <WriterAlertBanner
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
            onAction={handleNotificationAction}
          />
        ))}
      </div>
    </div>
  );
}


