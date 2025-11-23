export interface Order {
  id: string;
  orderNumber?: string; // 4-character order number (e.g., A001, B234)
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
  uploadedFiles: UploadedFile[]; // For backward compatibility - shows originalFiles
  originalFiles?: UploadedFile[]; // Original submission files (never overwritten)
  revisionFiles?: UploadedFile[]; // Revision submission files (separate from original)
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
  // Fine tracking
  fineAmount?: number; // Total fines applied to this order
  fineReason?: string; // Reason for fine (late, rejection, etc.)
  fineHistory?: Array<{
    amount: number;
    reason: string;
    appliedAt: string;
    type: 'late' | 'rejection' | 'auto-reassignment';
  }>;
  // Reassignment tracking
  reassignmentReason?: string; // Reason for reassignment
  reassignedAt?: string; // When order was reassigned
  reassignedBy?: string; // Who reassigned the order
  // Admin review tracking
  submittedToAdminAt?: string; // When submitted to admin
  adminReviewNotes?: string; // Admin's review notes
  adminReviewedAt?: string; // When admin reviewed
  adminReviewedBy?: string; // Who reviewed the order
  approvedAt?: string; // When order was approved by admin
  completedAt?: string; // When order was marked as completed
  // Revision tracking
  revisionSubmittedAt?: string; // When revision was submitted
  revisionResponseNotes?: string; // Writer's response to revision feedback
  revisionExplanation?: string; // Admin's explanation of what needs to be revised
  revisionScore?: number; // Revision score (starts at 10, reduces with each revision)
  revisionCount?: number; // Number of times revision was requested
  // Late submission tracking
  isLate?: boolean; // Whether order is past deadline
  hoursLate?: number; // How many hours past deadline
  lastFineApplied?: string; // When last fine was applied
  // Auto-reassignment tracking
  autoReassignedAt?: string; // When automatically reassigned
  originalWriterId?: string; // Original writer before reassignment
  // Make available tracking
  madeAvailableAt?: string; // When order was made available
  madeAvailableBy?: string; // Who made the order available
  // Assignment tracking
  assignedAt?: string; // When order was assigned
  assignedBy?: string; // Who assigned the order
  assignmentNotes?: string; // Notes from assignment
  pickedBy?: string; // Who picked the order (writer or admin)
  // Urgency level for pricing and deadline tracking
  urgencyLevel?: 'normal' | 'urgent' | 'very-urgent';
  // File attachments for requirements/instructions
  attachments?: UploadedFile[];
  // Client information
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  requirements?: string;
  // Submission tracking
  submissionNotes?: string;
  startedAt?: string;
  submittedAt?: string;
  // Rating and feedback
  rating?: number;
  // Rejection tracking
  rejectionReason?: string;
  // Revision tracking
  revisionRequests?: Array<{
    id: string;
    reason: string;
    explanation: string; // Detailed explanation of what needs revision
    requestedAt: string;
    requestedBy: string;
    status: 'pending' | 'resolved';
  }>;
  // Reviews
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewedAt: string;
    reviewedBy: string;
  }>;
  // Admin management
  adminMessages?: Array<{
    id: string;
    message: string;
    attachments: UploadedFile[];
    sentAt: string;
    sentBy: string;
    isNotification: boolean; // Whether this is a notification to writer
  }>;
  lastAdminEdit?: {
    editedAt: string;
    editedBy: string;
    changes: string[];
    notificationSent: boolean;
  };
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
  | 'Draft' // Order saved as draft by admin
  | 'Available' // Available for writers to pick
  | 'Awaiting Approval' // Writer has bid, waiting for admin approval
  | 'Assigned' // Writer has picked the order
  | 'In Progress' // Writer is working on it
  | 'Submitted' // Writer has submitted work for review
  | 'Approved' // Admin approved, payment added to wallet
  | 'Rejected' // Admin rejected, fine applied, no payment
  | 'Revision' // Admin requested revision
  | 'Resubmitted' // Writer resubmitted after revision
  | 'Completed' // Order completed successfully
  | 'Late' // Order is past deadline
  | 'Auto-Reassigned' // Automatically reassigned after 24h late
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
