export interface PODOrder {
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
  status: PODStatus;
  assignedWriter?: string;
  writerId?: string;
  createdAt: string;
  updatedAt: string;
  clientMessages: ClientMessage[];
  uploadedFiles: UploadedFile[];
  additionalInstructions?: string;
  isOverdue: boolean;
  // POD specific fields
  podAmount: number; // Amount to be paid on delivery
  deliveryDate?: string; // When the order was delivered
  paymentReceivedAt?: string; // When payment was received
  deliveryNotes?: string; // Notes about the delivery
  clientSignature?: string; // Client signature or confirmation
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

export type PODStatus = 
  | 'Available' // Available for writers to pick
  | 'Assigned' // Assigned to a writer
  | 'In Progress' // Writer is working on it
  | 'Ready for Delivery' // Ready to be delivered to client
  | 'Delivered' // Delivered to client, awaiting payment
  | 'Payment Received' // Payment received, order completed
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

export interface PODDelivery {
  id: string;
  podOrderId: string;
  deliveredAt: string;
  deliveredBy: string; // Writer ID
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  clientSignature?: string;
  photos?: string[]; // URLs to delivery photos
  status: 'delivered' | 'payment_received' | 'disputed';
}

export interface PODPayment {
  id: string;
  podOrderId: string;
  amount: number;
  receivedAt: string;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'other';
  reference?: string;
  notes?: string;
  collectedBy: string; // Writer ID
}
