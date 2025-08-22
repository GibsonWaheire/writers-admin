export interface Order {
  id: string;
  title: string;
  description: string;
  subject: string;
  pages: number;
  price: number;
  deadline: string;
  status: OrderStatus;
  assignedWriter?: string;
  writerId?: string;
  createdAt: string;
  updatedAt: string;
  requiresAdminApproval?: boolean;
}

export type OrderStatus = 
  | 'Available'
  | 'In Progress'
  | 'Pending Review'
  | 'Completed'
  | 'Rejected'
  | 'Requires Admin Approval';

export interface Writer {
  id: string;
  name: string;
  email: string;
  activeOrders: number;
  maxOrders: number;
  rating: number;
  totalEarnings: number;
}

export interface OrderAction {
  type: 'pick' | 'submit' | 'approve' | 'reject' | 'reassign' | 'request_revision';
  orderId: string;
  writerId?: string;
  adminId?: string;
  notes?: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  writerId: string;
  writerName: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}
