import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Order, OrderStatus } from '../types/order';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrderToWriter: (orderId: string, writerId: string) => void;
  pickOrder: (orderId: string, writerId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      title: 'Research Paper on Climate Change',
      description: 'Comprehensive research paper analyzing the impact of climate change on global ecosystems',
      subject: 'Environmental Science',
      pages: 15,
      price: 180,
      deadline: '2024-01-25',
      status: 'Available',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'ORD-002',
      title: 'Marketing Analysis Report',
      description: 'Detailed analysis of current marketing trends and strategies',
      subject: 'Business Marketing',
      pages: 8,
      price: 120,
      deadline: '2024-01-28',
      status: 'In Progress',
      assignedWriter: 'John Doe',
      writerId: 'writer-1',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: 'ORD-003',
      title: 'Literature Review - Psychology',
      description: 'Comprehensive literature review on cognitive behavioral therapy',
      subject: 'Psychology',
      pages: 12,
      price: 150,
      deadline: '2024-01-30',
      status: 'Available',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    }
  ]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      assignOrderToWriter,
      pickOrder
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
