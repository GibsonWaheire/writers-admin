import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion, OrderEarnings } from '../types/order';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrderToWriter: (orderId: string, writerId: string) => void;
  pickOrder: (orderId: string, writerId: string) => void;
  handleOrderAction: (action: string, orderId: string, notes?: string) => void;
  confirmOrder: (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getAvailableOrders: () => Order[];
  getPODOrders: () => Order[];
  getWriterActiveOrders: (writerId: string) => Order[];
  getWriterOrderStats: (writerId: string) => {
    total: number;
    pending: number;
    available: number;
    inProgress: number;
    uploadToClient: number;
    editorRevision: number;
    approved: number;
    payLater: number;
    completed: number;
    rejected: number;
    awaitingConfirmation: number;
    confirmed: number;
    awaitingPayment: number;
  };
  getWriterOrdersByCategory: (writerId: string) => {
    pending: Order[];
    available: Order[];
    inProgress: Order[];
    uploadToClient: Order[];
    editorRevision: Order[];
    approved: Order[];
    payLater: Order[];
    completed: Order[];
    rejected: Order[];
    awaitingConfirmation: Order[];
    confirmed: Order[];
    awaitingPayment: Order[];
  };
  calculateOrderEarnings: (order: Order) => OrderEarnings;
  getWriterTotalEarnings: (writerId: string) => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      title: 'Research Paper on Climate Change Impact',
      description: 'Comprehensive analysis of climate change effects on coastal regions and marine ecosystems',
      subject: 'Environmental Science',
      discipline: 'Environmental Science',
      paperType: 'Research Paper',
      pages: 15,
      words: 3750,
      format: 'APA',
      price: 450,
      priceKES: 67500,
      cpp: 4500,
      deadline: '2024-02-15',
      status: 'Available',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-1',
          sender: 'client',
          message: 'Please include recent studies from 2023-2024 and focus on Pacific region',
          timestamp: '2024-01-15T10:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-1',
          filename: 'requirements.pdf',
          originalName: 'Research_Requirements.pdf',
          size: 2048576,
          type: 'application/pdf',
          url: '/files/requirements.pdf',
          uploadedAt: '2024-01-15T10:00:00Z'
        }
      ],
      additionalInstructions: 'Include at least 20 peer-reviewed sources and 3-4 graphs/charts'
    },
    {
      id: 'ORD-012',
      title: 'Business Strategy Analysis - Digital Marketing',
      description: 'Strategic analysis of digital marketing approaches for e-commerce businesses',
      subject: 'Business Strategy',
      discipline: 'Business',
      paperType: 'Business Plan',
      pages: 12,
      words: 3000,
      format: 'Harvard',
      price: 360,
      priceKES: 54000,
      cpp: 4500,
      deadline: '2024-03-01',
      status: 'Available',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on ROI analysis and customer acquisition strategies'
    },
    {
      id: 'ORD-013',
      title: 'Academic Essay - Modern Literature Analysis',
      description: 'Critical analysis of contemporary literature and its impact on society',
      subject: 'Literature',
      discipline: 'English Literature',
      paperType: 'Essay',
      pages: 8,
      words: 2000,
      format: 'MLA',
      price: 240,
      priceKES: 36000,
      cpp: 4500,
      deadline: '2024-02-28',
      status: 'Available',
      createdAt: '2024-01-23',
      updatedAt: '2024-01-23',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include analysis of at least 3 contemporary authors'
    },
    {
      id: 'ORD-014',
      title: 'Technical Report - Cybersecurity in Healthcare',
      description: 'Comprehensive report on cybersecurity challenges and solutions in healthcare sector',
      subject: 'Cybersecurity',
      discipline: 'Computer Science',
      paperType: 'Report',
      pages: 20,
      words: 5000,
      format: 'IEEE',
      price: 600,
      priceKES: 90000,
      cpp: 4500,
      deadline: '2024-03-10',
      status: 'Available',
      createdAt: '2024-01-24',
      updatedAt: '2024-01-24',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include case studies and regulatory compliance requirements'
    },
    {
      id: 'ORD-002',
      title: 'Marketing Analysis Report for Tech Startup',
      description: 'Market research and competitive analysis for emerging tech company in AI space',
      subject: 'Business Marketing',
      discipline: 'Business',
      paperType: 'Marketing Analysis',
      pages: 8,
      words: 2000,
      format: 'Harvard',
      price: 280,
      priceKES: 42000,
      cpp: 5250,
      deadline: '2024-02-10',
      status: 'Pending Review',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
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
      deadline: '2024-02-20',
      status: 'In Progress',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
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
      deadline: '2024-02-05',
      status: 'Upload to Client',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
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
          filename: 'api_spec.json',
          originalName: 'API_Specification.json',
          size: 512000,
          type: 'application/json',
          url: '/files/api_spec.json',
          uploadedAt: '2024-01-18T11:00:00Z'
        }
      ],
      additionalInstructions: 'Include authentication examples and error handling'
    },
    {
      id: 'ORD-005',
      title: 'Business Plan for Sustainable Energy Startup',
      description: 'Comprehensive business plan for renewable energy company focusing on solar solutions',
      subject: 'Business',
      discipline: 'Business',
      paperType: 'Business Plan',
      pages: 20,
      words: 5000,
      format: 'Chicago',
      price: 600,
      priceKES: 90000,
      cpp: 4500,
      deadline: '2024-01-30',
      status: 'Completed',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-5',
          sender: 'client',
          message: 'Excellent work! The financial projections are very detailed.',
          timestamp: '2024-01-25T16:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-4',
          filename: 'business_plan.pdf',
          originalName: 'Business_Plan.pdf',
          size: 3145728,
          type: 'application/pdf',
          url: '/files/business_plan.pdf',
          uploadedAt: '2024-01-25T16:00:00Z'
        }
      ],
      additionalInstructions: 'Include 5-year financial projections and market analysis'
    },
    {
      id: 'ORD-006',
      title: 'Academic Essay on Shakespearean Literature',
      description: 'Critical analysis of themes in Hamlet and Macbeth with modern interpretations',
      subject: 'Literature',
      discipline: 'English Literature',
      paperType: 'Essay',
      pages: 6,
      words: 1500,
      format: 'MLA',
      price: 180,
      priceKES: 27000,
      cpp: 4500,
      deadline: '2024-01-28',
      status: 'Completed',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-6',
          sender: 'client',
          message: 'Great analysis of the themes!',
          timestamp: '2024-01-25T14:00:00Z'
        }
      ],
      uploadedFiles: [],
      additionalInstructions: 'Focus on character development and tragic elements'
    },
    {
      id: 'ORD-007',
      title: 'Data Analysis Report - E-commerce Trends',
      description: 'Statistical analysis of online shopping patterns during holiday seasons',
      subject: 'Data Science',
      discipline: 'Statistics',
      paperType: 'Report',
      pages: 10,
      words: 2500,
      format: 'APA',
      price: 320,
      priceKES: 48000,
      cpp: 4800,
      deadline: '2024-02-01',
      status: 'Editor Revision',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-20',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-7',
          sender: 'client',
          message: 'Need this for our marketing team presentation',
          timestamp: '2024-01-18T09:00:00Z'
        }
      ],
      uploadedFiles: [
        {
          id: 'file-5',
          filename: 'sales_data.csv',
          originalName: 'Sales_Data_2023.csv',
          size: 1048576,
          type: 'text/csv',
          url: '/files/sales_data.csv',
          uploadedAt: '2024-01-18T09:00:00Z'
        }
      ],
      additionalInstructions: 'Include visualizations and statistical significance tests'
    },
    {
      id: 'ORD-008',
      title: 'Philosophy Essay - Ethics in Technology',
      description: 'Examination of ethical implications of artificial intelligence in modern society',
      subject: 'Philosophy',
      discipline: 'Philosophy',
      paperType: 'Essay',
      pages: 8,
      words: 2000,
      format: 'Chicago',
      price: 240,
      priceKES: 36000,
      cpp: 4500,
      deadline: '2024-02-10',
      status: 'Approved',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-8',
          sender: 'client',
          message: 'Please address both utilitarian and deontological perspectives',
          timestamp: '2024-01-20T11:00:00Z'
        }
      ],
      uploadedFiles: [],
      additionalInstructions: 'Include contemporary examples and case studies'
    },
    // POD Orders (Pay on Delivery)
    {
      id: 'ORD-009',
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
      status: 'POD Available',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'pod',
      isPOD: true,
      podAmount: 63000,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Focus on customer experience improvements and operational efficiency'
    },
    {
      id: 'ORD-010',
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
      status: 'POD Available',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      isOverdue: false,
      confirmationStatus: 'pending',
      paymentType: 'pod',
      isPOD: true,
      podAmount: 180000,
      clientMessages: [],
      uploadedFiles: [],
      additionalInstructions: 'Include ethical considerations and real-world case studies'
    },
    // More assigned orders for testing
    {
      id: 'ORD-011',
      title: 'Research Paper - Renewable Energy Sources',
      description: 'Comprehensive analysis of solar, wind, and hydroelectric energy sources',
      subject: 'Energy Studies',
      discipline: 'Engineering',
      paperType: 'Research Paper',
      pages: 18,
      words: 4500,
      format: 'IEEE',
      price: 540,
      priceKES: 81000,
      cpp: 4500,
      deadline: '2024-02-28',
      status: 'Rejected',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-21',
      updatedAt: '2024-01-22',
      isOverdue: false,
      confirmationStatus: 'confirmed',
      paymentType: 'advance',
      isPOD: false,
      clientMessages: [
        {
          id: 'msg-9',
          sender: 'client',
          message: 'The analysis was not comprehensive enough for our requirements',
          timestamp: '2024-01-22T10:00:00Z'
        }
      ],
      uploadedFiles: [],
      additionalInstructions: 'Include detailed cost-benefit analysis and environmental impact assessment'
    }
  ]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOverdue: new Date(order.deadline) < new Date()
    };
    setOrders(prev => [...prev, newOrder]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ));
  }, []);

  const assignOrderToWriter = useCallback((orderId: string, writerId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, writerId, status: 'In Progress', updatedAt: new Date().toISOString() }
        : order
    ));
  }, []);

  const pickOrder = useCallback((orderId: string, writerId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, writerId, status: 'In Progress', updatedAt: new Date().toISOString() }
        : order
    ));
  }, []);

  const handleOrderAction = useCallback((action: string, orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      let newStatus = order.status;
      const updatedAt = new Date().toISOString();
      
      switch (action) {
        case 'pick':
          newStatus = 'Awaiting Confirmation';
          break;
        case 'confirm':
          newStatus = 'Confirmed';
          break;
        case 'submit':
          newStatus = 'Pending Review';
          break;
        case 'approve':
          newStatus = 'In Progress';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        case 'request_approval':
          newStatus = 'Requires Admin Approval';
          break;
        case 'assign':
          newStatus = 'In Progress';
          break;
        case 'reassign':
          newStatus = 'Available';
          break;
        case 'upload_to_client':
          newStatus = 'Upload to Client';
          break;
        case 'editor_revision':
          newStatus = 'Editor Revision';
          break;
        case 'approve_final':
          newStatus = 'Approved';
          break;
        case 'pay_later':
          newStatus = 'Pay Later';
          break;
      }
      
      return { ...order, status: newStatus, updatedAt };
    }));
  }, []);

  const confirmOrder = useCallback((orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'Awaiting Payment',
        confirmation: confirmation,
        questions: questions,
        updatedAt: new Date().toISOString()
      };
    }));
  }, []);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get available orders (excluding POD orders and assigned orders)
  const getAvailableOrders = useCallback(() => {
    return orders.filter(order => 
      order.status === 'Available' && 
      !order.isPOD && 
      !order.writerId && 
      !order.assignedWriter
    );
  }, [orders]);

  // Get POD orders separately
  const getPODOrders = useCallback(() => {
    return orders.filter(order => 
      order.status === 'POD Available' || order.isPOD
    );
  }, [orders]);

  const getWriterActiveOrders = useCallback((writerId: string) => {
    return orders.filter(order => 
      order.writerId === writerId && 
      ['In Progress', 'Pending Review', 'Upload to Client', 'Editor Revision', 'Approved', 'Pay Later', 'Awaiting Payment'].includes(order.status) &&
      !order.isPOD // Exclude POD orders from active orders
    );
  }, [orders]);

  const getWriterOrderStats = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => 
      order.writerId === writerId && !order.isPOD // Exclude POD orders from stats
    );
    
    return {
      total: writerOrders.length,
      pending: writerOrders.filter(o => o.status === 'Pending Review').length,
      available: writerOrders.filter(o => o.status === 'Available').length,
      inProgress: writerOrders.filter(o => o.status === 'In Progress').length,
      uploadToClient: writerOrders.filter(o => o.status === 'Upload to Client').length,
      editorRevision: writerOrders.filter(o => o.status === 'Editor Revision').length,
      approved: writerOrders.filter(o => o.status === 'Approved').length,
      payLater: writerOrders.filter(o => o.status === 'Pay Later').length,
      completed: writerOrders.filter(o => o.status === 'Completed').length,
      rejected: writerOrders.filter(o => o.status === 'Rejected').length,
      awaitingConfirmation: writerOrders.filter(o => o.status === 'Awaiting Confirmation').length,
      confirmed: writerOrders.filter(o => o.status === 'Confirmed').length,
      awaitingPayment: writerOrders.filter(o => o.status === 'Awaiting Payment').length,
    };
  }, [orders]);

  const getWriterOrdersByCategory = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => 
      order.writerId === writerId && !order.isPOD // Exclude POD orders
    );
    
    return {
      pending: writerOrders.filter(o => o.status === 'Pending Review'),
      available: writerOrders.filter(o => o.status === 'Available'),
      inProgress: writerOrders.filter(o => o.status === 'In Progress'),
      uploadToClient: writerOrders.filter(o => o.status === 'Upload to Client'),
      editorRevision: writerOrders.filter(o => o.status === 'Editor Revision'),
      approved: writerOrders.filter(o => o.status === 'Approved'),
      payLater: writerOrders.filter(o => o.status === 'Pay Later'),
      completed: writerOrders.filter(o => o.status === 'Completed'),
      rejected: writerOrders.filter(o => o.status === 'Rejected'),
      awaitingConfirmation: writerOrders.filter(o => o.status === 'Awaiting Confirmation'),
      confirmed: writerOrders.filter(o => o.status === 'Confirmed'),
      awaitingPayment: writerOrders.filter(o => o.status === 'Awaiting Payment'),
    };
  }, [orders]);

  // Calculate earnings only from non-POD orders
  const calculateOrderEarnings = useCallback((order: Order): OrderEarnings => {
    // POD orders don't count towards writer earnings
    if (order.isPOD) {
      return {
        baseAmount: 0,
        cppAmount: 0,
        totalAmount: 0,
        currency: 'KES',
        calculatedAt: new Date().toISOString()
      };
    }

    const baseAmount = order.priceKES || (order.price * 150); // Convert USD to KES if needed
    const cppAmount = order.cpp || (baseAmount / order.pages);
    const totalAmount = baseAmount;
    
    return {
      baseAmount,
      cppAmount,
      totalAmount,
      currency: 'KES',
      calculatedAt: new Date().toISOString()
    };
  }, []);

  // Get total writer earnings (excluding POD orders)
  const getWriterTotalEarnings = useCallback((writerId: string) => {
    const writerOrders = orders.filter(order => 
      order.writerId === writerId && 
      !order.isPOD && 
      ['Completed', 'Approved', 'Awaiting Payment'].includes(order.status)
    );
    
    return writerOrders.reduce((total, order) => {
      return total + (order.priceKES || 0);
    }, 0);
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      assignOrderToWriter,
      pickOrder,
      handleOrderAction,
      confirmOrder,
      getOrdersByStatus,
      getAvailableOrders,
      getPODOrders,
      getWriterActiveOrders,
      getWriterOrderStats,
      getWriterOrdersByCategory,
      calculateOrderEarnings,
      getWriterTotalEarnings
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
