export interface Notification {
  id: string;
  userId: string; // Writer or admin ID
  type: 'order_assigned' | 'order_completed' | 'order_approved' | 'order_rejected' | 'payment_received' | 'system_update' | 'assignment_confirmed' | 'assignment_declined' | 'revision';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  inAppNotifications: boolean;
  orderAssignments: boolean;
  orderUpdates: boolean;
  paymentNotifications: boolean;
  systemUpdates: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  updatedAt: string;
}

export interface AssignmentHistory {
  id: string;
  orderId: string;
  writerId: string;
  writerName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  confirmedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  reassignedAt?: string;
  reassignReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  notes?: string;
  autoConfirmDeadline: string;
  status: 'pending' | 'confirmed' | 'declined' | 'auto_confirmed' | 'reassigned';
  notificationsSent: {
    email?: string;
    whatsapp?: string;
    inApp?: string;
  };
}

export interface AssignmentConfirmation {
  assignmentId: string;
  orderId: string;
  writerId: string;
  action: 'confirm' | 'decline';
  reason?: string;
  estimatedCompletionTime?: number; // hours
  questions?: string[];
  confirmedAt: string;
}

export interface SmartAssignmentSuggestion {
  writerId: string;
  writerName: string;
  matchScore: number;
  reasons: string[];
  availability: {
    currentOrders: number;
    maxOrders: number;
    availableSlots: number;
  };
  performance: {
    rating: number;
    completedOrders: number;
    successRate: number;
    avgCompletionTime: number;
  };
  expertise: {
    specializations: string[];
    relevantExperience: number;
    subjectMatch: boolean;
  };
  estimatedDelivery: string;
}
