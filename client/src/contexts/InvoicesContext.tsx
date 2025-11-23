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
  invoiceStatus?: 'draft' | 'submitted' | 'approved' | 'rejected'; // New: Invoice workflow status
  dueDate: string;
  lateFees?: number;
  submittedAt?: string; // When invoice was submitted for review
  submittedBy?: string; // Who submitted the invoice
  approvedAt?: string; // When invoice was approved
  approvedBy?: string; // Who approved the invoice
  rejectedAt?: string; // When invoice was rejected
  rejectedBy?: string; // Who rejected the invoice
  rejectionReason?: string; // Reason for rejection
  paymentRequestedAt?: string; // When payment was requested
  notes?: string; // Additional notes
}

interface InvoicesContextType {
  invoices: InvoiceData[];
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  createInvoice: (orderId: string, orderType: 'regular' | 'pod', writerId: string, writerName: string) => void;
  createInvoiceFromOrder: (order: any, orderType: 'regular' | 'pod') => InvoiceData; // New: Create invoice from order
  submitInvoice: (invoiceId: string, writerId: string) => void; // New: Submit invoice for admin review
  requestPayment: (invoiceId: string, writerId: string) => void; // New: Request payment for approved invoice
  updateInvoiceStatus: (invoiceId: string, status: InvoiceData['paymentStatus']) => void;
  markInvoiceAsPaid: (invoiceId: string, paymentMethod: string, paidAt?: string) => void;
  getInvoicesByStatus: (status: InvoiceData['paymentStatus']) => InvoiceData[];
  getInvoicesByInvoiceStatus: (status: InvoiceData['invoiceStatus']) => InvoiceData[]; // New: Filter by invoice status
  getInvoicesByWriter: (writerId: string) => InvoiceData[];
  getInvoicesByOrder: (orderId: string) => InvoiceData[];
  getOrdersWithoutInvoices: (writerId: string, ordersList: any[], podOrdersList: any[]) => any[]; // New: Get completed orders without invoices
  calculateLateFees: (invoiceId: string) => number;
  exportInvoices: (format: 'csv' | 'pdf' | 'excel', writerId?: string) => void;
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
          status: order.status === 'Approved' ? 'pending' : 'paid',
          createdAt: order.updatedAt,
          paidAt: order.status === 'Approved' ? undefined : order.updatedAt,
          paymentMethod: order.status === 'Approved' ? undefined : 'Platform Transfer',
          orderType: 'regular',
          pages: order.pages,
          totalAmountKES,
          writerEarnings,
          platformFee,
          paymentStatus: order.status === 'Approved' ? 'pending' : 'paid',
          dueDate: order.deadline
        });
      }
    });

    // Generate invoices for POD orders
    if (podOrders && Array.isArray(podOrders)) {
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
    }

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
      invoiceStatus: 'draft', // Start as draft
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    setInvoices(prev => [newInvoice, ...prev]);
  }, []);

  // Create invoice from a completed order
  const createInvoiceFromOrder = useCallback((order: any, orderType: 'regular' | 'pod'): InvoiceData => {
    const totalAmountKES = orderType === 'pod' 
      ? (order.podAmount || order.pages * 350)
      : (order.totalPriceKES || order.pages * 350);
    
    const writerEarnings = orderType === 'pod'
      ? totalAmountKES * 0.8 // 80% for POD
      : order.pages * 350; // 350 KES per page for regular
    
    const platformFee = totalAmountKES - writerEarnings;
    
    const newInvoice: InvoiceData = {
      id: `INV-${orderType.toUpperCase()}-${order.id}-${Date.now()}`,
      orderId: order.id,
      orderTitle: order.title,
      writerId: order.writerId,
      writerName: order.assignedWriter || 'Unknown Writer',
      amount: totalAmountKES,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderType,
      pages: order.pages,
      totalAmountKES,
      writerEarnings,
      platformFee,
      paymentStatus: 'pending',
      invoiceStatus: 'draft', // Start as draft, writer can submit
      dueDate: order.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    setInvoices(prev => {
      // Check if invoice already exists for this order
      const exists = prev.find(inv => inv.orderId === order.id);
      if (exists) return prev;
      return [newInvoice, ...prev];
    });
    
    return newInvoice;
  }, []);

  // Submit invoice for admin review
  const submitInvoice = useCallback((invoiceId: string, writerId: string) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId && inv.writerId === writerId
          ? { 
              ...inv, 
              invoiceStatus: 'submitted',
              submittedAt: new Date().toISOString(),
              submittedBy: writerId
            }
          : inv
      )
    );
  }, []);

  // Request payment for approved invoice
  const requestPayment = useCallback((invoiceId: string, writerId: string) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId && inv.writerId === writerId
          ? { 
              ...inv, 
              paymentRequestedAt: new Date().toISOString()
            }
          : inv
      )
    );
    // TODO: Send notification to admin
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

  const getInvoicesByInvoiceStatus = useCallback((status: InvoiceData['invoiceStatus']) => {
    return invoices.filter(inv => inv.invoiceStatus === status);
  }, [invoices]);

  const getInvoicesByWriter = useCallback((writerId: string) => {
    return invoices.filter(inv => inv.writerId === writerId);
  }, [invoices]);

  const getInvoicesByOrder = useCallback((orderId: string) => {
    return invoices.filter(inv => inv.orderId === orderId);
  }, [invoices]);

  // Get completed orders that don't have invoices yet
  // Note: This function should be called from components that have access to orders and podOrders
  const getOrdersWithoutInvoices = useCallback((writerId: string, ordersList: any[], podOrdersList: any[]) => {
    if (!writerId) return [];
    
    // Get completed regular orders without invoices
    const completedOrders = (ordersList || []).filter((order: any) => 
      order.writerId === writerId &&
      ['Completed', 'Admin Approved', 'Client Approved'].includes(order.status) &&
      !invoices.find(inv => inv.orderId === order.id && inv.orderType === 'regular')
    );
    
    // Get completed POD orders without invoices
    const completedPODOrders = (podOrdersList || []).filter((podOrder: any) => 
      podOrder.writerId === writerId &&
      ['Payment Received', 'Delivered'].includes(podOrder.status) &&
      !invoices.find(inv => inv.orderId === podOrder.id && inv.orderType === 'pod')
    );
    
    return [...completedOrders, ...completedPODOrders];
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

  const exportInvoices = useCallback((format: 'csv' | 'pdf' | 'excel', writerId?: string) => {
    // Filter invoices by writer if provided
    const invoicesToExport = writerId 
      ? invoices.filter(inv => inv.writerId === writerId)
      : invoices;

    if (invoicesToExport.length === 0) {
      alert('No invoices to export');
      return;
    }

    if (format === 'csv') {
      // CSV Headers
      const headers = [
        'Invoice ID',
        'Order ID',
        'Order Title',
        'Order Type',
        'Pages',
        'Invoice Status',
        'Payment Status',
        'Total Amount (KES)',
        'Writer Earnings (KES)',
        'Platform Fee (KES)',
        'Due Date',
        'Created At',
        'Paid At',
        'Payment Method',
        'Submitted At',
        'Approved At',
        'Notes'
      ];

      // CSV Rows
      const rows = invoicesToExport.map(invoice => {
        const formatDate = (dateString?: string) => {
          if (!dateString) return '';
          try {
            return new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch {
            return dateString;
          }
        };

        return [
          invoice.id || '',
          invoice.orderId || '',
          `"${(invoice.orderTitle || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
          invoice.orderType || '',
          invoice.pages?.toString() || '0',
          invoice.invoiceStatus || invoice.status || '',
          invoice.paymentStatus || '',
          invoice.totalAmountKES?.toFixed(2) || '0.00',
          invoice.writerEarnings?.toFixed(2) || '0.00',
          invoice.platformFee?.toFixed(2) || '0.00',
          formatDate(invoice.dueDate),
          formatDate(invoice.createdAt),
          formatDate(invoice.paidAt),
          invoice.paymentMethod || '',
          formatDate(invoice.submittedAt),
          formatDate(invoice.approvedAt),
          `"${(invoice.notes || '').replace(/"/g, '""')}"` // Escape quotes in CSV
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } else if (format === 'pdf' || format === 'excel') {
      // PDF and Excel export can be implemented later
      console.log(`Exporting invoices in ${format} format - Coming soon`);
      alert(`${format.toUpperCase()} export is coming soon. Please use CSV export for now.`);
    }
  }, [invoices]);

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
      createInvoiceFromOrder,
      submitInvoice,
      requestPayment,
      updateInvoiceStatus,
      markInvoiceAsPaid,
      getInvoicesByStatus,
      getInvoicesByInvoiceStatus,
      getInvoicesByWriter,
      getInvoicesByOrder,
      getOrdersWithoutInvoices,
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
