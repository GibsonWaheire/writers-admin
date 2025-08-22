export interface Order {
  id: string;
  title: string;
  description: string;
  subject: string;
  discipline: string;
  paperType: PaperType;
  pages: number;
  words: number;
  format: CitationFormat;
  price: number;
  deadline: string;
  status: OrderStatus;
  assignedWriter?: string;
  writerId?: string;
  createdAt: string;
  updatedAt: string;
  requiresAdminApproval?: boolean;
  clientMessages: ClientMessage[];
  uploadedFiles: UploadedFile[];
  additionalInstructions?: string;
  isOverdue: boolean;
}

export type PaperType = 
  | 'Essay'
  | 'Report'
  | 'Thesis'
  | 'Dissertation'
  | 'Research Paper'
  | 'Literature Review'
  | 'Case Study'
  | 'Annotated Bibliography'
  | 'Technical Documentation'
  | 'Business Plan'
  | 'Marketing Analysis'
  | 'Other';

export type CitationFormat = 
  | 'APA'
  | 'MLA'
  | 'Harvard'
  | 'Chicago'
  | 'Vancouver'
  | 'IEEE'
  | 'Other';

export type OrderStatus = 
  | 'Available'
  | 'Pending Approval'
  | 'In Progress'
  | 'Pending Review'
  | 'Completed'
  | 'Rejected'
  | 'Requires Admin Approval';

export interface ClientMessage {
  id: string;
  sender: 'client' | 'writer' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

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
  orderTitle: string;
  writerId: string;
  writerName: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
}
