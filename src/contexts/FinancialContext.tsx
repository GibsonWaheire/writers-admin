import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOrders } from './OrderContext';
import type { Invoice, Fine, Payment, FinancialSummary, WriterFinancials, ClientPayment } from '../types/financial';
import type { Order } from '../types/order';

interface FinancialContextType {
  invoices: Invoice[];
  fines: Fine[];
  payments: Payment[];
  clientPayments: ClientPayment[];
  financialSummary: FinancialSummary;
  createInvoice: (order: Order) => Invoice;
  approveInvoice: (invoiceId: string, approvedBy: string) => void;
  processPayment: (paymentData: Partial<Payment>) => Payment;
  applyFine: (fineData: Partial<Fine>) => Fine;
  waiveFine: (fineId: string, waivedBy: string, reason: string) => void;
  getWriterFinancials: (writerId: string) => WriterFinancials;
  getInvoicesByWriter: (writerId: string) => Invoice[];
  getFinesByWriter: (writerId: string) => Fine[];
  getPaymentsByWriter: (writerId: string) => Payment[];
  calculateOrderPayment: (order: Order) => number;
  syncWithOrders: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { orders } = useOrders();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);

  // Auto-sync with completed orders
  const syncWithOrders = useCallback(() => {
    const completedOrders = orders.filter(order => 
      order.status === 'Completed' && 
      order.writerId && 
      order.completedAt
    );

    completedOrders.forEach(order => {
      // Check if invoice already exists
      const existingInvoice = invoices.find(inv => inv.orderId === order.id);
      if (!existingInvoice) {
        createInvoice(order);
      }

      // Create client payment record
      const existingClientPayment = clientPayments.find(cp => cp.orderId === order.id);
      if (!existingClientPayment) {
        const clientPayment: ClientPayment = {
          id: `CP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          orderId: order.id,
          orderTitle: order.title,
          clientId: 'client-1', // Mock client ID
          clientName: 'Client', // Mock client name
          amount: order.priceKES || (order.pages * 350),
          currency: 'KES',
          status: 'received',
          receivedAt: order.completedAt,
          method: 'credit_card',
          reference: `PAY-${order.id}`
        };
        setClientPayments(prev => [...prev, clientPayment]);
      }
    });
  }, [orders, invoices, clientPayments]);

  useEffect(() => {
    syncWithOrders();
  }, [syncWithOrders]);

  const calculateOrderPayment = useCallback((order: Order): number => {
    return order.pages * 350; // 350 KES per page
  }, []);

  const createInvoice = useCallback((order: Order): Invoice => {
    const amount = calculateOrderPayment(order);
    const invoice: Invoice = {
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      orderTitle: order.title,
      writerId: order.writerId!,
      writerName: order.assignedWriter!,
      amount,
      currency: 'KES',
      status: 'pending',
      type: 'order_completion',
      createdAt: new Date().toISOString(),
      orderPages: order.pages,
      orderDeadline: order.deadline,
      orderCompletedAt: order.completedAt || new Date().toISOString()
    };

    setInvoices(prev => [invoice, ...prev]);
    return invoice;
  }, [calculateOrderPayment]);

  const approveInvoice = useCallback((invoiceId: string, approvedBy: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy 
          }
        : invoice
    ));

    // Auto-create payment when invoice is approved
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const payment: Payment = {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        writerId: invoice.writerId,
        writerName: invoice.writerName,
        amount: invoice.amount,
        currency: 'KES',
        type: 'order_payment',
        status: 'pending',
        method: 'bank_transfer',
        createdAt: new Date().toISOString(),
        relatedOrderId: invoice.orderId,
        relatedInvoiceId: invoice.id
      };
      setPayments(prev => [payment, ...prev]);
    }
  }, [invoices]);

  const processPayment = useCallback((paymentData: Partial<Payment>): Payment => {
    const payment: Payment = {
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      writerId: paymentData.writerId || '',
      writerName: paymentData.writerName || '',
      amount: paymentData.amount || 0,
      currency: 'KES',
      type: paymentData.type || 'order_payment',
      status: 'pending',
      method: paymentData.method || 'bank_transfer',
      createdAt: new Date().toISOString(),
      ...paymentData
    };

    setPayments(prev => [payment, ...prev]);
    return payment;
  }, []);

  const applyFine = useCallback((fineData: Partial<Fine>): Fine => {
    const fine: Fine = {
      id: `FINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      writerId: fineData.writerId || '',
      writerName: fineData.writerName || '',
      amount: fineData.amount || 0,
      currency: 'KES',
      reason: fineData.reason || '',
      type: fineData.type || 'other',
      status: 'applied',
      appliedAt: new Date().toISOString(),
      appliedBy: fineData.appliedBy || 'admin',
      ...fineData
    };

    setFines(prev => [fine, ...prev]);
    return fine;
  }, []);

  const waiveFine = useCallback((fineId: string, waivedBy: string, reason: string) => {
    setFines(prev => prev.map(fine => 
      fine.id === fineId 
        ? { 
            ...fine, 
            status: 'waived',
            waivedAt: new Date().toISOString(),
            waivedBy,
            waivedReason: reason
          }
        : fine
    ));
  }, []);

  const getInvoicesByWriter = useCallback((writerId: string) => {
    return invoices.filter(invoice => invoice.writerId === writerId);
  }, [invoices]);

  const getFinesByWriter = useCallback((writerId: string) => {
    return fines.filter(fine => fine.writerId === writerId);
  }, [fines]);

  const getPaymentsByWriter = useCallback((writerId: string) => {
    return payments.filter(payment => payment.writerId === writerId);
  }, [payments]);

  const getWriterFinancials = useCallback((writerId: string): WriterFinancials => {
    const writerInvoices = getInvoicesByWriter(writerId);
    const writerFines = getFinesByWriter(writerId);
    const writerPayments = getPaymentsByWriter(writerId);

    const totalEarned = writerInvoices
      .filter(inv => ['approved', 'paid'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPaid = writerPayments
      .filter(pay => pay.status === 'completed')
      .reduce((sum, pay) => sum + pay.amount, 0);

    const pendingPayments = writerPayments
      .filter(pay => ['pending', 'processing'].includes(pay.status))
      .reduce((sum, pay) => sum + pay.amount, 0);

    const totalFines = writerFines
      .filter(fine => fine.status === 'applied')
      .reduce((sum, fine) => sum + fine.amount, 0);

    const currentBalance = totalEarned - totalPaid - totalFines;

    const writerOrders = orders.filter(order => order.writerId === writerId);
    const completedOrders = writerOrders.filter(order => 
      ['Completed', 'Approved'].includes(order.status)
    ).length;

    const onTimeOrders = writerOrders.filter(order => {
      if (!order.completedAt) return false;
      const deadline = new Date(order.deadline);
      const completed = new Date(order.completedAt);
      return completed <= deadline;
    }).length;

    const onTimeDeliveryRate = completedOrders > 0 ? (onTimeOrders / completedOrders) * 100 : 100;

    const averageOrderValue = completedOrders > 0 ? totalEarned / completedOrders : 0;

    return {
      writerId,
      writerName: writerOrders[0]?.assignedWriter || 'Unknown Writer',
      totalEarned,
      totalPaid,
      pendingPayments,
      totalFines,
      currentBalance,
      averageOrderValue,
      completedOrders,
      onTimeDeliveryRate,
      recentInvoices: writerInvoices.slice(0, 5),
      recentPayments: writerPayments.slice(0, 5),
      recentFines: writerFines.slice(0, 5)
    };
  }, [getInvoicesByWriter, getFinesByWriter, getPaymentsByWriter, orders]);

  const calculateFinancialSummary = useCallback((): FinancialSummary => {
    const totalRevenue = clientPayments
      .filter(cp => cp.status === 'received')
      .reduce((sum, cp) => sum + cp.amount, 0);

    const totalWriterPayments = payments
      .filter(pay => pay.status === 'completed')
      .reduce((sum, pay) => sum + pay.amount, 0);

    const totalProfit = totalRevenue - totalWriterPayments;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = clientPayments
      .filter(cp => {
        if (!cp.receivedAt) return false;
        const date = new Date(cp.receivedAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, cp) => sum + cp.amount, 0);

    const monthlyWriterPayments = payments
      .filter(pay => {
        if (!pay.completedAt) return false;
        const date = new Date(pay.completedAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, pay) => sum + pay.amount, 0);

    const monthlyProfit = monthlyRevenue - monthlyWriterPayments;

    const pendingInvoices = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pendingPayments = payments
      .filter(pay => ['pending', 'processing'].includes(pay.status))
      .reduce((sum, pay) => sum + pay.amount, 0);

    const pendingFines = fines
      .filter(fine => fine.status === 'pending')
      .reduce((sum, fine) => sum + fine.amount, 0);

    const completedOrders = orders.filter(order => 
      ['Completed', 'Approved'].includes(order.status)
    );

    const averageOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0;

    const averageWriterPayment = payments.filter(pay => pay.status === 'completed').length > 0
      ? totalWriterPayments / payments.filter(pay => pay.status === 'completed').length
      : 0;

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalWriterPayments,
      totalProfit,
      monthlyRevenue,
      monthlyWriterPayments,
      monthlyProfit,
      pendingInvoices,
      pendingPayments,
      pendingFines,
      averageOrderValue,
      averageWriterPayment,
      profitMargin,
      completedPayments: payments.filter(pay => pay.status === 'completed').length,
      pendingApprovals: invoices.filter(inv => inv.status === 'pending').length,
      processingPayments: payments.filter(pay => pay.status === 'processing').length,
      recentInvoices: invoices.slice(0, 5),
      recentPayments: payments.slice(0, 5),
      recentFines: fines.slice(0, 5)
    };
  }, [invoices, payments, fines, clientPayments, orders]);

  const financialSummary = calculateFinancialSummary();

  return (
    <FinancialContext.Provider value={{
      invoices,
      fines,
      payments,
      clientPayments,
      financialSummary,
      createInvoice,
      approveInvoice,
      processPayment,
      applyFine,
      waiveFine,
      getWriterFinancials,
      getInvoicesByWriter,
      getFinesByWriter,
      getPaymentsByWriter,
      calculateOrderPayment,
      syncWithOrders
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
