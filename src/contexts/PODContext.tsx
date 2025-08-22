import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PODOrder, PODStatus, PODDelivery, PODPayment } from '../types/pod';

interface PODContextType {
  podOrders: PODOrder[];
  addPODOrder: (order: Omit<PODOrder, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => void;
  updatePODOrderStatus: (orderId: string, status: PODStatus) => void;
  assignPODOrderToWriter: (orderId: string, writerId: string, writerName: string) => void;
  pickPODOrder: (orderId: string, writerId: string, writerName: string) => void;
  handlePODOrderAction: (action: string, orderId: string, notes?: string) => void;
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
}

const PODContext = createContext<PODContextType | undefined>(undefined);

export function PODProvider({ children }: { children: React.ReactNode }) {
  const [podOrders, setPODOrders] = useState<PODOrder[]>([
    {
      id: 'POD-001',
      title: 'Case Study - Digital Transformation in Banking',
      description: 'Analysis of successful digital transformation initiatives in traditional banking sector',
      subject: 'Business Technology',
      discipline: 'Business',
      paperType: 'Case Study',
      pages: 14,
      words: 3500,
      format: 'Harvard',
      price: 420,
      priceKES: 63000,
      cpp: 4500,
      deadline: '2024-02-25',
      status: 'Available',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      isOverdue: false,
      podAmount: 63000,
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
      price: 1200,
      priceKES: 180000,
      cpp: 2250,
      deadline: '2024-03-15',
      status: 'Available',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      isOverdue: false,
      podAmount: 180000,
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
      price: 750,
      priceKES: 112500,
      cpp: 4500,
      deadline: '2024-03-20',
      status: 'Available',
      createdAt: '2024-01-25',
      updatedAt: '2024-01-25',
      isOverdue: false,
      podAmount: 112500,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include 10-year financial projections and environmental impact assessment'
    }
  ]);

  const [deliveries, setDeliveries] = useState<PODDelivery[]>([]);
  const [payments, setPayments] = useState<PODPayment[]>([]);

  const addPODOrder = useCallback((order: Omit<PODOrder, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => {
    const newOrder: PODOrder = {
      ...order,
      id: `POD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOverdue: new Date(order.deadline) < new Date()
    };
    setPODOrders(prev => [...prev, newOrder]);
  }, []);

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
            status: 'In Progress', 
            updatedAt: new Date().toISOString() 
          }
        : order
    ));
  }, []);

  const handlePODOrderAction = useCallback((action: string, orderId: string, notes?: string) => {
    setPODOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      let newStatus = order.status;
      const updatedAt = new Date().toISOString();
      
      switch (action) {
        case 'start_working':
          newStatus = 'In Progress';
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
      
      return { ...order, status: newStatus, updatedAt };
    }));
  }, []);

  const getPODOrdersByStatus = useCallback((status: PODStatus) => {
    return podOrders.filter(order => order.status === status);
  }, [podOrders]);

  const getAvailablePODOrders = useCallback(() => {
    return podOrders.filter(order => 
      order.status === 'Available' && !order.writerId && !order.assignedWriter
    );
  }, [podOrders]);

  const getWriterPODOrders = useCallback((writerId: string) => {
    return podOrders.filter(order => order.writerId === writerId);
  }, [podOrders]);

  const getWriterPODStats = useCallback((writerId: string) => {
    const writerOrders = podOrders.filter(order => order.writerId === writerId);
    
    return {
      total: writerOrders.length,
      available: writerOrders.filter(o => o.status === 'Available').length,
      assigned: writerOrders.filter(o => o.status === 'Assigned').length,
      inProgress: writerOrders.filter(o => o.status === 'In Progress').length,
      readyForDelivery: writerOrders.filter(o => o.status === 'Ready for Delivery').length,
      delivered: writerOrders.filter(o => o.status === 'Delivered').length,
      paymentReceived: writerOrders.filter(o => o.status === 'Payment Received').length,
      cancelled: writerOrders.filter(o => o.status === 'Cancelled').length,
      onHold: writerOrders.filter(o => o.status === 'On Hold').length,
      disputed: writerOrders.filter(o => o.status === 'Disputed').length,
      refunded: writerOrders.filter(o => o.status === 'Refunded').length,
    };
  }, [podOrders]);

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
      podOrders,
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
      getPODPayments
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
