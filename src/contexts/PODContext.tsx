import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PODOrder, PODStatus, PODDelivery, PODPayment } from '../types/pod';
import { db } from '../services/database';

interface PODContextType {
  podOrders: PODOrder[];
  addPODOrder: (order: Omit<PODOrder, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => void;
  updatePODOrderStatus: (orderId: string, status: PODStatus) => void;
  assignPODOrderToWriter: (orderId: string, writerId: string, writerName: string) => void;
  pickPODOrder: (orderId: string, writerId: string, writerName: string) => void;
  handlePODOrderAction: (action: string, orderId: string) => void;
  getPODOrdersByStatus: (status: PODStatus) => PODOrder[];
  getAvailablePODOrders: () => PODOrder[];
  getWriterPODOrders: (writerId: string) => PODOrder[];
  getWriterPODStats: (writerId: string) => {
    total: number;
    available: number;
    assigned: number;
    inProgress: number;
    readyForDelivery: number;
    delivered: number;
    paymentReceived: number;
    cancelled: number;
    onHold: number;
    disputed: number;
    refunded: number;
  };
  recordDelivery: (orderId: string, delivery: Omit<PODDelivery, 'id'>) => void;
  recordPayment: (orderId: string, payment: Omit<PODPayment, 'id'>) => void;
  getPODDeliveries: (orderId?: string) => PODDelivery[];
  getPODPayments: (orderId?: string) => PODPayment[];
  calculatePODAmount: (pages: number) => number;
  getTotalPODValue: () => number;
}

const PODContext = createContext<PODContextType | undefined>(undefined);

export function PODProvider({ children }: { children: React.ReactNode }) {
  const [pODOrders, setPODOrders] = useState<PODOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load POD orders from database on mount
  useEffect(() => {
    const loadPODOrders = async () => {
      try {
        setIsLoading(true);
        const podOrdersData = await db.find<PODOrder>('podOrders');
        setPODOrders(podOrdersData);
      } catch (error) {
        console.error('Failed to load POD orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPODOrders();
  }, []);

  // Old hardcoded POD orders for reference
  const [oldPODOrders] = useState<PODOrder[]>([
    {
      id: 'POD-001',
      title: 'Business Strategy Analysis - Retail Sector',
      description: 'Comprehensive analysis of retail business strategies including market positioning, competitive analysis, and growth recommendations',
      subject: 'Business Strategy',
      discipline: 'Business',
      paperType: 'Business Plan',
      pages: 18,
      words: 4500,
      format: 'APA',
      price: 0, // No longer used - using CPP calculation
      priceKES: 0, // No longer used - using CPP calculation
      cpp: 350, // New CPP: 350 KES per page
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      deadlineHours: 24, // 24-hour deadline
      status: 'Available',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      isOverdue: false,
      podAmount: 18 * 350, // 18 pages × 350 KES = 6,300 KES
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on customer experience improvements and operational efficiency'
    },
    {
      id: 'POD-002',
      title: 'Thesis - Machine Learning in Healthcare',
      description: 'Comprehensive thesis on applications of machine learning in medical diagnosis and treatment',
      subject: 'Healthcare Technology',
      discipline: 'Computer Science',
      paperType: 'Thesis',
      pages: 80,
      words: 20000,
      format: 'APA',
      price: 0, // No longer used - using CPP calculation
      priceKES: 0, // No longer used - using CPP calculation
      cpp: 350, // New CPP: 350 KES per page
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
      deadlineHours: 48, // 48-hour deadline
      status: 'Available',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      isOverdue: false,
      podAmount: 80 * 350, // 80 pages × 350 KES = 28,000 KES
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include ethical considerations and real-world case studies'
    },
    {
      id: 'POD-003',
      title: 'Business Plan - Sustainable Energy Solutions',
      description: 'Comprehensive business plan for renewable energy company focusing on solar and wind solutions',
      subject: 'Sustainable Energy',
      discipline: 'Business',
      paperType: 'Business Plan',
      pages: 25,
      words: 6250,
      format: 'Chicago',
      price: 0, // No longer used - using CPP calculation
      priceKES: 0, // No longer used - using CPP calculation
      cpp: 350, // New CPP: 350 KES per page
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      deadlineHours: 24, // 24-hour deadline
      status: 'Available',
      createdAt: '2024-01-25',
      updatedAt: '2024-01-25',
      isOverdue: false,
      podAmount: 25 * 350, // 25 pages × 350 KES = 8,750 KES
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include 10-year financial projections and environmental impact assessment'
    }
  ]);

  const [deliveries, setDeliveries] = useState<PODDelivery[]>([]);
  const [payments, setPayments] = useState<PODPayment[]>([]);

  const addPODOrder = useCallback((order: Omit<PODOrder, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => {
    // Calculate POD amount using new CPP: 350 KES per page
    const calculatedPodAmount = order.pages * 350;
    
    // Calculate deadline based on hours
    const deadlineDate = new Date(Date.now() + (order.deadlineHours * 60 * 60 * 1000));
    
    const newOrder: PODOrder = {
      ...order,
      id: `POD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOverdue: false,
      podAmount: calculatedPodAmount,
      cpp: 350, // Set CPP to 350 KES per page
      price: 0, // No longer used
      priceKES: 0, // No longer used
      deadline: deadlineDate.toISOString() // Set deadline based on hours
    };
    setPODOrders(prev => [...prev, newOrder]);
  }, []);

  // Function to calculate POD amount for any order
  const calculatePODAmount = useCallback((pages: number) => {
    return pages * 350; // 350 KES per page
  }, []);

  // Function to get total POD value using new CPP calculation
  const getTotalPODValue = useCallback(() => {
    return pODOrders.reduce((total, order) => total + (order.pages * 350), 0);
  }, [pODOrders]);

  const updatePODOrderStatus = useCallback((orderId: string, status: PODStatus) => {
    setPODOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ));
  }, []);

  const assignPODOrderToWriter = useCallback((orderId: string, writerId: string, writerName: string) => {
    setPODOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            writerId, 
            assignedWriter: writerName,
            status: 'Assigned', 
            updatedAt: new Date().toISOString() 
          }
        : order
    ));
  }, []);

  const pickPODOrder = useCallback((orderId: string, writerId: string, writerName: string) => {
    setPODOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            writerId, 
            assignedWriter: writerName,
            status: 'Assigned', 
            updatedAt: new Date().toISOString() 
          }
        : order
    ));
  }, []);

  const handlePODOrderAction = useCallback((action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    setPODOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      let newStatus = order.status;
      const updatedAt = new Date().toISOString();
      const updates: Record<string, unknown> = { updatedAt };
      
      switch (action) {
        case 'pick':
          newStatus = 'Assigned';
          break;
        case 'start_working':
          newStatus = 'In Progress';
          break;
        case 'submit_to_admin':
          newStatus = 'Submitted to Admin';
          break;
        case 'admin_approve':
          newStatus = 'Admin Approved';
          updates.adminReviewedAt = new Date().toISOString();
          updates.adminReviewedBy = additionalData?.adminId || 'admin';
          if (additionalData?.notes) {
            updates.adminReviewNotes = additionalData.notes;
          }
          break;
        case 'admin_reject':
          newStatus = 'Revision Required';
          updates.adminReviewedAt = new Date().toISOString();
          updates.adminReviewedBy = additionalData?.adminId || 'admin';
          if (additionalData?.notes) {
            updates.revisionNotes = additionalData.notes;
            updates.revisionRequestedAt = new Date().toISOString();
            updates.revisionRequestedBy = additionalData?.adminId || 'admin';
            updates.revisionCount = (order.revisionCount || 0) + 1;
          }
          break;
        case 'ready_for_delivery':
          newStatus = 'Ready for Delivery';
          break;
        case 'deliver':
          newStatus = 'Delivered';
          break;
        case 'receive_payment':
          newStatus = 'Payment Received';
          break;
        case 'complete':
          newStatus = 'Completed';
          break;
        case 'reassign':
          newStatus = 'Available';
          // Clear writer assignment when reassigning
          return { 
            ...order, 
            status: newStatus, 
            writerId: undefined,
            assignedWriter: undefined,
            updatedAt 
          };
        case 'cancel':
          newStatus = 'Cancelled';
          break;
        case 'put_on_hold':
          newStatus = 'On Hold';
          break;
        case 'dispute':
          newStatus = 'Disputed';
          break;
        case 'refund':
          newStatus = 'Refunded';
          break;
      }
      
      return { ...order, status: newStatus, ...updates };
    }));
  }, []);

  const getPODOrdersByStatus = useCallback((status: PODStatus) => {
    return pODOrders.filter(order => order.status === status);
  }, [pODOrders]);

  const getAvailablePODOrders = useCallback(() => {
    return pODOrders.filter(order => 
      order.status === 'Available' && !order.writerId
    );
  }, [pODOrders]);

  const getWriterPODOrders = useCallback((writerId: string) => {
    return pODOrders.filter(order => 
      order.writerId === writerId && 
      ['Assigned', 'In Progress', 'Submitted to Admin', 'Admin Approved', 'Revision Required', 'Ready for Delivery', 'Delivered', 'Payment Received', 'Completed'].includes(order.status)
    );
  }, [pODOrders]);

  const getWriterPODStats = useCallback((writerId: string) => {
    const writerOrders = pODOrders.filter(order => order.writerId === writerId);
    
    return {
      total: writerOrders.length,
      available: writerOrders.filter(o => o.status === 'Available').length,
      assigned: writerOrders.filter(o => o.status === 'Assigned').length,
      inProgress: writerOrders.filter(o => o.status === 'In Progress').length,
      submittedToAdmin: writerOrders.filter(o => o.status === 'Submitted to Admin').length,
      adminApproved: writerOrders.filter(o => o.status === 'Admin Approved').length,
      revisionRequired: writerOrders.filter(o => o.status === 'Revision Required').length,
      readyForDelivery: writerOrders.filter(o => o.status === 'Ready for Delivery').length,
      delivered: writerOrders.filter(o => o.status === 'Delivered').length,
      paymentReceived: writerOrders.filter(o => o.status === 'Payment Received').length,
      completed: writerOrders.filter(o => o.status === 'Completed').length,
      cancelled: writerOrders.filter(o => o.status === 'Cancelled').length,
      onHold: writerOrders.filter(o => o.status === 'On Hold').length,
      disputed: writerOrders.filter(o => o.status === 'Disputed').length,
      refunded: writerOrders.filter(o => o.status === 'Refunded').length,
    };
  }, [pODOrders]);

  const recordDelivery = useCallback((orderId: string, delivery: Omit<PODDelivery, 'id'>) => {
    const newDelivery: PODDelivery = {
      ...delivery,
      id: `DEL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    setDeliveries(prev => [...prev, newDelivery]);
    
    // Update order status to delivered
    updatePODOrderStatus(orderId, 'Delivered');
  }, [updatePODOrderStatus]);

  const recordPayment = useCallback((orderId: string, payment: Omit<PODPayment, 'id'>) => {
    const newPayment: PODPayment = {
      ...payment,
      id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    setPayments(prev => [...prev, newPayment]);
    
    // Update order status to payment received
    updatePODOrderStatus(orderId, 'Payment Received');
  }, [updatePODOrderStatus]);

  const getPODDeliveries = useCallback((orderId?: string) => {
    if (orderId) {
      return deliveries.filter(delivery => delivery.podOrderId === orderId);
    }
    return deliveries;
  }, [deliveries]);

  const getPODPayments = useCallback((orderId?: string) => {
    if (orderId) {
      return payments.filter(payment => payment.podOrderId === orderId);
    }
    return payments;
  }, [payments]);

  return (
    <PODContext.Provider value={{
      podOrders: pODOrders,
      addPODOrder,
      updatePODOrderStatus,
      assignPODOrderToWriter,
      pickPODOrder,
      handlePODOrderAction,
      getPODOrdersByStatus,
      getAvailablePODOrders,
      getWriterPODOrders,
      getWriterPODStats,
      recordDelivery,
      recordPayment,
      getPODDeliveries,
      getPODPayments,
      calculatePODAmount,
      getTotalPODValue
    }}>
      {children}
    </PODContext.Provider>
  );
}

export function usePOD() {
  const context = useContext(PODContext);
  if (context === undefined) {
    throw new Error('usePOD must be used within a PODProvider');
  }
  return context;
}
