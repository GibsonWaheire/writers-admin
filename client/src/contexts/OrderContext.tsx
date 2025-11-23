import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion, UploadedFile } from '../types/order';
import { db } from '../services/database';
import { api } from '../services/api';
import { notificationHelpers } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { useNotifications } from './NotificationContext';
import { normalizeWriterId } from '../utils/writer';

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  handleOrderAction: (action: string, orderId: string, additionalData?: Record<string, unknown>) => Promise<void>;
  confirmOrder: (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => void;
  pickOrder: (orderId: string, writerId: string, writerName: string) => void;
  refreshOrders: () => Promise<void>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getAvailableOrders: () => Order[];
  getWriterActiveOrders: (writerId: string) => Order[];
  getWriterOrderStats: (writerId: string) => {
    total: number;
    pending: number;
    available: number;
    inProgress: number;
    submitted: number;
    approved: number;
    revision: number;
    completed: number;
    rejected: number;
    cancelled: number;
    onHold: number;
    disputed: number;
    refunded: number;
  };
  getWriterOrdersByCategory: (writerId: string) => {
    pending: Order[];
    available: Order[];
    inProgress: Order[];
    submitted: Order[];
    approved: Order[];
    revision: Order[];
    completed: Order[];
    rejected: Order[];
    cancelled: Order[];
    onHold: Order[];
    disputed: Order[];
    refunded: Order[];
  };
  calculateOrderEarnings: (order: Order) => {
    baseAmount: number;
    cppAmount: number;
    totalAmount: number;
    currency: string;
    calculatedAt: string;
  };
  getWriterTotalEarnings: (writerId: string) => number;
  // New real-time features
  isConnected: boolean;
  lastUpdate: string;
  availableOrdersCount: number;
  // Database management
  forceResetDatabase: () => Promise<void>;
  // Admin order management
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addAdminMessage: (orderId: string, message: string, attachments: UploadedFile[], isNotification: boolean) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const normalizeOrderData = (order: Order): Order => ({
  ...order,
  writerId: normalizeWriterId(order.writerId) || order.writerId,
});

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Try to get wallet context, but don't fail if it's not available
  let addEarning: ((orderId: string, amount: number, description: string, orderType: 'regular' | 'pod') => void) | null = null;
  try {
    const walletContext = useWallet();
    addEarning = walletContext?.addEarning || null;
  } catch (e) {
    // WalletProvider not available yet, will use null
  }
  
  // Try to get notification context for assignment history
  let notificationContext: ReturnType<typeof useNotifications> | null = null;
  try {
    notificationContext = useNotifications();
  } catch (e) {
    // NotificationContext not available yet
  }
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  // Load orders from database on mount and subscribe to real-time updates
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await db.find<Order>('orders');
        const normalized = ordersData.map(normalizeOrderData);
        setOrders(normalized);
        setLastUpdate(new Date().toISOString());
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setIsConnected(false);
      }
    };

    // Initial load
    loadOrders();

    // Subscribe to real-time updates
    const unsubscribe = db.subscribeToCollection('orders', async () => {
      try {
        console.log('🔄 OrderContext: Real-time update received, refreshing orders...');
        const ordersData = await db.find<Order>('orders');
        const normalized = ordersData.map(normalizeOrderData);
        setOrders(normalized);
        setLastUpdate(new Date().toISOString());
        setIsConnected(true);
        
        // Log new available orders
        const availableOrders = ordersData.filter(o => o.status === 'Available');
        if (availableOrders.length > 0) {
          console.log('📋 OrderContext: Available orders updated:', {
            count: availableOrders.length,
            orders: availableOrders.map(o => ({ id: o.id, title: o.title, discipline: o.discipline }))
          });
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
        setIsConnected(false);
      }
    });

    return unsubscribe;
  }, []);

  // Function to refresh orders from database
  const refreshOrders = useCallback(async () => {
    try {
      console.log('🔄 OrderContext: Starting manual refresh...');
      const ordersData = await db.find<Order>('orders');
      const normalized = ordersData.map(normalizeOrderData);
      setOrders(normalized);
      setLastUpdate(new Date().toISOString());
      setIsConnected(true);
      console.log('✅ OrderContext: Orders refreshed from database');
    } catch (error) {
      console.error('❌ OrderContext: Failed to refresh orders:', error);
      setIsConnected(false);
    }
  }, []);

  // All mock data removed - orders are loaded from database only

  // Helper function to log order activity
  const logOrderActivity = useCallback(async (
    orderId: string,
    orderNumber: string | undefined,
    actionType: string,
    oldStatus: string,
    newStatus: string,
    description: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;
    
    try {
      await api.createOrderActivity({
        orderId,
        orderNumber,
        actionType,
        actionBy: user.id,
        actionByName: user.name,
        actionByRole: user.role as 'writer' | 'admin',
        oldStatus,
        newStatus,
        description,
        metadata
      });
    } catch (error) {
      console.error('Failed to log order activity:', error);
    }
  }, [user]);

  // Helper function to send notifications (will be called after order updates)
  const sendOrderNotification = useCallback(async (writerId: string | undefined, type: string, order: Order, data?: Record<string, unknown>) => {
    if (!writerId) return;
    
    try {
      const { notificationService } = await import('../services/notificationService');
      const orderTitle = order.title || 'Order';
      
      switch (type) {
        case 'assigned':
          await notificationService.sendNotification({
            userId: writerId,
            type: 'order_assigned',
            title: 'New Order Assigned!',
            message: `You've been assigned: ${orderTitle}`,
            actionUrl: `/orders/assigned`,
            actionLabel: 'View Order',
            priority: 'high',
            metadata: { orderId: order.id }
          });
          break;
        case 'approved':
          await notificationService.sendNotification({
            userId: writerId,
            type: 'order_approved',
            title: 'Order Approved! 🎉',
            message: `Your work on "${orderTitle}" has been approved`,
            actionUrl: `/orders/completed`,
            actionLabel: 'View Order',
            priority: 'high',
            metadata: { orderId: order.id }
          });
          break;
        case 'revision':
          await notificationService.sendNotification({
            userId: writerId,
            type: 'order_rejected',
            title: 'Revision Required',
            message: `"${orderTitle}" needs revision. ${data?.explanation ? `Reason: ${data.explanation.substring(0, 100)}...` : 'Please check the details.'}`,
            actionUrl: `/orders/assigned`,
            actionLabel: 'View Details',
            priority: 'high',
            metadata: { orderId: order.id, explanation: data?.explanation }
          });
          break;
        case 'reassigned':
          await notificationService.sendNotification({
            userId: writerId,
            type: 'order_rejected',
            title: 'Order Reassigned',
            message: `"${orderTitle}" has been reassigned. ${data?.reason ? `Reason: ${data.reason}` : ''}`,
            actionUrl: `/orders`,
            actionLabel: 'View Orders',
            priority: 'medium',
            metadata: { orderId: order.id, reason: data?.reason }
          });
          break;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, []);

  const handleOrderAction = useCallback(async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    console.log('🔄 OrderContext: Processing action:', {
      action,
      orderId,
      additionalData,
      timestamp: new Date().toISOString()
    });

    // Get the current order before updating
    const currentOrder = orders.find(o => o.id === orderId);
    let notificationType: string | null = null;
    let notificationData: Record<string, unknown> | undefined = undefined;
    let updatedOrderForNotification: Order | null = null;

    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id !== orderId) return order;

        const oldStatus = order.status;
        let newStatus = order.status;
        const updatedAt = new Date().toISOString();
        const updates: Record<string, unknown> = { updatedAt };
        
        switch (action) {
        case 'bid':
          // Writer places a bid; admin must approve before assignment.
          newStatus = 'Awaiting Approval';
          updates.writerId = additionalData?.writerId || 'unknown';
          updates.assignedWriter = additionalData?.writerName || 'Unknown Writer';
          updates.assignedAt = new Date().toISOString();
          updates.pickedBy = 'writer';
          updates.assignedBy = 'writer'; // Track that writer picked it themselves
          updates.assignmentPriority = additionalData?.priority || 'medium'; // Default priority for bids
          updates.assignmentNotes = additionalData?.notes;
          updates.requiresConfirmation = true; // Waiting for admin approval
          
          // Log activity
          logOrderActivity(
            orderId,
            order.orderNumber,
            'bid',
            oldStatus,
            'Awaiting Approval',
            `Order ${order.orderNumber || orderId} bid by writer ${updates.assignedWriter}`,
            { writerId: updates.writerId, writerName: updates.assignedWriter, pickedBy: 'writer' }
          ).catch(err => console.error('Failed to log activity:', err));
          
          // Create assignment history entry for picked orders
          // This ensures it appears in "recently picked" section
          if (notificationContext?.createAssignment) {
            notificationContext.createAssignment(
              orderId,
              updates.writerId as string,
              'writer', // assignedBy
              {
                priority: 'medium',
                requireConfirmation: true,
                writerName: updates.assignedWriter as string,
                assignedByName: updates.assignedWriter as string
              }
            ).catch(err => console.error('Failed to create assignment history:', err));
          }
          
          // Notify admin that writer picked the order
          notificationHelpers.notifyAdminOrderBid(
            orderId,
            order.title,
            updates.assignedWriter as string
          ).catch(err => console.error('Failed to notify admin:', err));
          
          console.log('🎯 OrderContext: Order bid by writer:', {
            orderId,
            oldStatus,
            newStatus: 'Awaiting Approval',
            writerId: updates.writerId,
            writerName: updates.assignedWriter,
            assignedAt: updates.assignedAt,
            note: 'Order is now awaiting admin approval before being assigned'
          });
          break;
        
        case 'approve_bid':
          if (order.status !== 'Awaiting Approval') {
            console.warn('⚠️ OrderContext: approve_bid only valid for orders awaiting approval');
            break;
          }
          newStatus = 'Assigned';
          updates.requiresConfirmation = false;
          updates.confirmedAt = new Date().toISOString();
          updates.confirmedBy = additionalData?.adminId || user?.id || 'admin';
          
          logOrderActivity(
            orderId,
            order.orderNumber,
            'approve_bid',
            'Awaiting Approval',
            'Assigned',
            `Admin approved bid for order ${order.orderNumber || orderId}`,
            { writerId: order.writerId, writerName: order.assignedWriter, approvedBy: updates.confirmedBy }
          ).catch(err => console.error('Failed to log activity:', err));
          
          if (order.writerId) {
            notificationType = 'order_assigned';
            notificationData = { orderId, orderTitle: order.title };
          }
          break;
        
        case 'decline_bid':
          if (order.status !== 'Awaiting Approval') {
            console.warn('⚠️ OrderContext: decline_bid only valid for orders awaiting approval');
            break;
          }
          newStatus = 'Available';
          updates.writerId = undefined;
          updates.assignedWriter = undefined;
          updates.pickedBy = undefined;
          updates.assignedBy = undefined;
          updates.assignmentNotes = additionalData?.notes;
          updates.requiresConfirmation = false;
          
          logOrderActivity(
            orderId,
            order.orderNumber,
            'decline_bid',
            'Awaiting Approval',
            'Available',
            `Admin declined bid for order ${order.orderNumber || orderId}`,
            { reason: additionalData?.notes }
          ).catch(err => console.error('Failed to log activity:', err));
          break;
        
        // Note: confirm_pick action removed - orders picked by writers now go directly to 'Assigned' status
          
        case 'assign':
          newStatus = 'Assigned';
          updates.writerId = additionalData?.writerId || 'unknown';
          updates.assignedWriter = additionalData?.writerName || 'Unknown Writer';
          if (additionalData?.notes) {
            updates.assignmentNotes = additionalData.notes;
          }
          updates.assignedAt = new Date().toISOString();
          updates.assignedBy = 'admin';
          updates.assignmentPriority = additionalData?.priority || 'medium';
          updates.assignmentDeadline = additionalData?.deadline;
          updates.requiresConfirmation = additionalData?.requireConfirmation || false;
          
          // Log activity
          logOrderActivity(
            orderId,
            order.orderNumber,
            'assign',
            oldStatus,
            'Assigned',
            `Order ${order.orderNumber || orderId} assigned to writer ${updates.assignedWriter} by admin`,
            { writerId: updates.writerId, writerName: updates.assignedWriter, priority: updates.assignmentPriority }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('🔄 OrderContext: Order assigned with enhanced data:', {
            orderId,
            writerId: updates.writerId,
            writerName: updates.assignedWriter,
            priority: updates.assignmentPriority,
            deadline: updates.assignmentDeadline,
            requiresConfirmation: updates.requiresConfirmation
          });
          
          // Queue notification to send after state update
          if (updates.writerId && updates.writerId !== 'unknown') {
            notificationType = 'assigned';
            notificationData = additionalData;
          }
          break;
          
        case 'make_available':
          newStatus = 'Available';
          updates.writerId = undefined;
          updates.assignedWriter = undefined;
          if (additionalData?.reason) {
            updates.reassignmentReason = additionalData.reason;
          }
          if (additionalData?.notes) {
            updates.assignmentNotes = additionalData.notes;
          }
          updates.madeAvailableAt = new Date().toISOString();
          updates.madeAvailableBy = additionalData?.source === 'writer_reassignment' ? 'writer' : 'admin';
          updates.reassignedAt = new Date().toISOString();
          
          // Clear assignment-related fields
          updates.assignedAt = undefined;
          updates.assignedBy = undefined;
          updates.assignmentPriority = undefined;
          updates.assignmentDeadline = undefined;
          updates.requiresConfirmation = undefined;
          
          console.log('🔄 OrderContext: Making order available:', {
            orderId,
            oldStatus,
            newStatus,
            reason: additionalData?.reason,
            source: additionalData?.source,
            madeAvailableBy: updates.madeAvailableBy
          });
          break;
          
        case 'start_work':
          newStatus = 'In Progress';
          updates.startedAt = new Date().toISOString();
          if (additionalData?.estimatedCompletionTime) {
            updates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          if (additionalData?.questions && Array.isArray(additionalData.questions)) {
            updates.writerQuestions = additionalData.questions.map((q, index) => ({
              id: `q-${Date.now()}-${index}`,
              question: q as string,
              askedAt: new Date().toISOString(),
              isRequired: false
            }));
          }
          if (additionalData?.additionalNotes) {
            updates.workStartNotes = additionalData.additionalNotes;
          }
          
          console.log('🚀 OrderContext: Writer started work on order:', {
            orderId,
            writerId: order.writerId,
            writerName: order.assignedWriter,
            startedAt: updates.startedAt,
            estimatedTime: updates.estimatedCompletionTime,
            questionsCount: updates.writerQuestions ? (updates.writerQuestions as Array<{id: string; question: string; askedAt: string; isRequired: boolean}>).length : 0
          });
          
          // Notify admin that work has started
          if (order.writerId && order.assignedWriter) {
            notificationHelpers.notifyAdminWorkStarted(
              orderId, 
              order.title, 
              order.assignedWriter
            ).catch(error => {
              console.error('Failed to send work started notification:', error);
            });
          }
          break;
          
        case 'submit':
          // Validation: Must have files to submit
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('Cannot submit order without uploaded files. Please upload at least one file.');
          }
          
          newStatus = 'Submitted'; // Submitted to admin for review
          updates.submittedToAdminAt = new Date().toISOString();
          updates.uploadedFiles = [...(order.uploadedFiles || []), ...additionalData.files];
          if (additionalData?.notes) {
            updates.submissionNotes = additionalData.notes;
          }
          if (additionalData?.estimatedCompletionTime) {
            updates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          
          // Queue activity logging
          notificationType = null; // No notification for submit (status change is enough)
          const submitFilesCount = additionalData.files.length;
          const activityDescription = `Order ${order.orderNumber || orderId} submitted to admin for review with ${submitFilesCount} file(s)`;
          logOrderActivity(
            orderId,
            order.orderNumber,
            'submit',
            oldStatus,
            'Submitted',
            activityDescription,
            { filesCount: submitFilesCount, notes: additionalData?.notes }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('📤 OrderContext: Order submitted to admin:', {
            orderId,
            oldStatus,
            newStatus: 'Submitted',
            writerId: order.writerId,
            filesCount: submitFilesCount,
            submittedAt: updates.submittedToAdminAt
          });
          break;
          
        case 'approve':
          newStatus = 'Completed'; // When admin approves, order goes directly to Completed
          updates.adminReviewedAt = new Date().toISOString();
          updates.adminReviewedBy = additionalData?.adminId || 'admin';
          updates.completedAt = new Date().toISOString();
          updates.approvedAt = new Date().toISOString(); // Track approval time
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          
          // Auto-record earnings when order is approved
          if (order.writerId && order.pages && addEarning) {
            const earningsAmount = order.pages * 350; // KES per page
            const earningsDescription = `Order ${order.orderNumber || orderId} approved: ${order.title}`;
            addEarning(order.id, earningsAmount, earningsDescription, 'regular');
            console.log('💰 OrderContext: Earnings recorded:', {
              orderId,
              writerId: order.writerId,
              amount: earningsAmount,
              description: earningsDescription
            });
          }
          
          // Queue notification to send after state update
          if (order.writerId) {
            notificationType = 'approved';
            notificationData = additionalData;
          }
          
          // Log activity
          logOrderActivity(
            orderId,
            order.orderNumber,
            'approve',
            oldStatus,
            'Completed',
            `Order ${order.orderNumber || orderId} approved by admin`,
            { amount: order.pages ? order.pages * 350 : 0, notes: additionalData?.notes }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('✅ OrderContext: Order approved and completed:', {
            orderId,
            oldStatus,
            newStatus: 'Completed',
            writerId: order.writerId,
            completedAt: updates.completedAt,
            approvedAt: updates.approvedAt
          });
          break;
          
        case 'reject':
          newStatus = 'Rejected';
          updates.adminReviewedAt = new Date().toISOString();
          updates.adminReviewedBy = additionalData?.adminId || 'admin';
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          // Apply 10% fine for rejection
          if (order.writerId) {
            const orderAmount = order.pages * 350;
            const fineAmount = orderAmount * 0.1;
            updates.fineAmount = (order.fineAmount || 0) + fineAmount;
            updates.fineReason = 'Order rejected by admin';
            if (!updates.fineHistory) updates.fineHistory = [];
            (updates.fineHistory as Array<{
              amount: number;
              reason: string;
              appliedAt: string;
              type: 'late' | 'rejection' | 'auto-reassignment';
            }>).push({
              amount: fineAmount,
              reason: 'Order rejected by admin',
              appliedAt: new Date().toISOString(),
              type: 'rejection'
            });
          }
          
          console.log('❌ OrderContext: Order rejected by admin:', {
            orderId,
            oldStatus,
            newStatus: 'Rejected',
            writerId: order.writerId,
            fineAmount: updates.fineAmount,
            adminNotes: updates.adminReviewNotes
          });
          break;
          
        case 'request_revision':
          newStatus = 'Revision';
          updates.adminReviewedAt = new Date().toISOString();
          updates.adminReviewedBy = additionalData?.adminId || 'admin';
          
          // Store revision explanation (required field)
          if (additionalData?.explanation) {
            updates.revisionExplanation = additionalData.explanation;
          }
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          
          // Track revision count and reduce revision score (start at 10/10, reduce by 1 each time)
          const currentRevisionCount = (order.revisionCount || 0) + 1;
          updates.revisionCount = currentRevisionCount;
          updates.revisionScore = Math.max(0, 10 - currentRevisionCount); // Reduce from 10
          
          // Add to revision requests array
          if (!updates.revisionRequests) {
            updates.revisionRequests = order.revisionRequests || [];
          }
          (updates.revisionRequests as Array<{
            id: string;
            reason: string;
            explanation: string;
            requestedAt: string;
            requestedBy: string;
            status: 'pending' | 'resolved';
          }>).push({
            id: `rev-${Date.now()}`,
            reason: additionalData?.explanation || 'Revision required',
            explanation: additionalData?.explanation || '',
            requestedAt: new Date().toISOString(),
            requestedBy: additionalData?.adminId || 'admin',
            status: 'pending'
          });
          
          // Log activity
          logOrderActivity(
            orderId,
            order.orderNumber,
            'request_revision',
            oldStatus,
            'Revision',
            `Order ${order.orderNumber || orderId} sent for revision by admin. Revision #${currentRevisionCount}`,
            { explanation: updates.revisionExplanation, revisionCount: currentRevisionCount, revisionScore: updates.revisionScore }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('📝 OrderContext: Revision requested by admin:', {
            orderId,
            oldStatus,
            newStatus: 'Revision',
            writerId: order.writerId,
            revisionExplanation: updates.revisionExplanation,
            revisionCount: currentRevisionCount,
            revisionScore: updates.revisionScore,
            adminNotes: updates.adminReviewNotes
          });
          
          // Queue notification to send after state update
          if (order.writerId) {
            notificationType = 'revision';
            notificationData = { explanation: updates.revisionExplanation };
          }
          break;
          
        case 'resubmit':
          // Validation: Must have files and revision notes to resubmit
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('Cannot resubmit revision without uploaded files. Please upload at least one file.');
          }
          if (!additionalData?.revisionNotes || !additionalData.revisionNotes.trim()) {
            throw new Error('Cannot resubmit revision without a revision summary. Please explain what changes were made.');
          }
          
          newStatus = 'Submitted'; // Resubmitted goes back to Submitted status for admin review
          updates.submittedToAdminAt = new Date().toISOString();
          updates.revisionSubmittedAt = new Date().toISOString();
          updates.uploadedFiles = [...(order.uploadedFiles || []), ...additionalData.files];
          updates.revisionResponseNotes = additionalData.revisionNotes;
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          
          // Log activity
          const resubmitFilesCount = additionalData.files.length;
          logOrderActivity(
            orderId,
            order.orderNumber,
            'resubmit',
            oldStatus,
            'Submitted',
            `Order ${order.orderNumber || orderId} resubmitted after revision with ${resubmitFilesCount} file(s)`,
            { filesCount: resubmitFilesCount, revisionNotes: additionalData.revisionNotes }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('📤 OrderContext: Order resubmitted after revision:', {
            orderId,
            oldStatus,
            newStatus: 'Submitted',
            writerId: order.writerId,
            revisionNotes: updates.revisionResponseNotes
          });
          break;
          
        case 'upload_files':
          // Upload files to order without changing status
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('No files provided to upload.');
          }
          
          // Append new files to existing uploaded files
          updates.uploadedFiles = [...(order.uploadedFiles || []), ...additionalData.files];
          updates.filesUploadedAt = new Date().toISOString();
          
          // Log activity
          const uploadedFilesCount = additionalData.files.length;
          logOrderActivity(
            orderId,
            order.orderNumber,
            'upload_files',
            oldStatus,
            oldStatus, // Status doesn't change
            `Order ${order.orderNumber || orderId} - ${uploadedFilesCount} file(s) uploaded`,
            { filesCount: uploadedFilesCount }
          ).catch(err => console.error('Failed to log activity:', err));
          
          console.log('📎 OrderContext: Files uploaded to order:', {
            orderId,
            filesCount: uploadedFilesCount,
            totalFiles: updates.uploadedFiles.length
          });
          break;
          
        case 'complete':
          newStatus = 'Completed';
          break;
          
        case 'reassign':
          newStatus = 'Available';
          updates.reassignmentReason = additionalData?.reason || 'No reason provided';
          updates.reassignedAt = new Date().toISOString();
          updates.reassignedBy = additionalData?.adminId || 'admin';
          updates.originalWriterId = order.writerId;
          updates.writerId = undefined;
          updates.assignedWriter = undefined;
          
          console.log('🔄 OrderContext: Order reassigned:', {
            orderId,
            originalWriter: order.assignedWriter,
            reason: updates.reassignmentReason,
            adminId: updates.reassignedBy
          });
          
          // Queue notification to send after state update
          if (order.writerId) {
            notificationType = 'reassigned';
            notificationData = { reason: updates.reassignmentReason };
          }
          
          // Apply 10% fine for auto-reassignment
          if (order.originalWriterId) {
            const orderAmount = order.pages * 350;
            const fineAmount = orderAmount * 0.1;
            updates.fineAmount = (order.fineAmount || 0) + fineAmount;
            updates.fineReason = 'Order automatically reassigned due to lateness';
            if (!updates.fineHistory) updates.fineHistory = [];
            (updates.fineHistory as Array<{
              amount: number;
              reason: string;
              appliedAt: string;
              type: 'late' | 'rejection' | 'auto-reassignment';
            }>).push({
              amount: fineAmount,
              reason: 'Order automatically reassigned due to lateness',
              appliedAt: new Date().toISOString(),
              type: 'auto-reassignment'
            });
          }
          break;
          
        case 'cancel':
          newStatus = 'Cancelled';
          break;
          
        case 'put_on_hold':
          newStatus = 'On Hold';
          updates.putOnHoldAt = new Date().toISOString();
          updates.putOnHoldBy = 'admin';
          updates.holdReason = additionalData?.reason || 'Order temporarily paused by admin';
          
          console.log('⏸️ OrderContext: Order put on hold:', {
            orderId,
            reason: updates.holdReason,
            adminId: updates.putOnHoldBy
          });
          break;
          
        case 'mark_urgent':
          // Don't change status, just mark as urgent
          updates.urgencyLevel = 'urgent';
          updates.markedUrgentAt = new Date().toISOString();
          updates.markedUrgentBy = additionalData?.adminId || 'admin';
          updates.urgentReason = additionalData?.reason || 'Order marked as urgent by admin';
          
          console.log('🚨 OrderContext: Order marked as urgent:', {
            orderId,
            reason: updates.urgentReason,
            adminId: updates.markedUrgentBy
          });
          break;
          
        case 'extend_deadline': {
          // Extend the deadline
          const newDeadline = additionalData?.newDeadline;
          if (newDeadline) {
            updates.deadline = newDeadline;
            updates.deadlineExtendedAt = new Date().toISOString();
            updates.deadlineExtendedBy = additionalData?.adminId || 'admin';
            updates.originalDeadline = order.deadline;
            updates.extensionReason = additionalData?.reason || 'Deadline extended by admin';
            
            console.log('⏰ OrderContext: Order deadline extended:', {
              orderId,
              originalDeadline: order.deadline,
              newDeadline,
              reason: updates.extensionReason,
              adminId: updates.deadlineExtendedBy
            });
          }
          break;
        }
        }
        
        const updatedOrder = { ...order, status: newStatus, ...updates };
        const normalizedWriterId = normalizeWriterId(updatedOrder.writerId);
        if (normalizedWriterId) {
          updatedOrder.writerId = normalizedWriterId;
        }
        
        // Store updated order for notification
        updatedOrderForNotification = updatedOrder as Order;
        
        console.log('✅ OrderContext: Order updated:', {
          orderId,
          action,
          oldStatus,
          newStatus,
          writerId: updatedOrder.writerId,
          assignedWriter: updatedOrder.assignedWriter,
          updatedFields: Object.keys(updates),
          timestamp: updatedAt,
          fullUpdatedOrder: updatedOrder
        });
        
        return updatedOrder;
      });
      
      console.log('📊 OrderContext: Orders state updated. Available orders:', 
        updatedOrders.filter(o => o.status === 'Available').length,
        'Assigned orders:', 
        updatedOrders.filter(o => o.status === 'Assigned').length
      );
      
      return updatedOrders;
    });

    // Send notification after state update (if needed)
    if (notificationType && updatedOrderForNotification) {
      const writerId = notificationType === 'assigned' 
        ? normalizeWriterId(additionalData?.writerId as string) || updatedOrderForNotification.writerId
        : updatedOrderForNotification.writerId;
      
      if (writerId && writerId !== 'unknown') {
        // Send notification asynchronously after state update
        sendOrderNotification(writerId, notificationType, updatedOrderForNotification, notificationData).catch(err => {
          console.error('Failed to send notification:', err);
        });
      }
    }

    // After updating local state, save to database
    const updatedOrder = orders.find(o => o.id === orderId);
    if (updatedOrder) {
      // Apply the same updates that were applied to local state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderWithUpdates = { ...updatedOrder } as any;
      
      // Apply the updates based on action (simplified)
      switch (action) {
        case 'assign':
          orderWithUpdates.status = 'Assigned';
          orderWithUpdates.writerId = additionalData?.writerId as string;
          orderWithUpdates.assignedWriter = additionalData?.writerName as string;
          orderWithUpdates.assignedAt = new Date().toISOString();
          orderWithUpdates.assignedBy = 'admin';
          if (additionalData?.notes) {
            orderWithUpdates.assignmentNotes = additionalData.notes;
          }
          if (additionalData?.priority) {
            orderWithUpdates.assignmentPriority = additionalData.priority;
          }
          break;
          
        case 'bid':
          orderWithUpdates.status = 'Awaiting Approval';
          orderWithUpdates.writerId = additionalData?.writerId as string;
          orderWithUpdates.assignedWriter = additionalData?.writerName as string;
          orderWithUpdates.assignedAt = new Date().toISOString();
          orderWithUpdates.pickedBy = 'writer';
          orderWithUpdates.assignedBy = 'writer';
          orderWithUpdates.assignmentPriority = additionalData?.priority || 'medium';
          orderWithUpdates.assignmentNotes = additionalData?.notes;
          orderWithUpdates.requiresConfirmation = true;
          break;
        
        case 'approve_bid':
          orderWithUpdates.status = 'Assigned';
          orderWithUpdates.requiresConfirmation = false;
          orderWithUpdates.confirmedAt = new Date().toISOString();
          orderWithUpdates.confirmedBy = additionalData?.adminId as string || 'admin';
          break;
        
        case 'decline_bid':
          orderWithUpdates.status = 'Available';
          orderWithUpdates.writerId = undefined;
          orderWithUpdates.assignedWriter = undefined;
          orderWithUpdates.pickedBy = undefined;
          orderWithUpdates.assignedBy = undefined;
          orderWithUpdates.assignmentNotes = additionalData?.notes;
          orderWithUpdates.requiresConfirmation = false;
          break;
          
        case 'make_available':
          orderWithUpdates.status = 'Available';
          orderWithUpdates.writerId = undefined;
          orderWithUpdates.assignedWriter = undefined;
          orderWithUpdates.madeAvailableAt = new Date().toISOString();
          if (additionalData?.notes) {
            orderWithUpdates.assignmentNotes = additionalData.notes;
          }
          // Clear assignment-related fields
          orderWithUpdates.assignedAt = undefined;
          orderWithUpdates.assignedBy = undefined;
          orderWithUpdates.assignmentPriority = undefined;
          orderWithUpdates.assignmentDeadline = undefined;
          orderWithUpdates.requiresConfirmation = undefined;
          break;
          
        case 'start_work':
          orderWithUpdates.status = 'In Progress';
          orderWithUpdates.startedAt = new Date().toISOString();
          if (additionalData?.estimatedCompletionTime) {
            orderWithUpdates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          if (additionalData?.additionalNotes) {
            orderWithUpdates.workStartNotes = additionalData.additionalNotes;
          }
          break;
          
        case 'submit_to_admin':
          // Validation: Must have files to submit
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('Cannot submit order without uploaded files. Please upload at least one file.');
          }
          
          orderWithUpdates.status = 'Submitted';
          orderWithUpdates.submittedAt = new Date().toISOString();
          orderWithUpdates.submittedToAdminAt = new Date().toISOString();
          if (additionalData?.files) {
            orderWithUpdates.uploadedFiles = [...(orderWithUpdates.uploadedFiles || []), ...additionalData.files];
          }
          if (additionalData?.notes) {
            orderWithUpdates.submissionNotes = additionalData.notes;
          }
          if (additionalData?.estimatedCompletionTime) {
            orderWithUpdates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          
          // Log activity
          const submitFilesCount = additionalData.files.length;
          logOrderActivity(
            orderId,
            orderWithUpdates.orderNumber,
            'submit',
            orderWithUpdates.status || 'In Progress',
            'Submitted',
            `Order ${orderWithUpdates.orderNumber || orderId} submitted to admin for review with ${submitFilesCount} file(s)`,
            { filesCount: submitFilesCount, notes: additionalData?.notes }
          ).catch(err => console.error('Failed to log activity:', err));
          
          break;
          
        case 'approve':
          orderWithUpdates.status = 'Completed';
          orderWithUpdates.approvedAt = new Date().toISOString();
          orderWithUpdates.approvedBy = additionalData?.adminId as string || 'admin';
          if (additionalData?.adminNotes) {
            orderWithUpdates.adminApprovalNotes = additionalData.adminNotes;
          }
          break;
          
        case 'reject':
          orderWithUpdates.status = 'Rejected';
          orderWithUpdates.rejectedAt = new Date().toISOString();
          orderWithUpdates.rejectedBy = additionalData?.adminId as string || 'admin';
          if (additionalData?.reason) {
            orderWithUpdates.rejectionReason = additionalData.reason;
          }
          break;
          
        case 'request_revision':
          orderWithUpdates.status = 'Revision';
          orderWithUpdates.revisionRequestedAt = new Date().toISOString();
          orderWithUpdates.revisionRequestedBy = additionalData?.adminId as string || 'admin';
          
          // Store revision explanation (required)
          if (additionalData?.explanation) {
            orderWithUpdates.revisionExplanation = additionalData.explanation as string;
          }
          if (additionalData?.revisionNotes) {
            orderWithUpdates.revisionNotes = additionalData.revisionNotes as string;
          }
          if (additionalData?.notes) {
            orderWithUpdates.adminReviewNotes = additionalData.notes as string;
          }
          
          // Track revision count and reduce score
          const currentRevisionCount = (orderWithUpdates.revisionCount || 0) + 1;
          orderWithUpdates.revisionCount = currentRevisionCount;
          orderWithUpdates.revisionScore = Math.max(0, 10 - currentRevisionCount);
          
          // Add to revision requests array
          if (!orderWithUpdates.revisionRequests) {
            orderWithUpdates.revisionRequests = orderWithUpdates.revisionRequests || [];
          }
          (orderWithUpdates.revisionRequests as Array<{
            id: string;
            reason: string;
            explanation: string;
            requestedAt: string;
            requestedBy: string;
            status: 'pending' | 'resolved';
          }>).push({
            id: `rev-${Date.now()}`,
            reason: (additionalData?.explanation as string) || 'Revision required',
            explanation: (additionalData?.explanation as string) || '',
            requestedAt: new Date().toISOString(),
            requestedBy: additionalData?.adminId as string || 'admin',
            status: 'pending'
          });
          break;
          
        case 'submit':
          // Validation: Must have files to submit
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('Cannot submit order without uploaded files. Please upload at least one file.');
          }
          
          orderWithUpdates.status = 'Submitted';
          orderWithUpdates.submittedAt = new Date().toISOString();
          orderWithUpdates.submittedToAdminAt = new Date().toISOString();
          if (additionalData?.files) {
            orderWithUpdates.uploadedFiles = [...(orderWithUpdates.uploadedFiles || []), ...additionalData.files];
          }
          if (additionalData?.notes) {
            orderWithUpdates.submissionNotes = additionalData.notes;
          }
          if (additionalData?.estimatedCompletionTime) {
            orderWithUpdates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          break;
          
        case 'resubmit':
          // Validation: Must have files to resubmit
          if (!additionalData?.files || !Array.isArray(additionalData.files) || additionalData.files.length === 0) {
            throw new Error('Cannot resubmit revision without uploaded files. Please upload at least one file.');
          }
          
          orderWithUpdates.status = 'Resubmitted';
          orderWithUpdates.resubmittedAt = new Date().toISOString();
          if (additionalData?.files) {
            orderWithUpdates.uploadedFiles = [...(orderWithUpdates.uploadedFiles || []), ...additionalData.files];
          }
          if (additionalData?.revisionNotes) {
            orderWithUpdates.resubmissionNotes = additionalData.revisionNotes;
          }
          if (additionalData?.notes) {
            orderWithUpdates.submissionNotes = additionalData.notes;
          }
          break;
          
        case 'confirm':
          orderWithUpdates.status = 'In Progress';
          if (additionalData?.confirmation) {
            orderWithUpdates.confirmation = additionalData.confirmation;
          }
          if (additionalData?.questions) {
            orderWithUpdates.questions = additionalData.questions;
          }
          // Ensure writerId is set if not already set
          if (!orderWithUpdates.writerId && additionalData?.writerId) {
            orderWithUpdates.writerId = additionalData.writerId as string;
          }
          if (!orderWithUpdates.assignedWriter && additionalData?.writerName) {
            orderWithUpdates.assignedWriter = additionalData.writerName as string;
          }
          if (!orderWithUpdates.assignedAt) {
            orderWithUpdates.assignedAt = new Date().toISOString();
          }
          break;
          
        case 'confirm_order':
          // Writer is picking/confirming an available order
          // This should work the same as 'pick' - set to 'Assigned' status
          orderWithUpdates.status = 'Assigned';
          // Set writerId and assignedWriter from additionalData
          if (additionalData?.writerId) {
            orderWithUpdates.writerId = additionalData.writerId as string;
          }
          if (additionalData?.writerName) {
            orderWithUpdates.assignedWriter = additionalData.writerName as string;
          }
          if (additionalData?.confirmation) {
            orderWithUpdates.confirmation = additionalData.confirmation;
          }
          if (additionalData?.questions) {
            orderWithUpdates.questions = additionalData.questions;
          }
          orderWithUpdates.assignedAt = new Date().toISOString();
          orderWithUpdates.pickedBy = 'writer';
          orderWithUpdates.assignedBy = 'writer';
          orderWithUpdates.assignmentPriority = 'medium';
          break;
          
        case 'refresh':
          // No database update needed for refresh
          return;
          
        default:
          console.warn('🔄 OrderContext: Unknown action in database update:', action);
          return;
      }

      const normalizedWriterIdForDb = normalizeWriterId(orderWithUpdates.writerId as string);
      if (normalizedWriterIdForDb) {
        orderWithUpdates.writerId = normalizedWriterIdForDb;
      }

      console.log('💾 OrderContext: Saving order to database:', {
        orderId,
        newStatus: orderWithUpdates.status,
        writerId: orderWithUpdates.writerId,
        assignedWriter: orderWithUpdates.assignedWriter
      });
      
      try {
        await db.update('orders', orderId, orderWithUpdates);
        console.log('✅ OrderContext: Order saved to database successfully');
      } catch (error) {
        console.error('❌ OrderContext: Failed to save order to database:', error);
        // Refresh orders to get the correct state from database
        refreshOrders();
        throw error;
      }
    }
  }, [orders, refreshOrders]);

  const confirmOrder = useCallback((orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'In Progress',
        confirmation: confirmation,
        questions: questions,
        updatedAt: new Date().toISOString()
      };
    }));
  }, []);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get available orders (excluding assigned orders and picked orders)
  const getAvailableOrders = useCallback(() => {
    return orders.filter(order => 
      order.status === 'Available' && 
      !order.writerId && 
      !order.assignedWriter &&
      order.pickedBy !== 'writer' // Exclude orders that were picked by writers
    );
  }, [orders]);

  const getWriterActiveOrders = useCallback((writerId: string) => {
    return orders.filter(order => 
      order.writerId === writerId && 
      ['Assigned', 'In Progress', 'Submitted', 'Approved', 'Revision', 'Resubmitted'].includes(order.status)
    );
  }, [orders]);

  const getWriterOrderStats = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => order.writerId === writerId);
    
    return {
      total: writerOrders.length,
      pending: writerOrders.filter(o => o.status === 'Submitted').length,
      available: 0, // Writers don't have available orders - they can only see unassigned orders
      inProgress: writerOrders.filter(o => o.status === 'In Progress').length,
      submitted: writerOrders.filter(o => o.status === 'Submitted').length,
      approved: writerOrders.filter(o => o.status === 'Approved').length,
      revision: writerOrders.filter(o => o.status === 'Revision').length,
      completed: writerOrders.filter(o => o.status === 'Completed').length,
      rejected: writerOrders.filter(o => o.status === 'Rejected').length,
      autoReassigned: 0, // Reassigned orders now go back to Available status
      cancelled: writerOrders.filter(o => o.status === 'Cancelled').length,
      onHold: writerOrders.filter(o => o.status === 'On Hold').length,
      disputed: writerOrders.filter(o => o.status === 'Disputed').length,
      refunded: writerOrders.filter(o => o.status === 'Refunded').length,
    };
  }, [orders]);

  const getWriterOrdersByCategory = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => order.writerId === writerId);
    
    return {
      pending: writerOrders.filter(o => o.status === 'Submitted'),
      available: [], // Writers don't have available orders - they can only see unassigned orders
      inProgress: writerOrders.filter(o => o.status === 'In Progress'),
      submitted: writerOrders.filter(o => o.status === 'Submitted'),
      approved: writerOrders.filter(o => o.status === 'Approved'),
      revision: writerOrders.filter(o => o.status === 'Revision'),
      completed: writerOrders.filter(o => o.status === 'Completed'),
      rejected: writerOrders.filter(o => o.status === 'Rejected'),
      autoReassigned: [], // Reassigned orders now go back to Available status
      cancelled: writerOrders.filter(o => o.status === 'Cancelled'),
      onHold: writerOrders.filter(o => o.status === 'On Hold'),
      disputed: writerOrders.filter(o => o.status === 'Disputed'),
      refunded: writerOrders.filter(o => o.status === 'Refunded'),
    };
  }, [orders]);

  // Calculate earnings for orders
  const calculateOrderEarnings = useCallback((order: Order) => {
    // New CPP calculation: 350 KES per page
    const cppAmount = 350;
    const totalAmount = order.pages * cppAmount;
    
    return {
      baseAmount: totalAmount,
      cppAmount,
      totalAmount,
      currency: 'KES',
      calculatedAt: new Date().toISOString()
    };
  }, []);

  // Pick an order (assign to writer)
  const pickOrder = useCallback((orderId: string, writerId: string, writerName: string) => {
    handleOrderAction('pick', orderId, { writerId, writerName });
  }, [handleOrderAction]);

  // Create a new order with immediate availability
  const createOrder = useCallback(async (orderData: Partial<Order>): Promise<Order> => {
    try {
      const newOrder: Order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: orderData.title || '',
        description: orderData.description || '',
        subject: orderData.discipline || '',
        discipline: orderData.discipline || '',
        paperType: orderData.paperType || 'Essay',
        pages: orderData.pages || 1,
        words: orderData.words || 275,
        format: orderData.format || 'APA',
        price: orderData.price || 350,
        priceKES: orderData.priceKES || 350,
        cpp: orderData.cpp || 350,
        totalPriceKES: orderData.totalPriceKES || 350,
        deadline: orderData.deadline || new Date().toISOString(),
        status: 'Available', // Always start as available unless explicitly assigned
        assignedWriter: undefined, // No writer assigned initially
        writerId: undefined, // No writer ID initially
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: orderData.updatedAt || new Date().toISOString(),
        isOverdue: false,
        confirmationStatus: 'pending',
        paymentType: 'advance',
        clientMessages: orderData.clientMessages || [],
        uploadedFiles: orderData.uploadedFiles || [],
        additionalInstructions: orderData.additionalInstructions,
        requiresAdminApproval: false,
        urgencyLevel: orderData.urgencyLevel || 'normal',
        attachments: orderData.attachments || []
      };

      // Save to database - this will trigger real-time updates
      const savedOrder = await db.create('orders', newOrder);
      
      // Update local state immediately for instant UI feedback
      setOrders(prev => [savedOrder, ...prev]);
      setLastUpdate(new Date().toISOString());
      
      console.log('✅ OrderContext: New order created and immediately available:', {
        orderId: savedOrder.id,
        title: savedOrder.title,
        status: savedOrder.status,
        writerId: savedOrder.writerId,
        assignedWriter: savedOrder.assignedWriter,
        timestamp: new Date().toISOString()
      });
      
      return savedOrder;
    } catch (error) {
      console.error('❌ OrderContext: Failed to create order:', error);
      throw error;
    }
  }, []);

  // Get writer's total earnings
  const getWriterTotalEarnings = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => 
      order.writerId === writerId && 
      ['Completed', 'Approved'].includes(order.status)
    );
    
    return writerOrders.reduce((total, order) => {
      return total + (order.pages * 350);
    }, 0);
  }, [orders]);

  // Get available orders count for real-time display
  const availableOrdersCount = orders.filter(order => order.status === 'Available').length;

  // Force reset database to clear any cached data
  const forceResetDatabase = useCallback(async () => {
    try {
      await db.reset();
      // Reload orders after reset
      const ordersData = await db.find<Order>('orders');
      setOrders(ordersData);
      setLastUpdate(new Date().toISOString());
      console.log('✅ Database reset completed, orders cleared');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
    }
  }, []);

  // Admin order management functions
  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Track changes for notification
      const changes: string[] = [];
      Object.entries(updates).forEach(([key, value]) => {
        if (order[key as keyof Order] !== value) {
          changes.push(`${key}: ${order[key as keyof Order]} → ${value}`);
        }
      });

      // Update order with new data and change tracking
      const updatedOrder: Order = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString(),
        lastAdminEdit: {
          editedAt: new Date().toISOString(),
          editedBy: 'admin', // TODO: Get actual admin ID
          changes,
          notificationSent: false
        }
      };

      // Save to database
      await db.update('orders', orderId, updatedOrder);
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setLastUpdate(new Date().toISOString());

      console.log('✅ Order updated:', { orderId, changes });
      
      // If order is assigned and has changes, send notification
      if ((order.writerId || order.assignedWriter) && changes.length > 0) {
        // TODO: Send notification to writer about changes
        console.log('📢 Writer notification needed for order changes:', { orderId, changes });
      }
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      throw error;
    }
  }, [orders]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.writerId || order.assignedWriter) {
        throw new Error('Cannot delete assigned orders');
      }

      // Delete from database
      await db.delete('orders', orderId);
      
      // Update local state
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setLastUpdate(new Date().toISOString());

      console.log('✅ Order deleted:', { orderId, title: order.title });
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      throw error;
    }
  }, [orders]);

  const addAdminMessage = useCallback(async (orderId: string, message: string, attachments: UploadedFile[], isNotification: boolean) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const adminMessage = {
        id: `ADMIN-MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message,
        attachments,
        sentAt: new Date().toISOString(),
        sentBy: 'admin', // TODO: Get actual admin ID
        isNotification
      };

      // Update order with new admin message
      const updatedOrder: Order = {
        ...order,
        adminMessages: [...(order.adminMessages || []), adminMessage],
        updatedAt: new Date().toISOString()
      };

      // Save to database
      await db.update('orders', orderId, updatedOrder);
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setLastUpdate(new Date().toISOString());

      console.log('✅ Admin message added:', { orderId, message, isNotification });
      
      // If this is a notification and order is assigned, send notification to writer
      if (isNotification && (order.writerId || order.assignedWriter)) {
        // TODO: Send notification to writer
        console.log('📢 Writer notification sent for admin message:', { orderId, message });
      }
    } catch (error) {
      console.error('❌ Failed to add admin message:', error);
      throw error;
    }
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      handleOrderAction,
      confirmOrder,
      pickOrder,
      refreshOrders,
      getOrdersByStatus,
      getAvailableOrders,
      getWriterActiveOrders,
      getWriterOrderStats,
      getWriterOrdersByCategory,
      calculateOrderEarnings,
      getWriterTotalEarnings,
      // New real-time features
      isConnected,
      lastUpdate,
      availableOrdersCount,
      // Database management
      forceResetDatabase,
      // Admin order management
      updateOrder,
      deleteOrder,
      addAdminMessage
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
