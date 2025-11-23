import { api as db } from './api';
import type { Notification } from '../types/notification';

export interface NotificationData {
  userId: string;
  type: 'order_assigned' | 'order_completed' | 'order_approved' | 'order_rejected' | 'payment_received' | 'system_update' | 'assignment_confirmed' | 'assignment_declined';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Subscribe to notifications for a specific user
  public subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    
    const userListeners = this.listeners.get(userId)!;
    userListeners.add(callback);
    
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        userListeners.delete(callback);
        if (userListeners.size === 0) {
          this.listeners.delete(userId);
        }
      }
    };
  }

  // Send notification to a specific user
  public async sendNotification(notificationData: NotificationData): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: notificationData.actionUrl,
      actionLabel: notificationData.actionLabel,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: notificationData.priority,
      metadata: notificationData.metadata
    };

    // Save to database
    const savedNotification = await db.create('notifications', notification);
    
    // Notify listeners
    this.notifyUser(notificationData.userId, savedNotification);
    
    console.log('📢 Notification sent:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title
    });
    
    return savedNotification;
  }

  // Send notification to multiple users
  public async sendNotificationToUsers(userIds: string[], notificationData: Omit<NotificationData, 'userId'>): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendNotification({
        ...notificationData,
        userId
      })
    );
    
    await Promise.all(promises);
  }

  // Send system-wide notification
  public async sendSystemNotification(notificationData: Omit<NotificationData, 'userId'>): Promise<void> {
    // Get all users
    const users = await db.find('users');
    const userIds = users.map(user => user.id);
    
    await this.sendNotificationToUsers(userIds, notificationData);
  }

  // Notify specific user
  private notifyUser(userId: string, notification: Notification): void {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  // Mark notification as read
  public async markAsRead(notificationId: string): Promise<void> {
    await db.update('notifications', notificationId, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }

  // Get unread notifications for a user
  public async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const notifications = await db.find<Notification>('notifications');
    return notifications.filter(n => n.userId === userId && !n.isRead);
  }

  // Get all notifications for a user
  public async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await db.find<Notification>('notifications');
    return notifications.filter(n => n.userId === userId);
  }

  // Clear all notifications for a user
  public async clearUserNotifications(userId: string): Promise<void> {
    const notifications = await db.find<Notification>('notifications');
    const userNotifications = notifications.filter(n => n.userId === userId);
    
    for (const notification of userNotifications) {
      await db.delete('notifications', notification.id);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Predefined notification templates
export const notificationTemplates = {
  orderAssigned: (orderTitle: string, writerName: string) => ({
    title: 'New Order Assigned!',
    message: `You've been assigned: ${orderTitle}`,
    type: 'order_assigned' as const,
    priority: 'high' as const,
    actionUrl: `/orders?tab=assigned&highlight=${orderTitle}`,
    actionLabel: 'View Order'
  }),

  orderStarted: (orderTitle: string, writerName: string) => ({
    title: 'Work Started on Order',
    message: `${writerName} has started working on: ${orderTitle}`,
    type: 'system_update' as const,
    priority: 'medium' as const,
    actionUrl: `/admin/orders?tab=in-progress`,
    actionLabel: 'View Progress'
  }),

  orderSubmitted: (orderTitle: string, writerName: string) => ({
    title: 'Order Submitted for Review',
    message: `${writerName} has submitted: ${orderTitle}`,
    type: 'order_completed' as const,
    priority: 'high' as const,
    actionUrl: `/admin/orders?tab=submitted`,
    actionLabel: 'Review Order'
  }),

  orderApproved: (orderTitle: string, writerName: string, amount: number) => ({
    title: 'Order Approved!',
    message: `Your order "${orderTitle}" has been approved. Payment: KES ${amount.toLocaleString()}`,
    type: 'order_approved' as const,
    priority: 'high' as const,
    actionUrl: `/orders?tab=completed`,
    actionLabel: 'View Order'
  }),

  orderRejected: (orderTitle: string, writerName: string, reason: string) => ({
    title: 'Order Revision Required',
    message: `Your order "${orderTitle}" needs revision: ${reason}`,
    type: 'order_rejected' as const,
    priority: 'high' as const,
    actionUrl: `/orders?tab=revision`,
    actionLabel: 'View Feedback'
  }),

  orderReassigned: (orderTitle: string, reason: string) => ({
    title: 'Order Reassigned',
    message: `Order "${orderTitle}" has been reassigned: ${reason}`,
    type: 'system_update' as const,
    priority: 'medium' as const,
    actionUrl: `/orders?tab=available`,
    actionLabel: 'Browse Orders'
  }),

  paymentReceived: (amount: number, orderTitle: string) => ({
    title: 'Payment Received!',
    message: `KES ${amount.toLocaleString()} received for: ${orderTitle}`,
    type: 'payment_received' as const,
    priority: 'high' as const,
    actionUrl: `/wallet`,
    actionLabel: 'View Wallet'
  }),

  deadlineWarning: (orderTitle: string, hoursLeft: number) => ({
    title: 'Deadline Approaching!',
    message: `Order "${orderTitle}" is due in ${hoursLeft} hours`,
    type: 'system_update' as const,
    priority: hoursLeft <= 6 ? 'urgent' as const : 'high' as const,
    actionUrl: `/orders?tab=active`,
    actionLabel: 'View Order'
  }),

  newOrderAvailable: (orderTitle: string, discipline: string, pages: number) => ({
    title: 'New Order Available!',
    message: `"${orderTitle}" - ${discipline} (${pages} pages)`,
    type: 'system_update' as const,
    priority: 'medium' as const,
    actionUrl: `/orders?tab=available`,
    actionLabel: 'Bid on Order'
  })
};

// Helper functions for common notification scenarios
export const notificationHelpers = {
  // Notify admin when writer starts work
  async notifyAdminWorkStarted(orderId: string, orderTitle: string, writerName: string): Promise<void> {
    const admins = await db.find('users');
    const adminIds = admins.filter(user => user.role === 'admin').map(user => user.id);
    
    if (adminIds.length > 0) {
      await notificationService.sendNotificationToUsers(adminIds, {
        ...notificationTemplates.orderStarted(orderTitle, writerName),
        metadata: { orderId, writerName }
      });
    }
  },

  // Notify admin when order is submitted
  async notifyAdminOrderSubmitted(orderId: string, orderTitle: string, writerName: string): Promise<void> {
    const admins = await db.find('users');
    const adminIds = admins.filter(user => user.role === 'admin').map(user => user.id);
    
    if (adminIds.length > 0) {
      await notificationService.sendNotificationToUsers(adminIds, {
        ...notificationTemplates.orderSubmitted(orderTitle, writerName),
        metadata: { orderId, writerName }
      });
    }
  },

  // Notify admin when writer bids on an order
  async notifyAdminOrderBid(orderId: string, orderTitle: string, writerName: string): Promise<void> {
    const admins = await db.find('users');
    const adminIds = admins.filter(user => user.role === 'admin').map(user => user.id);
    
    if (adminIds.length > 0) {
      await notificationService.sendNotificationToUsers(adminIds, {
        title: 'New Bid Pending Approval',
        message: `${writerName} has bid on order: ${orderTitle}`,
        type: 'system_update',
        priority: 'medium',
        actionUrl: `/admin/orders/picked?highlight=${orderId}`,
        actionLabel: 'Review Bid',
        metadata: { orderId, writerName, status: 'Awaiting Approval' }
      });
    }
  },

  // Notify admin when revision is resubmitted
  async notifyAdminRevisionResubmitted(orderId: string, orderTitle: string, writerName: string, revisionNotes?: string): Promise<void> {
    const admins = await db.find('users');
    const adminIds = admins.filter(user => user.role === 'admin').map(user => user.id);
    
    if (adminIds.length > 0) {
      await notificationService.sendNotificationToUsers(adminIds, {
        title: 'Revision Resubmitted - Pending Review',
        message: `${writerName} has resubmitted revision for: ${orderTitle}. ${revisionNotes ? `Summary: ${revisionNotes.substring(0, 100)}...` : ''}`,
        type: 'system_update',
        priority: 'high',
        actionUrl: `/admin/orders?status=Submitted&highlight=${orderId}`,
        actionLabel: 'Review Revision',
        metadata: { orderId, writerName, status: 'Submitted', isRevisionResubmission: true, revisionNotes }
      });
    }
  },

  // Notify writer when order is approved
  async notifyWriterOrderApproved(writerId: string, orderTitle: string, amount: number): Promise<void> {
    await notificationService.sendNotification({
      userId: writerId,
      ...notificationTemplates.orderApproved(orderTitle, 'You', amount),
      metadata: { orderTitle, amount }
    });
  },

  // Notify writer when revision is requested
  async notifyWriterRevisionRequested(writerId: string, orderTitle: string, reason: string): Promise<void> {
    await notificationService.sendNotification({
      userId: writerId,
      ...notificationTemplates.orderRejected(orderTitle, 'You', reason),
      metadata: { orderTitle, reason }
    });
  },

  // Notify all writers when new order is available
  async notifyWritersNewOrder(orderTitle: string, discipline: string, pages: number): Promise<void> {
    const writers = await db.find('users');
    const writerIds = writers.filter(user => user.role === 'writer').map(user => user.id);
    
    if (writerIds.length > 0) {
      await notificationService.sendNotificationToUsers(writerIds, {
        ...notificationTemplates.newOrderAvailable(orderTitle, discipline, pages),
        metadata: { orderTitle, discipline, pages }
      });
    }
  },

  // Notify about deadline warnings
  async notifyDeadlineWarning(writerId: string, orderTitle: string, hoursLeft: number): Promise<void> {
    await notificationService.sendNotification({
      userId: writerId,
      ...notificationTemplates.deadlineWarning(orderTitle, hoursLeft),
      metadata: { orderTitle, hoursLeft }
    });
  }
};
