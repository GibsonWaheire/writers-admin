export interface Invoice {
  id: string;
  orderId: string;
  orderTitle: string;
  writerId: string;
  writerName: string;
  amount: number;
  currency: 'KES';
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  type: 'order_completion' | 'bonus' | 'correction';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  // Order details
  orderPages: number;
  orderDeadline: string;
  orderCompletedAt: string;
}

export interface Fine {
  id: string;
  orderId?: string;
  writerId: string;
  writerName: string;
  amount: number;
  currency: 'KES';
  reason: string;
  type: 'late_submission' | 'order_rejection' | 'auto_reassignment' | 'quality_issue' | 'other';
  status: 'pending' | 'applied' | 'waived';
  appliedAt: string;
  appliedBy: string; // admin ID
  waivedAt?: string;
  waivedBy?: string;
  waivedReason?: string;
  orderTitle?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  writerId: string;
  writerName: string;
  amount: number;
  currency: 'KES';
  type: 'order_payment' | 'bonus' | 'withdrawal' | 'fine_deduction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'mobile_money' | 'paypal' | 'other';
  reference?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  processedBy?: string;
  notes?: string;
  relatedOrderId?: string;
  relatedInvoiceId?: string;
}

export interface FinancialSummary {
  // Platform totals
  totalRevenue: number; // All completed orders
  totalWriterPayments: number; // All payments to writers
  totalProfit: number; // Revenue - Writer Payments
  
  // Current period
  monthlyRevenue: number;
  monthlyWriterPayments: number;
  monthlyProfit: number;
  
  // Pending amounts
  pendingInvoices: number;
  pendingPayments: number;
  pendingFines: number;
  
  // Statistics
  averageOrderValue: number;
  averageWriterPayment: number;
  profitMargin: number; // Percentage
  
  // Breakdown by payment status
  completedPayments: number;
  pendingApprovals: number;
  processingPayments: number;
  
  // Recent activity
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  recentFines: Fine[];
}

export interface WriterFinancials {
  writerId: string;
  writerName: string;
  totalEarned: number;
  totalPaid: number;
  pendingPayments: number;
  totalFines: number;
  currentBalance: number;
  
  // Performance metrics
  averageOrderValue: number;
  completedOrders: number;
  onTimeDeliveryRate: number;
  
  // Recent activity
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  recentFines: Fine[];
  
  // Payment preferences
  preferredPaymentMethod?: string;
  paymentSchedule?: 'weekly' | 'biweekly' | 'monthly';
}

export interface ClientPayment {
  id: string;
  orderId: string;
  orderTitle: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: 'USD' | 'KES';
  status: 'pending' | 'received' | 'refunded';
  receivedAt?: string;
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'mobile_money';
  reference?: string;
  notes?: string;
}

export interface PlatformFunds {
  id: string;
  amount: number;
  currency: 'KES';
  source: 'bank_transfer' | 'mpesa' | 'paypal' | 'stripe' | 'manual' | 'other';
  addedBy: string; // admin ID
  addedAt: string;
  reference?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface WithdrawalRequest {
  id: string;
  writerId: string;
  writerName: string;
  amount: number;
  currency: 'KES';
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  method: 'bank_transfer' | 'mobile_money' | 'paypal';
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    mobileNumber?: string;
    paypalEmail?: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  paidBy?: string;
  paidAt?: string;
  paymentReference?: string;
  invoiceId?: string;
  notes?: string;
}

export interface PlatformBalance {
  totalFunds: number;
  availableFunds: number;
  pendingWithdrawals: number;
  reservedFunds: number;
  totalWithdrawn: number;
  lastUpdated: string;
}

export interface TransactionLog {
  id: string;
  type: 'fund_added' | 'withdrawal_approved' | 'withdrawal_paid' | 'fine_applied' | 'fine_waived' | 'invoice_paid';
  amount: number;
  currency: 'KES';
  description: string;
  performedBy: string;
  performedAt: string;
  relatedEntityId?: string; // withdrawal ID, fine ID, etc.
  balanceBefore: number;
  balanceAfter: number;
}
