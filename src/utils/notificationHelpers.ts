import type { Notification } from '../contexts/NotificationContext';

// Helper function to create notifications for testing
export const createTestNotifications = (userRole: 'writer' | 'admin'): Omit<Notification, 'id' | 'timestamp' | 'isRead'>[] => {
  const writerNotifications = [
    {
      type: 'order' as const,
      title: 'New Order Available',
      message: 'A new research paper order is available for pickup',
      icon: '📝',
      priority: 'medium' as const,
      actionUrl: '/orders',
      actionLabel: 'View Orders',
      targetRole: 'writer' as const
    },
    {
      type: 'order' as const,
      title: 'Order Approved!',
      message: 'Your work on "Climate Change Research" has been approved',
      icon: '✅',
      priority: 'high' as const,
      actionUrl: '/orders',
      actionLabel: 'View Order',
      targetRole: 'writer' as const
    },
    {
      type: 'financial' as const,
      title: 'Payment Received',
      message: 'KES 45,000 has been added to your wallet',
      icon: '💰',
      priority: 'high' as const,
      actionUrl: '/wallet',
      actionLabel: 'View Wallet',
      targetRole: 'writer' as const
    },
    {
      type: 'order' as const,
      title: 'Revision Required',
      message: 'Your submission needs minor revisions',
      icon: '🔄',
      priority: 'high' as const,
      actionUrl: '/orders',
      actionLabel: 'View Details',
      targetRole: 'writer' as const
    },
    {
      type: 'pod' as const,
      title: 'New POD Order',
      message: 'A 24-hour POD order is available',
      icon: '💎',
      priority: 'urgent' as const,
      actionUrl: '/pod-orders',
      actionLabel: 'View POD Orders',
      targetRole: 'writer' as const
    },
    {
      type: 'system' as const,
      title: 'Profile Update Required',
      message: 'Please update your profile information',
      icon: '👤',
      priority: 'low' as const,
      actionUrl: '/profile',
      actionLabel: 'Edit Profile',
      targetRole: 'writer' as const
    },
    {
      type: 'review' as const,
      title: 'New Review Received',
      message: 'You received a 5-star review from a client',
      icon: '⭐',
      priority: 'medium' as const,
      actionUrl: '/reviews',
      actionLabel: 'View Reviews',
      targetRole: 'writer' as const
    }
  ];

  const adminNotifications = [
    {
      type: 'order' as const,
      title: 'Orders Awaiting Review',
      message: '5 orders are pending admin review',
      icon: '👀',
      priority: 'medium' as const,
      actionUrl: '/admin/orders',
      actionLabel: 'Review Orders',
      targetRole: 'admin' as const
    },
    {
      type: 'financial' as const,
      title: 'Withdrawal Requests',
      message: '3 writers have requested withdrawals',
      icon: '💳',
      priority: 'high' as const,
      actionUrl: '/admin/financial',
      actionLabel: 'Review Requests',
      targetRole: 'admin' as const
    },
    {
      type: 'financial' as const,
      title: 'Low Platform Balance',
      message: 'Platform balance is below minimum threshold',
      icon: '⚠️',
      priority: 'urgent' as const,
      actionUrl: '/admin/financial',
      actionLabel: 'Add Funds',
      targetRole: 'admin' as const
    },
    {
      type: 'system' as const,
      title: 'New Writer Registration',
      message: 'A new writer has registered and needs approval',
      icon: '👥',
      priority: 'medium' as const,
      actionUrl: '/admin/users',
      actionLabel: 'Review Application',
      targetRole: 'admin' as const
    },
    {
      type: 'order' as const,
      title: 'Overdue Orders Alert',
      message: '2 orders are past their deadlines',
      icon: '🚨',
      priority: 'urgent' as const,
      actionUrl: '/admin/orders',
      actionLabel: 'View Overdue',
      targetRole: 'admin' as const
    },
    {
      type: 'financial' as const,
      title: 'Payment Processed',
      message: 'KES 125,000 in payments have been processed',
      icon: '✅',
      priority: 'low' as const,
      actionUrl: '/admin/financial',
      actionLabel: 'View Report',
      targetRole: 'admin' as const
    },
    {
      type: 'system' as const,
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 11 PM',
      icon: '🔧',
      priority: 'medium' as const,
      targetRole: 'admin' as const
    }
  ];

  return userRole === 'writer' ? writerNotifications : adminNotifications;
};

// Helper to trigger specific notification types
export const triggerNotificationByType = (
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void,
  type: 'order_approved' | 'order_rejected' | 'new_order' | 'payment_received' | 'withdrawal_request' | 'low_balance',
  userRole: 'writer' | 'admin',
  data?: Record<string, unknown>
) => {
  switch (type) {
    case 'order_approved':
      if (userRole === 'writer') {
        addNotification({
          type: 'order',
          title: 'Order Approved! 🎉',
          message: `Your work on "${data?.orderTitle || 'Recent Order'}" has been approved`,
          icon: '✅',
          priority: 'high',
          actionUrl: '/orders',
          actionLabel: 'View Order',
          targetRole: 'writer'
        });
      }
      break;
    
    case 'order_rejected':
      if (userRole === 'writer') {
        addNotification({
          type: 'order',
          title: 'Order Needs Revision',
          message: `"${data?.orderTitle || 'Recent Order'}" requires revisions`,
          icon: '🔄',
          priority: 'high',
          actionUrl: '/orders',
          actionLabel: 'View Details',
          targetRole: 'writer'
        });
      }
      break;
    
    case 'new_order':
      if (userRole === 'writer') {
        addNotification({
          type: 'order',
          title: 'New Order Available!',
          message: `A new ${data?.subject || 'academic'} order is ready for pickup`,
          icon: '📝',
          priority: 'medium',
          actionUrl: '/orders',
          actionLabel: 'View Orders',
          targetRole: 'writer'
        });
      }
      break;
    
    case 'payment_received':
      if (userRole === 'writer') {
        addNotification({
          type: 'financial',
          title: 'Payment Received! 💰',
          message: `KES ${data?.amount || '45,000'} has been added to your wallet`,
          icon: '💰',
          priority: 'high',
          actionUrl: '/wallet',
          actionLabel: 'View Wallet',
          targetRole: 'writer'
        });
      }
      break;
    
    case 'withdrawal_request':
      if (userRole === 'admin') {
        addNotification({
          type: 'financial',
          title: 'New Withdrawal Request',
          message: `${data?.writerName || 'A writer'} requested KES ${data?.amount || '50,000'}`,
          icon: '💳',
          priority: 'medium',
          actionUrl: '/admin/financial',
          actionLabel: 'Review Request',
          targetRole: 'admin'
        });
      }
      break;
    
    case 'low_balance':
      if (userRole === 'admin') {
        addNotification({
          type: 'financial',
          title: 'Low Platform Balance ⚠️',
          message: 'Platform balance is below the minimum threshold',
          icon: '⚠️',
          priority: 'urgent',
          actionUrl: '/admin/financial',
          actionLabel: 'Add Funds',
          targetRole: 'admin'
        });
      }
      break;
  }
};
