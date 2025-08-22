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
  price: number; // Price in USD
  priceKES: number; // Price in Kenyan Shillings
  cpp: number; // Cost Per Page
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
  // New fields for order flow
  confirmationStatus: 'pending' | 'confirmed' | 'rejected';
  writerQuestions?: WriterQuestion[];
  writerConfirmation?: WriterConfirmation;
  earnings?: OrderEarnings;
  // Payment and delivery fields
  paymentType: 'advance' | 'pod' | 'milestone'; // POD = Pay on Delivery
  isPOD: boolean; // Flag for POD orders
  podAmount?: number; // Amount to be paid on delivery
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
  | 'Available' // Available for writers to pick
  | 'POD Available' // POD orders available
  | 'Pending Approval' // Admin approval needed
  | 'Awaiting Confirmation' // Writer needs to confirm
  | 'Confirmed' // Writer confirmed, order is active
  | 'In Progress' // Writer is working on it
  | 'Pending Review' // Submitted for review
  | 'Completed' // Order completed
  | 'Rejected' // Order rejected
  | 'Requires Admin Approval' // Needs admin review
  | 'Upload to Client' // Ready for client review
  | 'Editor Revision' // Needs revision
  | 'Approved' // Client approved
  | 'Awaiting Payment' // Ready for payment
  | 'Pay Later' // Payment deferred
  | 'POD Delivered' // POD order delivered, awaiting payment
  | 'POD Paid' // POD order payment received
  | 'Cancelled' // Order cancelled
  | 'On Hold' // Order temporarily on hold
  | 'Disputed' // Order under dispute
  | 'Refunded'; // Order refunded

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

export interface WriterQuestion {
  id: string;
  question: string;
  answer?: string;
  askedAt: string;
  answeredAt?: string;
  isRequired: boolean;
}

export interface WriterConfirmation {
  id: string;
  hasReadInstructions: boolean;
  hasUnderstoodRequirements: boolean;
  canMeetDeadline: boolean;
  hasNoConflicts: boolean;
  additionalNotes?: string;
  confirmedAt: string;
  writerId: string;
}

export interface OrderEarnings {
  baseAmount: number; // Base price in KES
  cppAmount: number; // Cost per page amount
  totalAmount: number; // Total earnings in KES
  currency: 'KES';
  calculatedAt: string;
}
