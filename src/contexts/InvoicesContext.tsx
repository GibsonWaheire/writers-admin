import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOrders } from './OrderContext';
import { usePOD } from './PODContext';
// import { useWallet } from './WalletContext'; // Will be used for future wallet integration
import type { Invoice } from '../types/order';

export interface InvoiceData extends Invoice {
  orderType: 'regular' | 'pod';
  pages?: number;
  totalAmountKES: number;
  writerEarnings: number;
  platformFee: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'overdue';
  dueDate: string;
  lateFees?: number;
}

interface InvoicesContextType {
  invoices: InvoiceData[];
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  createInvoice: (orderId: string, orderType: 'regular' | 'pod', writerId: string, writerName: string) => void;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceData['paymentStatus']) => void;
  markInvoiceAsPaid: (invoiceId: string, paymentMethod: string, paidAt?: string) => void;
  getInvoicesByStatus: (status: InvoiceData['paymentStatus']) => InvoiceData[];
  getInvoicesByWriter: (writerId: string) => InvoiceData[];
  getInvoicesByOrder: (orderId: string) => InvoiceData[];
  calculateLateFees: (invoiceId: string) => number;
  exportInvoices: (format: 'csv' | 'pdf' | 'excel') => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const { orders } = useOrders();
  const { podOrders } = usePOD();
  // const { wallet } = useWallet(); // Will be used for future wallet integration

  // Generate invoices from orders and POD orders
  useEffect(() => {
    const newInvoices: InvoiceData[] = [];
    
    // Generate invoices for regular orders
    orders.forEach(order => {
      if (order.writerId && ['Completed', 'Admin Approved', 'Client Approved', 'Awaiting Payment'].includes(order.status)) {
        const totalAmountKES = order.totalPriceKES;
        const writerEarnings = order.pages * 350; // 350 KES per page
        const platformFee = totalAmountKES - writerEarnings;
        
        newInvoices.push({
          id: `INV-${order.id}`,
          orderId: order.id,
          orderTitle: order.title,
          writerId: order.writerId,
          writerName: order.assignedWriter || 'Unknown Writer',
          amount: totalAmountKES,
          status: order.status === 'Awaiting Payment' ? 'pending' : 'paid',
          createdAt: order.updatedAt,
          paidAt: order.status === 'Awaiting Payment' ? undefined : order.updatedAt,
          paymentMethod: order.status === 'Awaiting Payment' ? undefined : 'Platform Transfer',
          orderType: 'regular',
          pages: order.pages,
          totalAmountKES,
          writerEarnings,
          platformFee,
          paymentStatus: order.status === 'Awaiting Payment' ? 'pending' : 'paid',
          dueDate: order.deadline
        });
      }
    });

    // Generate invoices for POD orders
    podOrders.forEach(podOrder => {
      if (podOrder.writerId && podOrder.status === 'Payment Received') {
        const totalAmountKES = podOrder.podAmount;
        const writerEarnings = totalAmountKES * 0.8; // 80% to writer
        const platformFee = totalAmountKES * 0.2; // 20% platform fee
        
        newInvoices.push({
          id: `INV-POD-${podOrder.id}`,
          orderId: podOrder.id,
          orderTitle: podOrder.title,
          writerId: podOrder.writerId,
          writerName: podOrder.assignedWriter || 'Unknown Writer',
          amount: totalAmountKES,
          status: 'paid',
          createdAt: podOrder.createdAt,
          paidAt: podOrder.paymentReceivedAt || podOrder.updatedAt,
          paymentMethod: 'POD Payment',
          orderType: 'pod',
          totalAmountKES,
          writerEarnings,
          platformFee,
          paymentStatus: 'paid',
          dueDate: podOrder.deadline
        });
      } else if (podOrder.writerId && ['Delivered', 'Ready for Delivery'].includes(podOrder.status)) {
        const totalAmountKES = podOrder.podAmount;
        const writerEarnings = totalAmountKES * 0.8;
        const platformFee = totalAmountKES * 0.2;
        
        newInvoices.push({
          id: `INV-POD-${podOrder.id}`,
          orderId: podOrder.id,
          orderTitle: podOrder.title,
          writerId: podOrder.writerId,
          writerName: podOrder.assignedWriter || 'Unknown Writer',
          amount: totalAmountKES,
          status: 'pending',
          createdAt: podOrder.updatedAt,
          orderType: 'pod',
          totalAmountKES,
          writerEarnings,
          platformFee,
          paymentStatus: 'pending',
          dueDate: podOrder.deadline
        });
      }
    });

    setInvoices(newInvoices);
  }, [orders, podOrders]);

  const createInvoice = useCallback((orderId: string, orderType: 'regular' | 'pod', writerId: string, writerName: string) => {
    // This would be used for manual invoice creation
    const newInvoice: InvoiceData = {
      id: `INV-MANUAL-${Date.now()}`,
      orderId,
      orderTitle: 'Manual Invoice',
      writerId,
      writerName,
      amount: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderType,
      totalAmountKES: 0,
      writerEarnings: 0,
      platformFee: 0,
      paymentStatus: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    setInvoices(prev => [newInvoice, ...prev]);
  }, []);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: InvoiceData['paymentStatus']) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId ? { ...inv, paymentStatus: status } : inv
      )
    );
  }, []);

  const markInvoiceAsPaid = useCallback((invoiceId: string, paymentMethod: string, paidAt?: string) => {
    const paidDate = paidAt || new Date().toISOString();
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId ? { 
          ...inv, 
          status: 'paid', 
          paymentStatus: 'paid',
          paidAt: paidDate,
          paymentMethod 
        } : inv
      )
    );
  }, []);

  const getInvoicesByStatus = useCallback((status: InvoiceData['paymentStatus']) => {
    return invoices.filter(inv => inv.paymentStatus === status);
  }, [invoices]);

  const getInvoicesByWriter = useCallback((writerId: string) => {
    return invoices.filter(inv => inv.writerId === writerId);
  }, [invoices]);

  const getInvoicesByOrder = useCallback((orderId: string) => {
    return invoices.filter(inv => inv.orderId === orderId);
  }, [invoices]);

  const calculateLateFees = useCallback((invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice || invoice.paymentStatus === 'paid') return 0;

    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLate <= 0) return 0;
    
    // 5% late fee per week, capped at 25%
    const weeklyFee = 0.05;
    const maxFee = 0.25;
    const fee = Math.min(daysLate / 7 * weeklyFee, maxFee);
    
    return invoice.totalAmountKES * fee;
  }, [invoices]);

  const exportInvoices = useCallback((format: 'csv' | 'pdf' | 'excel') => {
    // Implementation for exporting invoices
    console.log(`Exporting invoices in ${format} format`);
  }, []);

  // Calculate totals
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmountKES, 0);
  const paidAmount = invoices.filter(inv => inv.paymentStatus === 'paid').reduce((sum, inv) => sum + inv.totalAmountKES, 0);
  const pendingAmount = invoices.filter(inv => inv.paymentStatus === 'pending').reduce((sum, inv) => sum + inv.totalAmountKES, 0);
  const overdueAmount = invoices.filter(inv => {
    const dueDate = new Date(inv.dueDate);
    const now = new Date();
    return inv.paymentStatus === 'pending' && dueDate < now;
  }).reduce((sum, inv) => sum + inv.totalAmountKES, 0);

  return (
    <InvoicesContext.Provider value={{
      invoices,
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      createInvoice,
      updateInvoiceStatus,
      markInvoiceAsPaid,
      getInvoicesByStatus,
      getInvoicesByWriter,
      getInvoicesByOrder,
      calculateLateFees,
      exportInvoices
    }}>
      {children}
    </InvoicesContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
}
