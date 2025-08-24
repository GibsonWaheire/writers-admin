import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion } from '../types/order';
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
        console.error('Failed to refresh orders from real-time update:', error);
        setIsConnected(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
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

  // Hardcoded orders removed - all data now comes from database
  /* const [oldOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      title: 'Research Paper on Climate Change',
      description: 'Comprehensive analysis of climate change impacts on coastal communities',
      subject: 'Environmental Science',
      discipline: 'Environmental Science',
      paperType: 'Research Paper',
      pages: 15,
      words: 3750,
      format: 'APA',
      price: 450,
      priceKES: 67500,
      cpp: 4500,
      totalPriceKES: 67500,
      deadline: '2024-02-15',
      status: 'Available',
      assignedWriter: undefined,
      writerId: undefined,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      clientMessages: [
        {
          id: 'msg-1',
          sender: 'client',
          message: 'Need this for academic publication',
          timestamp: '2024-01-15T10:00:00Z'
        }
      ],
      uploadedFiles: [],
      additionalInstructions: 'Include recent studies from 2020-2024'
    },
    {
      id: 'ORD-002',
      title: 'Business Plan for Tech Startup',
      description: 'Comprehensive business plan for a mobile app development startup',
      subject: 'Business',
      discipline: 'Business Administration',
      paperType: 'Business Plan',
      pages: 12,
      words: 3000,
      format: 'APA',
      price: 360,
      priceKES: 42000,
      cpp: 350,
      totalPriceKES: 42000,
      deadline: '2024-02-10',
      status: 'Submitted',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [
        {
          id: 'msg-2',
          sender: 'client',
          message: 'Focus on B2B market and include pricing strategies',
          timestamp: '2024-01-16T09:00:00Z'
        },
        {
          id: 'msg-3',
          sender: 'writer',
          message: 'Working on the competitive analysis section. Will include pricing strategies as requested.',
          timestamp: '2024-01-17T14:30:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-2',
          filename: 'market_data.xlsx',
          originalName: 'Market_Data.xlsx',
          size: 1048576,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          url: '/files/market_data.xlsx',
          uploadedAt: '2024-01-16T09:00:00Z'
        }
      ],
      additionalInstructions: 'Include SWOT analysis and market positioning'
    },
    {
      id: 'ORD-003',
      title: 'Literature Review - Cognitive Behavioral Therapy',
      description: 'Systematic review of cognitive behavioral therapy effectiveness in treating anxiety disorders',
      subject: 'Psychology',
      discipline: 'Psychology',
      paperType: 'Literature Review',
      pages: 12,
      words: 3000,
      format: 'APA',
      price: 360,
      priceKES: 54000,
      cpp: 4500,
      totalPriceKES: 54000,
      deadline: '2024-02-20',
      status: 'In Progress',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on studies from the last 10 years and include meta-analysis'
    },
    {
      id: 'ORD-004',
      title: 'Technical Documentation for Mobile API',
      description: 'Comprehensive API documentation for mobile application development with code examples',
      subject: 'Technology',
      discipline: 'Computer Science',
      paperType: 'Technical Documentation',
      pages: 10,
      words: 2500,
      format: 'IEEE',
      price: 320,
      priceKES: 48000,
      cpp: 4800,
      totalPriceKES: 48000,
      deadline: '2024-02-05',
      status: 'Submitted',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [
        {
          id: 'msg-4',
          sender: 'client',
          message: 'Need this for our development team onboarding',
          timestamp: '2024-01-18T11:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-3',
          filename: 'api_docs.pdf',
          originalName: 'API_Documentation.pdf',
          size: 2097152,
          type: 'application/pdf',
          url: '/files/api_docs.pdf',
          uploadedAt: '2024-01-18T11:00:00Z'
        }
      ],
      additionalInstructions: 'Include authentication examples and error handling'
    },
    {
      id: 'ORD-005',
      title: 'Case Study - Digital Transformation',
      description: 'Analysis of successful digital transformation in traditional retail companies',
      subject: 'Business',
      discipline: 'Business Strategy',
      paperType: 'Case Study',
      pages: 8,
      words: 2000,
      format: 'Harvard',
      price: 240,
      priceKES: 28000,
      cpp: 350,
      totalPriceKES: 28000,
      deadline: '2024-02-12',
      status: 'Revision',
      assignedWriter: 'Jane Smith',
      writerId: 'writer-2',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [
        {
          id: 'msg-5',
          sender: 'admin',
          message: 'Please revise the methodology section and add more recent examples',
          timestamp: '2024-01-19T15:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-4',
          filename: 'case_study_v1.pdf',
          originalName: 'Digital_Transformation_Case_Study.pdf',
          size: 1572864,
          type: 'application/pdf',
          url: '/files/case_study_v1.pdf',
          uploadedAt: '2024-01-19T15:00:00Z'
        }
      ],
      additionalInstructions: 'Focus on companies that successfully adapted to e-commerce'
    },
    // Add some test orders for admin assignment testing
    {
      id: 'ORD-TEST-001',
      title: 'Marketing Strategy Analysis',
      description: 'Comprehensive marketing strategy analysis for a new product launch in the technology sector',
      subject: 'Marketing',
      discipline: 'Business Administration',
      paperType: 'Marketing Analysis',
      pages: 8,
      words: 2000,
      format: 'APA',
      price: 280,
      priceKES: 28000,
      cpp: 350,
      totalPriceKES: 28000,
      deadline: '2024-02-25',
      status: 'Available',
      assignedWriter: undefined,
      writerId: undefined,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on digital marketing strategies and social media presence',
      requiresAdminApproval: false,
      urgencyLevel: 'normal'
    },
    {
      id: 'ORD-TEST-002',
      title: 'Data Science Project Report',
      description: 'Machine learning model development and evaluation report for predictive analytics',
      subject: 'Computer Science',
      discipline: 'Computer Science',
      paperType: 'Technical Documentation',
      pages: 15,
      words: 3750,
      format: 'IEEE',
      price: 525,
      priceKES: 52500,
      cpp: 350,
      totalPriceKES: 52500,
      deadline: '2024-02-28',
      status: 'Available',
      assignedWriter: undefined,
      writerId: undefined,
      createdAt: '2024-01-21',
      updatedAt: '2024-01-21',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include code examples and performance metrics',
      requiresAdminApproval: false,
      urgencyLevel: 'urgent'
    },
    // Add a test order that's currently assigned to test "Make Available" functionality
    {
      id: 'ORD-TEST-003',
      title: 'Business Ethics Case Study',
      description: 'Analysis of ethical dilemmas in modern business practices with real-world examples',
      subject: 'Business Ethics',
      discipline: 'Business Administration',
      paperType: 'Case Study',
      pages: 10,
      words: 2500,
      format: 'Harvard',
      price: 350,
      priceKES: 35000,
      cpp: 350,
      totalPriceKES: 35000,
      deadline: '2024-02-22',
      status: 'Assigned',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on recent corporate scandals and their ethical implications',
      requiresAdminApproval: false,
      urgencyLevel: 'normal'
    },
    // Add a completed order for testing the completed tab and balance update
    {
      id: 'ORD-COMPLETED-001',
      title: 'Marketing Strategy for Social Media Platform',
      description: 'Comprehensive marketing strategy for a new social media platform targeting Gen Z users',
      subject: 'Marketing',
      discipline: 'Business Administration',
      paperType: 'Marketing Analysis',
      pages: 6,
      words: 1500,
      format: 'APA',
      price: 210,
      priceKES: 21000,
      cpp: 350,
      totalPriceKES: 21000,
      deadline: '2024-01-20',
      status: 'Completed',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-22',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      clientMessages: [
        {
          id: 'msg-completed-1',
          sender: 'admin',
          message: 'Excellent work! This marketing strategy is comprehensive and well-researched.',
          timestamp: '2024-01-22T10:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-completed-1',
          filename: 'marketing_strategy_final.pdf',
          originalName: 'Social_Media_Marketing_Strategy.pdf',
          size: 2048576,
          type: 'application/pdf',
          url: '/files/marketing_strategy_final.pdf',
          uploadedAt: '2024-01-21T16:00:00Z'
        }
      ],
      additionalInstructions: 'Include competitor analysis and budget allocation',
      requiresAdminApproval: false,
      urgencyLevel: 'normal',
      submittedToAdminAt: '2024-01-21T16:00:00Z',
      adminReviewedAt: '2024-01-22T10:00:00Z',
      adminReviewedBy: 'admin-1',
      approvedAt: '2024-01-22T10:00:00Z',
      completedAt: '2024-01-22T10:00:00Z',
      adminReviewNotes: 'Outstanding quality. Clear structure, excellent research, and practical recommendations.'
    }
  ]); */

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
      
      // Save updated order to database (async operation)
      const updatedOrder = updatedOrders.find(o => o.id === orderId);
      if (updatedOrder) {
        console.log('💾 OrderContext: Saving order to database:', {
          orderId,
          newStatus: updatedOrder.status,
          writerId: updatedOrder.writerId,
          assignedWriter: updatedOrder.assignedWriter
        });
        
        // Use Promise to handle async database update
        db.update('orders', orderId, updatedOrder)
          .then(() => {
            console.log('✅ OrderContext: Order saved to database successfully');
            // Force immediate state refresh to ensure UI updates
            setTimeout(() => {
              console.log('🔄 OrderContext: Forcing refresh after database update...');
              refreshOrders();
            }, 100);
          })
          .catch((error) => {
            console.error('❌ OrderContext: Failed to save order to database:', error);
            // Revert the change if database update fails
            setOrders(prev);
          });
      }
      
      return updatedOrders;
    });
  }, [refreshOrders]);

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
      (order.status === 'Available' || order.status === 'Auto-Reassigned') && 
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
      available: writerOrders.filter(o => o.status === 'Available').length,
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
      available: writerOrders.filter(o => o.status === 'Available'),
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
        status: orderData.status || 'Available',
        assignedWriter: orderData.assignedWriter,
        writerId: orderData.writerId,
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
      availableOrdersCount
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
