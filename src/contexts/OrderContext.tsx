import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Order, OrderStatus } from '../types/order';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrderToWriter: (orderId: string, writerId: string) => void;
  pickOrder: (orderId: string, writerId: string) => void;
  handleOrderAction: (action: string, orderId: string, notes?: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getWriterActiveOrders: (writerId: string) => Order[];
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
      deadline: '2024-02-15',
      status: 'Available',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      isOverdue: false,
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
      deadline: '2024-02-10',
      status: 'In Progress',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16',
      isOverdue: false,
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
      deadline: '2024-02-20',
      status: 'Available',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
      isOverdue: false,
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
      deadline: '2024-02-05',
      status: 'Pending Approval',
      assignedWriter: 'Jane Smith',
      writerId: 'writer-2',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
      isOverdue: false,
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
      deadline: '2024-01-30',
      status: 'Completed',
      assignedWriter: 'Mike Johnson',
      writerId: 'writer-3',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      isOverdue: false,
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
          originalName: 'Business_Plan_Final.pdf',
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
      deadline: '2024-01-28',
      status: 'Completed',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      isOverdue: false,
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
      deadline: '2024-02-01',
      status: 'In Progress',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-20',
      isOverdue: false,
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
      deadline: '2024-02-10',
      status: 'Pending Review',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      isOverdue: false,
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

  const handleOrderAction = useCallback((action: string, orderId: string, _notes?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      let newStatus = order.status;
      let updatedAt = new Date().toISOString();
      
      switch (action) {
        case 'pick':
          newStatus = 'In Progress';
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
      }
      
      return { ...order, status: newStatus, updatedAt };
    }));
  }, []);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getWriterActiveOrders = useCallback((writerId: string) => {
    return orders.filter(order => 
      order.writerId === writerId && 
      ['In Progress', 'Pending Review'].includes(order.status)
    );
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      assignOrderToWriter,
      pickOrder,
      handleOrderAction,
      getOrdersByStatus,
      getWriterActiveOrders
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
