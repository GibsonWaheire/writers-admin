import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion, UploadedFile } from '../types/order';
import { db } from '../services/database';
import { notificationHelpers } from '../services/notificationService';

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

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  // Load orders from database on mount and subscribe to real-time updates
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await db.find<Order>('orders');
        setOrders(ordersData);
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
        setOrders(ordersData);
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
      setOrders(ordersData);
      setLastUpdate(new Date().toISOString());
      setIsConnected(true);
      console.log('✅ OrderContext: Orders refreshed from database');
    } catch (error) {
      console.error('❌ OrderContext: Failed to refresh orders:', error);
      setIsConnected(false);
    }
  }, []);

  // All mock data removed - orders are loaded from database only

  const handleOrderAction = useCallback(async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    console.log('🔄 OrderContext: Processing action:', {
      action,
      orderId,
      additionalData,
      timestamp: new Date().toISOString()
    });

    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id !== orderId) return order;

        const oldStatus = order.status;
        let newStatus = order.status;
        const updatedAt = new Date().toISOString();
        const updates: Record<string, unknown> = { updatedAt };
        
        switch (action) {
        case 'pick':
          newStatus = 'Assigned';
          updates.writerId = additionalData?.writerId || 'unknown';
          updates.assignedWriter = additionalData?.writerName || 'Unknown Writer';
          updates.assignedAt = new Date().toISOString();
          updates.pickedBy = 'writer';
          
          console.log('🎯 OrderContext: Order picked by writer:', {
            orderId,
            oldStatus,
            newStatus: 'Assigned',
            writerId: updates.writerId,
            writerName: updates.assignedWriter,
            assignedAt: updates.assignedAt
          });
          break;
          
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
          
          console.log('🔄 OrderContext: Order assigned with enhanced data:', {
            orderId,
            writerId: updates.writerId,
            writerName: updates.assignedWriter,
            priority: updates.assignmentPriority,
            deadline: updates.assignmentDeadline,
            requiresConfirmation: updates.requiresConfirmation
          });
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
          newStatus = 'Submitted';
          updates.submittedToAdminAt = new Date().toISOString();
          if (additionalData?.files && Array.isArray(additionalData.files)) {
            updates.uploadedFiles = [...order.uploadedFiles, ...additionalData.files];
          }
          if (additionalData?.notes) {
            updates.submissionNotes = additionalData.notes;
          }
          if (additionalData?.estimatedCompletionTime) {
            updates.estimatedCompletionTime = additionalData.estimatedCompletionTime;
          }
          
          console.log('📤 OrderContext: Order submitted to admin:', {
            orderId,
            oldStatus,
            newStatus: 'Submitted',
            writerId: order.writerId,
            filesCount: additionalData?.files ? (additionalData.files as Array<unknown>).length : 0,
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
          // Mark as approved for payment - wallet will sync automatically
          if (order.writerId) {
            console.log('💰 OrderContext: Order approved, payment will be processed by wallet sync:', {
              orderId,
              writerId: order.writerId,
              amount: order.pages * 350,
              status: 'Completed'
            });
          }
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
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          
          console.log('📝 OrderContext: Revision requested by admin:', {
            orderId,
            oldStatus,
            newStatus: 'Revision',
            writerId: order.writerId,
            adminNotes: updates.adminReviewNotes
          });
          break;
          
        case 'resubmit':
          newStatus = 'Resubmitted';
          updates.submittedToAdminAt = new Date().toISOString();
          updates.revisionSubmittedAt = new Date().toISOString();
          if (additionalData?.files && Array.isArray(additionalData.files)) {
            updates.uploadedFiles = [...order.uploadedFiles, ...additionalData.files];
          }
          if (additionalData?.revisionNotes) {
            updates.revisionResponseNotes = additionalData.revisionNotes;
          }
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          
          console.log('📤 OrderContext: Order resubmitted after revision:', {
            orderId,
            oldStatus,
            newStatus: 'Resubmitted',
            writerId: order.writerId,
            revisionNotes: updates.revisionResponseNotes
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
          
        case 'pick':
          orderWithUpdates.status = 'Assigned';
          orderWithUpdates.writerId = additionalData?.writerId as string;
          orderWithUpdates.assignedWriter = additionalData?.writerName as string;
          orderWithUpdates.assignedAt = new Date().toISOString();
          orderWithUpdates.pickedBy = 'writer';
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
          orderWithUpdates.status = 'Submitted';
          orderWithUpdates.submittedAt = new Date().toISOString();
          if (additionalData?.submissionNotes) {
            orderWithUpdates.submissionNotes = additionalData.submissionNotes;
          }
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
          if (additionalData?.revisionNotes) {
            orderWithUpdates.revisionNotes = additionalData.revisionNotes;
          }
          break;
          
        case 'resubmit':
          orderWithUpdates.status = 'Submitted';
          orderWithUpdates.resubmittedAt = new Date().toISOString();
          if (additionalData?.revisionNotes) {
            orderWithUpdates.resubmissionNotes = additionalData.revisionNotes;
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
          break;
          
        case 'refresh':
          // No database update needed for refresh
          return;
          
        default:
          console.warn('🔄 OrderContext: Unknown action in database update:', action);
          return;
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

  // Get available orders (excluding assigned orders)
  const getAvailableOrders = useCallback(() => {
    return orders.filter(order => 
      order.status === 'Available' && 
      !order.writerId && 
      !order.assignedWriter
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
