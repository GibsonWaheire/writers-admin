import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';
import { useWallet } from './WalletContext';
import { usePOD } from './PODContext';
import { useFinancial } from './FinancialContext';

export interface Notification {
  id: string;
  type: 'order' | 'financial' | 'system' | 'message' | 'review' | 'pod';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  targetRole?: 'writer' | 'admin' | 'both';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
  getUnreadNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { orders } = useOrders();
  const { wallet } = useWallet();
  const { podOrders } = usePOD();
  const { withdrawalRequests } = useFinancial();

  // Previous state for comparison to detect changes
  const [prevOrdersLength, setPrevOrdersLength] = useState(0);
  const [prevWalletBalance, setPrevWalletBalance] = useState(0);
  const [prevPodOrdersLength, setPrevPodOrdersLength] = useState(0);
  const [prevWithdrawalsLength, setPrevWithdrawalsLength] = useState(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // Filter by user role if targetRole is specified
    if (notification.targetRole && notification.targetRole !== user?.role && notification.targetRole !== 'both') {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep only last 100 notifications
  }, [user?.role]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(notif => notif.priority === priority);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.isRead);
  }, [notifications]);

  // Monitor order changes
  useEffect(() => {
    if (!user) return;

    const currentWriterId = user.id;
    const userOrders = user.role === 'admin' ? orders : orders.filter(order => order.writerId === currentWriterId);

    // Check for new orders
    if (userOrders.length > prevOrdersLength && prevOrdersLength > 0) {
      const newOrders = userOrders.slice(0, userOrders.length - prevOrdersLength);
      
      newOrders.forEach(order => {
        if (user.role === 'writer') {
          // Writer notifications
          if (order.status === 'Available') {
            addNotification({
              type: 'order',
              title: 'New Order Available',
              message: `"${order.title}" is available for pickup`,
              icon: '📝',
              priority: 'medium',
              actionUrl: '/orders',
              actionLabel: 'View Orders',
              targetRole: 'writer',
              metadata: { orderId: order.id }
            });
          } else if (order.status === 'Approved') {
            addNotification({
              type: 'order',
              title: 'Order Approved!',
              message: `Your work on "${order.title}" has been approved`,
              icon: '✅',
              priority: 'high',
              actionUrl: '/orders',
              actionLabel: 'View Order',
              targetRole: 'writer',
              metadata: { orderId: order.id }
            });
          } else if (order.status === 'Revision') {
            addNotification({
              type: 'order',
              title: 'Revision Requested',
              message: `"${order.title}" needs revisions`,
              icon: '🔄',
              priority: 'high',
              actionUrl: '/orders',
              actionLabel: 'View Details',
              targetRole: 'writer',
              metadata: { orderId: order.id }
            });
          } else if (order.status === 'Rejected') {
            addNotification({
              type: 'order',
              title: 'Order Rejected',
              message: `"${order.title}" was rejected`,
              icon: '❌',
              priority: 'high',
              actionUrl: '/orders',
              actionLabel: 'View Details',
              targetRole: 'writer',
              metadata: { orderId: order.id }
            });
          }
        } else if (user.role === 'admin') {
          // Admin notifications
          if (order.status === 'Submitted') {
            addNotification({
              type: 'order',
              title: 'Order Submitted for Review',
              message: `"${order.title}" is ready for admin review`,
              icon: '👀',
              priority: 'medium',
              actionUrl: '/admin/orders',
              actionLabel: 'Review Order',
              targetRole: 'admin',
              metadata: { orderId: order.id }
            });
          }
        }
      });
    }

    setPrevOrdersLength(userOrders.length);
  }, [orders, user, prevOrdersLength, addNotification]);

  // Monitor wallet changes (for writers)
  useEffect(() => {
    if (!user || user.role !== 'writer') return;

    if (wallet.availableBalance > prevWalletBalance && prevWalletBalance > 0) {
      const difference = wallet.availableBalance - prevWalletBalance;
      addNotification({
        type: 'financial',
        title: 'Payment Received!',
        message: `KES ${difference.toLocaleString()} has been added to your wallet`,
        icon: '💰',
        priority: 'high',
        actionUrl: '/wallet',
        actionLabel: 'View Wallet',
        targetRole: 'writer',
        metadata: { amount: difference }
      });
    }

    setPrevWalletBalance(wallet.availableBalance);
  }, [wallet.availableBalance, user, prevWalletBalance, addNotification]);

  // Monitor POD order changes
  useEffect(() => {
    if (!user) return;

    const currentWriterId = user.id;
    const userPodOrders = user.role === 'admin' ? podOrders : podOrders.filter(order => order.writerId === currentWriterId);

    if (userPodOrders.length > prevPodOrdersLength && prevPodOrdersLength > 0) {
      const newPodOrders = userPodOrders.slice(0, userPodOrders.length - prevPodOrdersLength);
      
      newPodOrders.forEach(order => {
        if (user.role === 'writer') {
          if (order.status === 'Available') {
            addNotification({
              type: 'pod',
              title: 'New POD Order Available',
              message: `POD order "${order.title}" is available`,
              icon: '💎',
              priority: 'medium',
              actionUrl: '/pod-orders',
              actionLabel: 'View POD Orders',
              targetRole: 'writer',
              metadata: { podOrderId: order.id }
            });
          } else if (order.status === 'Admin Approved') {
            addNotification({
              type: 'pod',
              title: 'POD Order Approved!',
              message: `Your POD work on "${order.title}" has been approved`,
              icon: '🎉',
              priority: 'high',
              actionUrl: '/pod-orders',
              actionLabel: 'View Order',
              targetRole: 'writer',
              metadata: { podOrderId: order.id }
            });
          }
        }
      });
    }

    setPrevPodOrdersLength(userPodOrders.length);
  }, [podOrders, user, prevPodOrdersLength, addNotification]);

  // Monitor withdrawal requests (for admin)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    if (withdrawalRequests.length > prevWithdrawalsLength && prevWithdrawalsLength > 0) {
      const newWithdrawals = withdrawalRequests.slice(0, withdrawalRequests.length - prevWithdrawalsLength);
      
      newWithdrawals.forEach(withdrawal => {
        if (withdrawal.status === 'pending') {
          addNotification({
            type: 'financial',
            title: 'New Withdrawal Request',
            message: `${withdrawal.writerName} requested KES ${withdrawal.amount.toLocaleString()}`,
            icon: '🏦',
            priority: 'medium',
            actionUrl: '/admin/financial',
            actionLabel: 'Review Request',
            targetRole: 'admin',
            metadata: { withdrawalId: withdrawal.id }
          });
        }
      });
    }

    setPrevWithdrawalsLength(withdrawalRequests.length);
  }, [withdrawalRequests, user, prevWithdrawalsLength, addNotification]);

  // Add some initial notifications for demo purposes
  useEffect(() => {
    if (notifications.length === 0 && user) {
      const demoNotifications = [];

      if (user.role === 'writer') {
        demoNotifications.push(
          {
            type: 'system' as const,
            title: 'Welcome to Writers Admin',
            message: 'Complete your profile to start receiving orders',
            icon: '👋',
            priority: 'medium' as const,
            actionUrl: '/profile',
            actionLabel: 'Edit Profile',
            targetRole: 'writer' as const
          },
          {
            type: 'order' as const,
            title: 'New Orders Available',
            message: '5 new orders are waiting for pickup',
            icon: '📝',
            priority: 'medium' as const,
            actionUrl: '/orders',
            actionLabel: 'View Orders',
            targetRole: 'writer' as const
          }
        );
      } else if (user.role === 'admin') {
        demoNotifications.push(
          {
            type: 'order' as const,
            title: 'Orders Pending Review',
            message: '3 orders are waiting for admin review',
            icon: '👀',
            priority: 'medium' as const,
            actionUrl: '/admin/orders',
            actionLabel: 'Review Orders',
            targetRole: 'admin' as const
          },
          {
            type: 'financial' as const,
            title: 'Withdrawal Requests',
            message: '2 writers have requested withdrawals',
            icon: '💳',
            priority: 'medium' as const,
            actionUrl: '/admin/financial',
            actionLabel: 'Review Requests',
            targetRole: 'admin' as const
          }
        );
      }

      demoNotifications.forEach(notif => addNotification(notif));
    }
  }, [user, notifications.length, addNotification]);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      getNotificationsByType,
      getNotificationsByPriority,
      getUnreadNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
