export interface Writer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  
  // Account status
  status: 'active' | 'suspended' | 'pending' | 'inactive' | 'application_submitted' | 'rejected';
  role: 'writer' | 'admin' | 'super_admin';
  
  // Profile information
  bio?: string;
  specializations: string[]; // Disciplines they specialize in
  specialties: string[]; // Alias for specializations (for backward compatibility)
  languages: string[];
  timezone: string;
  country: string;
  
  // Identity and Application Information
  nationalId?: string; // National ID or passport number
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  
  // Education and Professional Background
  education?: {
    level: 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'other';
    institution?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
    gpa?: string;
  };
  
  // Professional Experience
  experience?: {
    yearsOfWriting?: number;
    previousPlatforms?: string[];
    writingSamples?: Array<{
      title: string;
      subject: string;
      url?: string;
      description?: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      dateObtained: string;
      expiryDate?: string;
    }>;
  };
  
  // Application specific fields
  applicationSubmittedAt?: string;
  applicationReviewedAt?: string;
  applicationReviewedBy?: string;
  rejectionReason?: string;
  applicationNotes?: string;
  
  // Performance metrics
  rating: number; // Average rating
  totalReviews: number;
  completedOrders: number;
  totalEarnings: number;
  successRate: number; // Percentage of successful completions
  
  // Account settings
  maxConcurrentOrders: number;
  maxOrders: number; // Alias for maxConcurrentOrders (for backward compatibility)
  preferredPaymentMethod?: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    mobileMoneyNumber?: string;
    paypalEmail?: string;
  };
  
  // Timestamps
  createdAt: string;
  lastActiveAt?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  
  // Communication preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  
  // Verification status
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isDocumentVerified: boolean;
  
  // Documents
  documents?: Array<{
    type: 'id' | 'certificate' | 'portfolio' | 'other';
    filename: string;
    url: string;
    uploadedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

export interface WriterInvite {
  id: string;
  email: string;
  phone?: string;
  invitedBy: string; // Admin ID
  invitedAt: string;
  status: 'sent' | 'accepted' | 'expired';
  expiresAt: string;
  acceptedAt?: string;
  token: string;
  personalizedMessage?: string;
}

export interface WriterStats {
  totalWriters: number;
  activeWriters: number;
  suspendedWriters: number;
  pendingWriters: number;
  
  // Performance distribution
  topPerformers: number; // Rating >= 4.5
  averagePerformers: number; // Rating 3.5-4.4
  needsImprovement: number; // Rating < 3.5
  
  // Activity metrics
  monthlyActiveWriters: number;
  newWritersThisMonth: number;
  writerRetentionRate: number;
  
  // Specialization distribution
  specializationStats: Array<{
    discipline: string;
    writerCount: number;
    averageRating: number;
    totalOrders: number;
  }>;
  
  // Geographic distribution
  countryStats: Array<{
    country: string;
    writerCount: number;
    averageRating: number;
  }>;
}

export interface WriterActivity {
  writerId: string;
  writerName: string;
  activityType: 'login' | 'order_picked' | 'order_submitted' | 'profile_updated' | 'payment_received';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WriterFilter {
  status?: 'active' | 'suspended' | 'pending' | 'inactive' | 'application_submitted' | 'rejected';
  specialization?: string;
  country?: string;
  ratingRange?: {
    min: number;
    max: number;
  };
  orderCountRange?: {
    min: number;
    max: number;
  };
  joinedDateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  sortBy?: 'name' | 'rating' | 'orders' | 'earnings' | 'joinDate';
  sortOrder?: 'asc' | 'desc';
}
