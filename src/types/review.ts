export interface Review {
  id: string;
  orderId: string;
  writerId: string;
  writerName: string;
  clientId: string;
  clientName: string;
  rating: number; // 1-5 stars
  comment?: string;
  categories: ReviewCategory[];
  status: 'pending' | 'published' | 'hidden';
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  adminNotes?: string;
  orderTitle: string;
  orderPages: number;
  orderValue: number;
}

export interface ReviewCategory {
  category: 'quality' | 'communication' | 'timeliness' | 'professionalism' | 'overall';
  rating: number; // 1-5 stars
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryAverages: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
    overall: number;
  };
  recentReviews: Review[];
  topPerformers: Array<{
    writerId: string;
    writerName: string;
    averageRating: number;
    totalReviews: number;
  }>;
}

export interface ReviewFilter {
  rating?: number;
  writerId?: string;
  status?: 'pending' | 'published' | 'hidden';
  dateRange?: {
    start: string;
    end: string;
  };
  orderBy?: 'date' | 'rating' | 'writer';
  orderDirection?: 'asc' | 'desc';
}
