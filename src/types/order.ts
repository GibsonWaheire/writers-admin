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
  cpp: number; // Cost Per Page in KES (350 KES for normal, 400-500 KES for priority)
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
  paymentType: 'advance' | 'milestone'; // Payment types (removed POD)
  // Pricing and fines
  totalPriceKES: number; // Total price in KES
  fineAmount?: number; // Fine amount if applicable
  fineReason?: string; // Reason for fine
  // Reassignment tracking
  reassignmentReason?: string; // Reason for reassignment
  reassignedAt?: string; // When order was reassigned
  reassignedBy?: string; // Who reassigned the order
  // Admin review tracking
  submittedToAdminAt?: string; // When submitted to admin
  adminReviewNotes?: string; // Admin's review notes
  adminReviewedAt?: string; // When admin reviewed
  adminReviewedBy?: string; // Who reviewed the order
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
  | 'Pending Approval' // Admin approval needed
  | 'Awaiting Confirmation' // Writer needs to confirm
  | 'Confirmed' // Writer confirmed, order is active
  | 'In Progress' // Writer is working on it
  | 'Submitted to Admin' // Submitted for admin review
  | 'Under Admin Review' // Admin is reviewing
  | 'Admin Approved' // Admin approved, ready for client
  | 'Admin Rejected' // Admin rejected, needs revision
  | 'Client Review' // Client is reviewing
  | 'Client Approved' // Client approved
  | 'Client Rejected' // Client rejected, needs revision
  | 'Completed' // Order completed
  | 'Rejected' // Order rejected
  | 'Requires Admin Approval' // Needs admin review
  | 'Editor Revision' // Needs revision
  | 'Awaiting Payment' // Ready for payment
  | 'Pay Later' // Payment deferred
  | 'Reassigned' // Order was reassigned by writer
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

export interface OrderFine {
  id: string;
  orderId: string;
  amount: number;
  reason: 'missed_deadline' | 'rejected_work' | 'reassignment' | 'other';
  description: string;
  appliedAt: string;
  appliedBy: string; // admin ID
  waived?: boolean;
  waivedAt?: string;
  waivedBy?: string;
  waivedReason?: string;
}

export interface OrderReassignment {
  id: string;
  orderId: string;
  reason: string;
  reassignedBy: string; // writer ID
  reassignedAt: string;
  previousWriter: string;
  fineApplied?: boolean;
  fineAmount?: number;
  adminNotes?: string;
}
