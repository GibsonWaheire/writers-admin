import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { 
  Notification, 
  NotificationPreferences, 
  AssignmentHistory, 
  AssignmentConfirmation,
  SmartAssignmentSuggestion 
} from '../types/notification';
import type { Order } from '../types/order';
import type { Writer } from '../types/user';
import { db } from '../services/database';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  assignmentHistory: AssignmentHistory[];
  
  // Notification functions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Preference functions
  updatePreferences: (userId: string, preferences: Partial<NotificationPreferences>) => Promise<void>;
  getPreferences: (userId: string) => Promise<NotificationPreferences>;
  
  // Assignment functions
  createAssignment: (orderId: string, writerId: string, assignedBy: string, options: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    notes?: string;
    requireConfirmation?: boolean;
  }) => Promise<AssignmentHistory>;
  
  confirmAssignment: (assignmentId: string, confirmation: Omit<AssignmentConfirmation, 'confirmedAt'>) => Promise<void>;
  declineAssignment: (assignmentId: string, reason: string) => Promise<void>;
  
  // Smart assignment functions
  getSmartAssignmentSuggestions: (order: Order, writers: Writer[]) => SmartAssignmentSuggestion[];
  
  // Notification sending functions
  sendOrderAssignmentNotification: (writerId: string, order: Order, assignment: AssignmentHistory) => Promise<void>;
  sendEmailNotification: (userId: string, type: string, data: any) => Promise<void>;
  sendWhatsAppNotification: (userId: string, message: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const notificationsData = await db.find<Notification>('notifications');
        const assignmentHistoryData = await db.find<AssignmentHistory>('assignmentHistory');
        
        setNotifications(notificationsData || []);
        setAssignmentHistory(assignmentHistoryData || []);
      } catch (error) {
        console.error('Failed to load notification data:', error);
      }
    };

    loadData();
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Add notification
  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    const savedNotification = await db.create('notifications', notification);
    setNotifications(prev => [savedNotification, ...prev]);
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const updatedNotification = {
      isRead: true,
      readAt: new Date().toISOString()
    };

    await db.update('notifications', notificationId, updatedNotification);
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, ...updatedNotification } : n
    ));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async (userId: string) => {
    const userNotifications = notifications.filter(n => n.userId === userId && !n.isRead);
    
    for (const notification of userNotifications) {
      await markAsRead(notification.id);
    }
  }, [notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    await db.delete('notifications', notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (userId: string, preferencesUpdate: Partial<NotificationPreferences>) => {
    const existingPrefs = await getPreferences(userId);
    const updatedPrefs = {
      ...existingPrefs,
      ...preferencesUpdate,
      userId,
      updatedAt: new Date().toISOString()
    };

    await db.update('notificationPreferences', userId, updatedPrefs);
    setPreferences(updatedPrefs);
  }, []);

  // Get preferences
  const getPreferences = useCallback(async (userId: string): Promise<NotificationPreferences> => {
    try {
      const prefs = await db.findById('notificationPreferences', userId);
      if (prefs) {
        return prefs as NotificationPreferences;
      }
    } catch (error) {
      console.log('No preferences found, creating defaults');
    }

    // Create default preferences
    const defaultPrefs: NotificationPreferences = {
      userId,
      emailNotifications: true,
      whatsappNotifications: true,
      inAppNotifications: true,
      orderAssignments: true,
      orderUpdates: true,
      paymentNotifications: true,
      systemUpdates: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      updatedAt: new Date().toISOString()
    };

    await db.create('notificationPreferences', defaultPrefs);
    return defaultPrefs;
  }, []);

  // Create assignment
  const createAssignment = useCallback(async (
    orderId: string, 
    writerId: string, 
    assignedBy: string, 
    options: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      deadline?: string;
      notes?: string;
      requireConfirmation?: boolean;
      writerName?: string; // Optional writer name
      assignedByName?: string; // Optional assigned by name
    }
  ): Promise<AssignmentHistory> => {
    // Try to get writer name and assigned by name
    let writerName = options.writerName || 'Writer';
    let assignedByName = options.assignedByName || (assignedBy === 'writer' ? 'Writer' : 'Admin');
    
    try {
      const writers = await db.find('writers');
      const writer = writers.find((w: any) => w.id === writerId);
      if (writer) writerName = writer.name || writerName;
      
      if (assignedBy !== 'writer') {
        const users = await db.find('users');
        const user = users.find((u: any) => u.id === assignedBy);
        if (user) assignedByName = user.name || assignedByName;
      }
    } catch (e) {
      // Use defaults if lookup fails
    }
    
    const assignment: AssignmentHistory = {
      id: `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      writerId,
      writerName,
      assignedBy,
      assignedByName,
      assignedAt: new Date().toISOString(),
      priority: options.priority || 'medium',
      deadline: options.deadline,
      notes: options.notes,
      autoConfirmDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: options.requireConfirmation ? 'pending' : 'auto_confirmed',
      notificationsSent: {}
    };

    const savedAssignment = await db.create('assignmentHistory', assignment);
    setAssignmentHistory(prev => [savedAssignment, ...prev]);
    
    return savedAssignment;
  }, []);

  // Confirm assignment
  const confirmAssignment = useCallback(async (assignmentId: string, confirmation: Omit<AssignmentConfirmation, 'confirmedAt'>) => {
    const updatedAssignment = {
      confirmedAt: new Date().toISOString(),
      status: 'confirmed' as const
    };

    await db.update('assignmentHistory', assignmentId, updatedAssignment);
    setAssignmentHistory(prev => prev.map(a => 
      a.id === assignmentId ? { ...a, ...updatedAssignment } : a
    ));

    // Store confirmation details
    const confirmationRecord = {
      ...confirmation,
      confirmedAt: new Date().toISOString()
    };
    await db.create('assignmentConfirmations', confirmationRecord);
  }, []);

  // Decline assignment
  const declineAssignment = useCallback(async (assignmentId: string, reason: string) => {
    const updatedAssignment = {
      declinedAt: new Date().toISOString(),
      declineReason: reason,
      status: 'declined' as const
    };

    await db.update('assignmentHistory', assignmentId, updatedAssignment);
    setAssignmentHistory(prev => prev.map(a => 
      a.id === assignmentId ? { ...a, ...updatedAssignment } : a
    ));
  }, []);

  // Smart assignment suggestions
  const getSmartAssignmentSuggestions = useCallback((order: Order, writers: Writer[]): SmartAssignmentSuggestion[] => {
    return writers
      .filter(w => w.status === 'active')
      .map(writer => {
        const matchScore = calculateMatchScore(writer, order);
        const reasons = getMatchReasons(writer, order);
        
        return {
          writerId: writer.id,
          writerName: writer.name,
          matchScore,
          reasons,
          availability: {
            currentOrders: 2, // This should be calculated from actual orders
            maxOrders: writer.maxConcurrentOrders,
            availableSlots: Math.max(0, writer.maxConcurrentOrders - 2)
          },
          performance: {
            rating: writer.rating,
            completedOrders: writer.completedOrders,
            successRate: writer.successRate,
            avgCompletionTime: 48 // This should be calculated from historical data
          },
          expertise: {
            specializations: writer.specializations,
            relevantExperience: writer.completedOrders,
            subjectMatch: writer.specializations.includes(order.discipline)
          },
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, []);

  // Calculate match score
  const calculateMatchScore = (writer: Writer, order: Order): number => {
    let score = 0;
    
    // Specialization match (40%)
    if (writer.specializations.includes(order.discipline)) score += 40;
    
    // Availability (20%)
    const currentOrders = 2; // This should be calculated from actual orders
    if (currentOrders < writer.maxConcurrentOrders) score += 20;
    
    // Performance history (20%)
    score += (writer.rating / 5) * 20;
    
    // Completion rate (10%)
    score += (writer.successRate / 100) * 10;
    
    // Experience level (10%)
    score += Math.min(writer.completedOrders / 10, 1) * 10;
    
    return Math.round(score);
  };

  // Get match reasons
  const getMatchReasons = (writer: Writer, order: Order): string[] => {
    const reasons: string[] = [];
    
    if (writer.specializations.includes(order.discipline)) {
      reasons.push(`Expert in ${order.discipline}`);
    }
    
    if (writer.rating >= 4.5) {
      reasons.push('High-rated writer (4.5+ stars)');
    }
    
    if (writer.successRate >= 95) {
      reasons.push('Excellent success rate (95%+)');
    }
    
    const currentOrders = 2; // This should be calculated
    if (currentOrders < writer.maxConcurrentOrders) {
      reasons.push('Available capacity');
    }
    
    if (writer.completedOrders >= 50) {
      reasons.push('Experienced writer (50+ orders)');
    }
    
    return reasons;
  };

  // Send order assignment notification
  const sendOrderAssignmentNotification = useCallback(async (writerId: string, order: Order, assignment: AssignmentHistory) => {
    const prefs = await getPreferences(writerId);
    
    if (prefs.inAppNotifications && prefs.orderAssignments) {
      await addNotification({
        userId: writerId,
        type: 'order_assigned',
        title: 'New Order Assigned!',
        message: `You've been assigned: ${order.title}`,
        actionUrl: `/orders?tab=assigned&highlight=${order.id}`,
        actionLabel: 'View Order',
        priority: assignment.priority,
        metadata: {
          orderId: order.id,
          assignmentId: assignment.id,
          assignedBy: assignment.assignedBy
        }
      });
    }
    
    if (prefs.emailNotifications && prefs.orderAssignments) {
      await sendEmailNotification(writerId, 'order_assigned', { order, assignment });
    }
    
    if (prefs.whatsappNotifications && prefs.orderAssignments) {
      const message = `🎯 New Order Assigned!\n\nTitle: ${order.title}\nPages: ${order.pages}\nDeadline: ${order.deadline}\nPriority: ${assignment.priority}\n\nClick here to view: ${process.env.REACT_APP_BASE_URL}/orders?tab=assigned`;
      await sendWhatsAppNotification(writerId, message);
    }
  }, [addNotification, getPreferences]);

  // Send email notification (mock implementation)
  const sendEmailNotification = useCallback(async (userId: string, type: string, data: any) => {
    console.log('📧 Sending email notification:', { userId, type, data });
    // In a real app, this would integrate with an email service like SendGrid, Mailgun, etc.
    return Promise.resolve();
  }, []);

  // Send WhatsApp notification (mock implementation)
  const sendWhatsAppNotification = useCallback(async (userId: string, message: string) => {
    console.log('📱 Sending WhatsApp notification:', { userId, message });
    // In a real app, this would integrate with WhatsApp Business API
    return Promise.resolve();
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      preferences,
      assignmentHistory,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      updatePreferences,
      getPreferences,
      createAssignment,
      confirmAssignment,
      declineAssignment,
      getSmartAssignmentSuggestions,
      sendOrderAssignmentNotification,
      sendEmailNotification,
      sendWhatsAppNotification
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