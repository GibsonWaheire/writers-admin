import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOrders } from './OrderContext';
import { usePOD } from './PODContext';
// import type { ClientMessage } from '../types/order'; // Will be used for future type integration

export interface Message {
  id: string;
  orderId: string;
  orderType: 'regular' | 'pod';
  orderTitle: string;
  sender: 'client' | 'writer' | 'admin';
  recipient: 'client' | 'writer' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface MessagesContextType {
  messages: Message[];
  unreadCount: number;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead' | 'status'>) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  getMessagesByOrder: (orderId: string, orderType: 'regular' | 'pod') => Message[];
  getUnreadMessages: () => Message[];
  getMessagesBySender: (sender: 'client' | 'writer' | 'admin') => Message[];
  getMessagesByRecipient: (recipient: 'client' | 'writer' | 'admin') => Message[];
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { orders } = useOrders();
  const { podOrders } = usePOD();

  // Sync messages from orders and POD orders
  useEffect(() => {
    const newMessages: Message[] = [];
    
    // Extract messages from regular orders
    orders.forEach(order => {
      order.clientMessages.forEach(msg => {
        newMessages.push({
          id: `MSG-${order.id}-${msg.id}`,
          orderId: order.id,
          orderType: 'regular',
          orderTitle: order.title,
          sender: msg.sender,
          recipient: msg.sender === 'client' ? 'writer' : 'client',
          message: msg.message,
          timestamp: msg.timestamp,
          attachments: msg.attachments,
          isRead: false,
          status: 'sent'
        });
      });
    });

    // Extract messages from POD orders
    podOrders.forEach(podOrder => {
      if (podOrder.clientMessages) {
        podOrder.clientMessages.forEach(msg => {
          newMessages.push({
            id: `MSG-POD-${podOrder.id}-${msg.id}`,
            orderId: podOrder.id,
            orderType: 'pod',
            orderTitle: podOrder.title,
            sender: msg.sender,
            recipient: msg.sender === 'client' ? 'writer' : 'client',
            message: msg.message,
            timestamp: msg.timestamp,
            attachments: msg.attachments,
            isRead: false,
            status: 'sent'
          });
        });
      }
    });

    setMessages(newMessages);
  }, [orders, podOrders]);

  const sendMessage = useCallback((messageData: Omit<Message, 'id' | 'timestamp' | 'isRead' | 'status'>) => {
    const newMessage: Message = {
      ...messageData,
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sent'
    };

    setMessages(prev => [newMessage, ...prev]);
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true, status: 'read' } : msg
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages(prev => 
      prev.map(msg => ({ ...msg, isRead: true, status: 'read' }))
    );
  }, []);

  const getMessagesByOrder = useCallback((orderId: string, orderType: 'regular' | 'pod') => {
    return messages.filter(msg => msg.orderId === orderId && msg.orderType === orderType);
  }, [messages]);

  const getUnreadMessages = useCallback(() => {
    return messages.filter(msg => !msg.isRead);
  }, [messages]);

  const getMessagesBySender = useCallback((sender: 'client' | 'writer' | 'admin') => {
    return messages.filter(msg => msg.sender === sender);
  }, [messages]);

  const getMessagesByRecipient = useCallback((recipient: 'client' | 'writer' | 'admin') => {
    return messages.filter(msg => msg.recipient === recipient);
  }, [messages]);

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <MessagesContext.Provider value={{
      messages,
      unreadCount,
      sendMessage,
      markAsRead,
      markAllAsRead,
      getMessagesByOrder,
      getUnreadMessages,
      getMessagesBySender,
      getMessagesByRecipient
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
