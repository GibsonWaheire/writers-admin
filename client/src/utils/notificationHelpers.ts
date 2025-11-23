/**
 * Enhanced Notification Helpers
 * Centralized notification creation and management
 */

import { notificationService as notificationServiceInstance } from '../services/notificationService';
import type { Notification } from '../types/notification';

export interface NotificationTemplate {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Notification templates for common events
 */
export const notificationTemplates = {
  orderAssigned: (orderTitle: string, writerName: string): NotificationTemplate => ({
    title: 'New Order Assigned! 🎉',
    message: `You've been assigned: "${orderTitle}"`,
    priority: 'high',
    actionUrl: '/orders/assigned',
    actionLabel: 'View Order'
  }),

  orderApproved: (orderTitle: string, amount: number): NotificationTemplate => ({
    title: 'Order Approved! ✅',
    message: `Your work on "${orderTitle}" has been approved. KES ${amount.toLocaleString()} added to wallet.`,
    priority: 'high',
    actionUrl: '/wallet',
    actionLabel: 'View Wallet'
  }),

  revisionRequested: (orderTitle: string, explanation: string): NotificationTemplate => ({
    title: 'Revision Required ⚠️',
    message: `"${orderTitle}" needs revision. ${explanation.substring(0, 100)}${explanation.length > 100 ? '...' : ''}`,
    priority: 'urgent',
    actionUrl: '/orders/revisions',
    actionLabel: 'View Revision'
  }),

  revisionResubmitted: (orderTitle: string, writerName: string): NotificationTemplate => ({
    title: 'Revision Resubmitted 📝',
    message: `${writerName} has resubmitted revision for "${orderTitle}"`,
    priority: 'high',
    actionUrl: '/admin/orders/review',
    actionLabel: 'Review Revision'
  }),

  orderRejected: (orderTitle: string, reason?: string): NotificationTemplate => ({
    title: 'Order Rejected ❌',
    message: `"${orderTitle}" was rejected. ${reason ? `Reason: ${reason}` : 'Please check details.'}`,
    priority: 'high',
    actionUrl: '/orders/rejected',
    actionLabel: 'View Details'
  }),

  newBidReceived: (orderTitle: string, writerName: string): NotificationTemplate => ({
    title: 'New Bid Received 💼',
    message: `${writerName} has bid on "${orderTitle}"`,
    priority: 'medium',
    actionUrl: '/admin/orders/picked',
    actionLabel: 'Review Bid'
  }),

  bidApproved: (orderTitle: string): NotificationTemplate => ({
    title: 'Bid Approved! ✅',
    message: `Your bid on "${orderTitle}" has been approved. Order is now assigned to you.`,
    priority: 'high',
    actionUrl: '/orders/assigned',
    actionLabel: 'View Order'
  }),

  bidDeclined: (orderTitle: string): NotificationTemplate => ({
    title: 'Bid Declined',
    message: `Your bid on "${orderTitle}" was declined. The order is available for other writers.`,
    priority: 'medium',
    actionUrl: '/orders/available',
    actionLabel: 'Browse Orders'
  }),

  orderCompleted: (orderTitle: string): NotificationTemplate => ({
    title: 'Order Completed! 🎊',
    message: `"${orderTitle}" has been marked as completed.`,
    priority: 'medium',
    actionUrl: '/orders/completed',
    actionLabel: 'View Order'
  }),

  newMessage: (orderTitle: string, senderName: string): NotificationTemplate => ({
    title: 'New Message 💬',
    message: `New message from ${senderName} regarding "${orderTitle}"`,
    priority: 'medium',
    actionUrl: '/messages',
    actionLabel: 'View Message'
  }),

  paymentReceived: (amount: number): NotificationTemplate => ({
    title: 'Payment Received! 💰',
    message: `KES ${amount.toLocaleString()} has been added to your wallet.`,
    priority: 'high',
    actionUrl: '/wallet',
    actionLabel: 'View Wallet'
  }),

  deadlineWarning: (orderTitle: string, hoursLeft: number): NotificationTemplate => ({
    title: 'Deadline Approaching ⏰',
    message: `"${orderTitle}" deadline in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`,
    priority: hoursLeft <= 6 ? 'urgent' : 'high',
    actionUrl: '/orders/assigned',
    actionLabel: 'View Order'
  }),

  orderReassigned: (orderTitle: string, reason?: string): NotificationTemplate => ({
    title: 'Order Reassigned 🔄',
    message: `"${orderTitle}" has been reassigned. ${reason ? `Reason: ${reason}` : ''}`,
    priority: 'medium',
    actionUrl: '/orders',
    actionLabel: 'View Orders'
  })
};

/**
 * Send notification with template
 */
export async function sendNotification(
  userId: string,
  template: NotificationTemplate,
  metadata?: Record<string, unknown>
): Promise<Notification> {
  return await notificationServiceInstance.sendNotification({
    userId,
    type: 'system_update',
    title: template.title,
    message: template.message,
    actionUrl: template.actionUrl,
    actionLabel: template.actionLabel,
    priority: template.priority,
    metadata
  });
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  template: NotificationTemplate,
  metadata?: Record<string, unknown>
): Promise<void> {
  await notificationServiceInstance.sendNotificationToUsers(userIds, {
    type: 'system_update',
    title: template.title,
    message: template.message,
    actionUrl: template.actionUrl,
    actionLabel: template.actionLabel,
    priority: template.priority,
    metadata
  });
}

/**
 * Send notification to all admins
 */
export async function notifyAdmins(
  template: NotificationTemplate,
  metadata?: Record<string, unknown>
): Promise<void> {
  // This will be implemented to fetch all admin users
  // For now, using a placeholder
  const adminIds = ['admin']; // TODO: Fetch from users context
  await sendNotificationToUsers(adminIds, template, metadata);
}

/**
 * Send notification to all writers
 */
export async function notifyWriters(
  template: NotificationTemplate,
  metadata?: Record<string, unknown>
): Promise<void> {
  // This will be implemented to fetch all writer users
  // For now, using a placeholder
  const writerIds: string[] = []; // TODO: Fetch from users context
  await sendNotificationToUsers(writerIds, template, metadata);
}
