import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOrders } from './OrderContext';
import type { 
  Invoice, 
  Fine, 
  Payment, 
  FinancialSummary, 
  WriterFinancials, 
  ClientPayment,
  PlatformFunds,
  WithdrawalRequest,
  PlatformBalance,
  TransactionLog 
} from '../types/financial';
import type { Order } from '../types/order';

interface FinancialContextType {
  invoices: Invoice[];
  fines: Fine[];
  payments: Payment[];
  clientPayments: ClientPayment[];
  platformFunds: PlatformFunds[];
  withdrawalRequests: WithdrawalRequest[];
  transactionLogs: TransactionLog[];
  platformBalance: PlatformBalance;
  financialSummary: FinancialSummary;
  createInvoice: (order: Order) => Invoice;
  createManualInvoice: (invoiceData: { writerId: string; writerName: string; amount: number; description: string; type?: 'order_completion' | 'bonus' | 'correction' }) => Invoice;
  approveInvoice: (invoiceId: string, approvedBy: string) => void;
  processPayment: (paymentData: Partial<Payment>) => Payment;
  applyFine: (fineData: Partial<Fine>) => Fine;
  waiveFine: (fineId: string, waivedBy: string, reason: string) => void;
  addPlatformFunds: (fundsData: { amount: number; source: string; reference?: string; notes?: string }) => PlatformFunds;
  approveWithdrawal: (withdrawalId: string, approvedBy: string) => void;
  rejectWithdrawal: (withdrawalId: string, rejectedBy: string, reason: string) => void;
  markWithdrawalPaid: (withdrawalId: string, paidBy: string, paymentReference: string) => void;
  createWithdrawalRequest: (requestData: Partial<WithdrawalRequest>) => WithdrawalRequest;
  getWriterFinancials: (writerId: string) => WriterFinancials;
  getInvoicesByWriter: (writerId: string) => Invoice[];
  getFinesByWriter: (writerId: string) => Fine[];
  getPaymentsByWriter: (writerId: string) => Payment[];
  getWithdrawalsByWriter: (writerId: string) => WithdrawalRequest[];
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
  const [platformFunds, setPlatformFunds] = useState<PlatformFunds[]>([
    {
      id: 'FUND-001',
      amount: 500000,
      currency: 'KES',
      source: 'bank_transfer',
      addedBy: 'admin-1',
      addedAt: '2024-01-01T00:00:00Z',
      reference: 'BANK-REF-001',
      notes: 'Initial platform funding',
      status: 'confirmed'
    }
  ]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([
    {
      id: 'WD-001',
      writerId: 'writer-1',
      writerName: 'John Doe',
      amount: 15000,
      currency: 'KES',
      requestedAt: '2024-01-25T10:00:00Z',
      status: 'pending',
      method: 'mobile_money',
      accountDetails: {
        mobileNumber: '+254712345678'
      },
      notes: 'First withdrawal request'
    },
    {
      id: 'WD-002',
      writerId: 'writer-2',
      writerName: 'Jane Smith',
      amount: 25000,
      currency: 'KES',
      requestedAt: '2024-01-24T14:30:00Z',
      status: 'approved',
      method: 'bank_transfer',
      accountDetails: {
        bankName: 'KCB Bank',
        accountNumber: '1234567890'
      },
      approvedBy: 'admin-1',
      approvedAt: '2024-01-25T09:00:00Z',
      notes: 'Approved for payment'
    }
  ]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);

  // Calculate platform balance
  const calculatePlatformBalance = useCallback((): PlatformBalance => {
    const totalFunds = platformFunds
      .filter(fund => fund.status === 'confirmed')
      .reduce((sum, fund) => sum + fund.amount, 0);

    const pendingWithdrawals = withdrawalRequests
      .filter(req => ['pending', 'approved'].includes(req.status))
      .reduce((sum, req) => sum + req.amount, 0);

    const totalWithdrawn = withdrawalRequests
      .filter(req => req.status === 'paid')
      .reduce((sum, req) => sum + req.amount, 0);

    const reservedFunds = pendingWithdrawals;
    const availableFunds = totalFunds - totalWithdrawn - reservedFunds;

    return {
      totalFunds,
      availableFunds: Math.max(0, availableFunds),
      pendingWithdrawals,
      reservedFunds,
      totalWithdrawn,
      lastUpdated: new Date().toISOString()
    };
  }, [platformFunds, withdrawalRequests]);

  const platformBalance = calculatePlatformBalance();

  // Log transaction
  const logTransaction = useCallback((
    type: TransactionLog['type'],
    amount: number,
    description: string,
    performedBy: string,
    relatedEntityId?: string
  ) => {
    const balanceBefore = platformBalance.availableFunds;
    const balanceAfter = type === 'fund_added' ? balanceBefore + amount : balanceBefore - amount;

    const log: TransactionLog = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      currency: 'KES',
      description,
      performedBy,
      performedAt: new Date().toISOString(),
      relatedEntityId,
      balanceBefore,
      balanceAfter
    };

    setTransactionLogs(prev => [log, ...prev]);
  }, [platformBalance.availableFunds]);

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
    const existingPayment = payments.find(p => p.id === paymentData.id);
    
    if (existingPayment) {
      // Update existing payment
      const updatedPayment = { ...existingPayment, ...paymentData };
      setPayments(prev => prev.map(p => p.id === paymentData.id ? updatedPayment : p));
      return updatedPayment;
    } else {
      // Create new payment
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
    }
  }, [payments]);

  const createManualInvoice = useCallback((invoiceData: {
    writerId: string;
    writerName: string;
    amount: number;
    description: string;
    type?: 'order_completion' | 'bonus' | 'correction';
  }): Invoice => {
    const invoice: Invoice = {
      id: `INV-MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: 'MANUAL',
      orderTitle: invoiceData.description,
      writerId: invoiceData.writerId,
      writerName: invoiceData.writerName,
      amount: invoiceData.amount,
      currency: 'KES',
      status: 'pending',
      type: invoiceData.type || 'bonus',
      createdAt: new Date().toISOString(),
      orderPages: 0,
      orderDeadline: new Date().toISOString(),
      orderCompletedAt: new Date().toISOString(),
      notes: 'Manual invoice created by admin'
    };

    setInvoices(prev => [invoice, ...prev]);
    return invoice;
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
    logTransaction('fine_applied', fine.amount, `Fine applied: ${fine.reason}`, fine.appliedBy, fine.id);
    return fine;
  }, [logTransaction]);

  // Add platform funds
  const addPlatformFunds = useCallback((fundsData: { 
    amount: number; 
    source: string; 
    reference?: string; 
    notes?: string 
  }): PlatformFunds => {
    const funds: PlatformFunds = {
      id: `FUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: fundsData.amount,
      currency: 'KES',
      source: fundsData.source as PlatformFunds['source'],
      addedBy: 'admin-1',
      addedAt: new Date().toISOString(),
      reference: fundsData.reference,
      notes: fundsData.notes,
      status: 'confirmed'
    };

    setPlatformFunds(prev => [funds, ...prev]);
    logTransaction('fund_added', funds.amount, `Funds added from ${funds.source}`, funds.addedBy, funds.id);
    return funds;
  }, [logTransaction]);

  // Create withdrawal request
  const createWithdrawalRequest = useCallback((requestData: Partial<WithdrawalRequest>): WithdrawalRequest => {
    const request: WithdrawalRequest = {
      id: `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      writerId: requestData.writerId || '',
      writerName: requestData.writerName || '',
      amount: requestData.amount || 0,
      currency: 'KES',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      method: requestData.method || 'mobile_money',
      accountDetails: requestData.accountDetails || {},
      notes: requestData.notes,
      ...requestData
    };

    setWithdrawalRequests(prev => [request, ...prev]);
    return request;
  }, []);

  // Approve withdrawal
  const approveWithdrawal = useCallback((withdrawalId: string, approvedBy: string) => {
    const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!withdrawal) return;

    if (platformBalance.availableFunds < withdrawal.amount) {
      throw new Error('Insufficient platform funds');
    }

    setWithdrawalRequests(prev => prev.map(w => 
      w.id === withdrawalId 
        ? { 
            ...w, 
            status: 'approved',
            approvedBy,
            approvedAt: new Date().toISOString()
          }
        : w
    ));

    logTransaction('withdrawal_approved', withdrawal.amount, `Withdrawal approved for ${withdrawal.writerName}`, approvedBy, withdrawal.id);
  }, [withdrawalRequests, platformBalance.availableFunds, logTransaction]);

  // Reject withdrawal
  const rejectWithdrawal = useCallback((withdrawalId: string, rejectedBy: string, reason: string) => {
    setWithdrawalRequests(prev => prev.map(w => 
      w.id === withdrawalId 
        ? { 
            ...w, 
            status: 'rejected',
            rejectedBy,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          }
        : w
    ));
  }, []);

  // Mark withdrawal as paid
  const markWithdrawalPaid = useCallback((withdrawalId: string, paidBy: string, paymentReference: string) => {
    const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!withdrawal || withdrawal.status !== 'approved') return;

    // Create invoice for the withdrawal
    const invoice: Invoice = {
      id: `INV-WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: 'WITHDRAWAL',
      orderTitle: `Withdrawal Payment - ${withdrawal.writerName}`,
      writerId: withdrawal.writerId,
      writerName: withdrawal.writerName,
      amount: withdrawal.amount,
      currency: 'KES',
      status: 'paid',
      type: 'order_completion',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: paidBy,
      paidAt: new Date().toISOString(),
      paymentReference,
      orderPages: 0,
      orderDeadline: new Date().toISOString(),
      orderCompletedAt: new Date().toISOString(),
      notes: `Withdrawal payment invoice - Reference: ${paymentReference}`
    };

    setInvoices(prev => [invoice, ...prev]);

    setWithdrawalRequests(prev => prev.map(w => 
      w.id === withdrawalId 
        ? { 
            ...w, 
            status: 'paid',
            paidBy,
            paidAt: new Date().toISOString(),
            paymentReference,
            invoiceId: invoice.id
          }
        : w
    ));

    logTransaction('withdrawal_paid', withdrawal.amount, `Withdrawal paid to ${withdrawal.writerName}`, paidBy, withdrawal.id);
  }, [withdrawalRequests, logTransaction]);

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

  const getWithdrawalsByWriter = useCallback((writerId: string) => {
    return withdrawalRequests.filter(request => request.writerId === writerId);
  }, [withdrawalRequests]);

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
      platformFunds,
      withdrawalRequests,
      transactionLogs,
      platformBalance,
      financialSummary,
      createInvoice,
      createManualInvoice,
      approveInvoice,
      processPayment,
      applyFine,
      waiveFine,
      addPlatformFunds,
      approveWithdrawal,
      rejectWithdrawal,
      markWithdrawalPaid,
      createWithdrawalRequest,
      getWriterFinancials,
      getInvoicesByWriter,
      getFinesByWriter,
      getPaymentsByWriter,
      getWithdrawalsByWriter,
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
