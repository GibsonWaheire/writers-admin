import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Review, ReviewStats, ReviewFilter } from '../types/review';
import { db } from '../services/database';

interface ReviewsContextType {
  reviews: Review[];
  reviewStats: ReviewStats;
  createReview: (reviewData: Partial<Review>) => Promise<Review>;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  getReviewsByWriter: (writerId: string) => Review[];
  getReviewsByOrder: (orderId: string) => Review[];
  getWriterStats: (writerId: string) => {
    averageRating: number;
    totalReviews: number;
    recentReviews: Review[];
  };
  filterReviews: (filters: ReviewFilter) => Review[];
  assignReviewToOrder: (orderId: string, clientData: { name: string; id: string }) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reviews from database on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const reviewsData = await db.find<Review>('reviews');
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Old hardcoded reviews for reference
  const [oldReviews] = useState<Review[]>([
    {
      id: 'REV-001',
      orderId: 'ORD-COMPLETED-001',
      writerId: 'writer-1',
      writerName: 'John Doe',
      clientId: 'client-1',
      clientName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent work! The marketing strategy was comprehensive and well-researched. John delivered on time and exceeded expectations.',
      categories: [
        { category: 'quality', rating: 5 },
        { category: 'communication', rating: 5 },
        { category: 'timeliness', rating: 5 },
        { category: 'professionalism', rating: 5 },
        { category: 'overall', rating: 5 }
      ],
      status: 'published',
      createdAt: '2024-01-22T12:00:00Z',
      updatedAt: '2024-01-22T12:00:00Z',
      isVerified: true,
      orderTitle: 'Marketing Strategy for Social Media Platform',
      orderPages: 6,
      orderValue: 2100
    },
    {
      id: 'REV-002',
      orderId: 'ORD-002',
      writerId: 'writer-1',
      writerName: 'John Doe',
      clientId: 'client-2',
      clientName: 'Michael Chen',
      rating: 4,
      comment: 'Good quality work. The business plan was detailed and professional. Minor revisions were needed but overall satisfied.',
      categories: [
        { category: 'quality', rating: 4 },
        { category: 'communication', rating: 4 },
        { category: 'timeliness', rating: 4 },
        { category: 'professionalism', rating: 5 },
        { category: 'overall', rating: 4 }
      ],
      status: 'published',
      createdAt: '2024-01-20T15:30:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      isVerified: true,
      orderTitle: 'Business Plan for Tech Startup',
      orderPages: 12,
      orderValue: 4200
    },
    {
      id: 'REV-003',
      orderId: 'ORD-003',
      writerId: 'writer-1',
      writerName: 'John Doe',
      clientId: 'client-3',
      clientName: 'Emma Wilson',
      rating: 5,
      comment: 'Outstanding literature review! Very thorough analysis and excellent use of recent sources. Highly recommend John for psychology papers.',
      categories: [
        { category: 'quality', rating: 5 },
        { category: 'communication', rating: 5 },
        { category: 'timeliness', rating: 4 },
        { category: 'professionalism', rating: 5 },
        { category: 'overall', rating: 5 }
      ],
      status: 'published',
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
      isVerified: true,
      orderTitle: 'Literature Review - Cognitive Behavioral Therapy',
      orderPages: 12,
      orderValue: 4200
    }
  ]);

  const calculateReviewStats = useCallback((): ReviewStats => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    const categoryAverages = {
      quality: 0,
      communication: 0,
      timeliness: 0,
      professionalism: 0,
      overall: 0,
    };

    if (totalReviews > 0) {
      Object.keys(categoryAverages).forEach(category => {
        const categoryRatings = reviews.flatMap(review => 
          review.categories.filter(cat => cat.category === category).map(cat => cat.rating)
        );
        categoryAverages[category as keyof typeof categoryAverages] = 
          categoryRatings.length > 0 
            ? categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length 
            : 0;
      });
    }

    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Calculate top performers
    const writerRatings = reviews.reduce((acc, review) => {
      if (!acc[review.writerId]) {
        acc[review.writerId] = {
          writerId: review.writerId,
          writerName: review.writerName,
          ratings: [],
          totalReviews: 0
        };
      }
      acc[review.writerId].ratings.push(review.rating);
      acc[review.writerId].totalReviews++;
      return acc;
    }, {} as Record<string, { writerId: string; writerName: string; ratings: number[]; totalReviews: number }>);

    const topPerformers = Object.values(writerRatings)
      .map(writer => ({
        writerId: writer.writerId,
        writerName: writer.writerName,
        averageRating: writer.ratings.reduce((sum, rating) => sum + rating, 0) / writer.ratings.length,
        totalReviews: writer.totalReviews
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      categoryAverages,
      recentReviews,
      topPerformers
    };
  }, [reviews]);

  const reviewStats = calculateReviewStats();

  const createReview = useCallback(async (reviewData: Partial<Review>): Promise<Review> => {
    const newReview: Review = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: reviewData.orderId || '',
      writerId: reviewData.writerId || '',
      writerName: reviewData.writerName || '',
      clientId: reviewData.clientId || '',
      clientName: reviewData.clientName || '',
      rating: reviewData.rating || 5,
      comment: reviewData.comment || '',
      categories: reviewData.categories || [
        { category: 'quality', rating: reviewData.rating || 5 },
        { category: 'communication', rating: reviewData.rating || 5 },
        { category: 'timeliness', rating: reviewData.rating || 5 },
        { category: 'professionalism', rating: reviewData.rating || 5 },
        { category: 'overall', rating: reviewData.rating || 5 }
      ],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: false,
      orderTitle: reviewData.orderTitle || '',
      orderPages: reviewData.orderPages || 0,
      orderValue: reviewData.orderValue || 0,
      ...reviewData
    };

    setReviews(prev => [newReview, ...prev]);
    return newReview;
  }, []);

  const updateReview = useCallback((reviewId: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, ...updates, updatedAt: new Date().toISOString() }
        : review
    ));
  }, []);

  const deleteReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
  }, []);

  const getReviewsByWriter = useCallback((writerId: string) => {
    return reviews.filter(review => review.writerId === writerId);
  }, [reviews]);

  const getReviewsByOrder = useCallback((orderId: string) => {
    return reviews.filter(review => review.orderId === orderId);
  }, [reviews]);

  const getWriterStats = useCallback((writerId: string) => {
    const writerReviews = getReviewsByWriter(writerId);
    const averageRating = writerReviews.length > 0
      ? writerReviews.reduce((sum, review) => sum + review.rating, 0) / writerReviews.length
      : 0;
    const recentReviews = writerReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      averageRating,
      totalReviews: writerReviews.length,
      recentReviews
    };
  }, [getReviewsByWriter]);

  const filterReviews = useCallback((filters: ReviewFilter) => {
    return reviews.filter(review => {
      if (filters.rating && review.rating !== filters.rating) return false;
      if (filters.writerId && review.writerId !== filters.writerId) return false;
      if (filters.status && review.status !== filters.status) return false;
      if (filters.dateRange) {
        const reviewDate = new Date(review.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (reviewDate < startDate || reviewDate > endDate) return false;
      }
      return true;
    });
  }, [reviews]);

  const assignReviewToOrder = useCallback((orderId: string, clientData: { name: string; id: string }) => {
    // This would typically trigger a review request to the client
    console.log('Assigning review to order:', { orderId, clientData });
    // In a real app, this would send an email/notification to the client
  }, []);

  return (
    <ReviewsContext.Provider value={{
      reviews,
      reviewStats,
      createReview,
      updateReview,
      deleteReview,
      getReviewsByWriter,
      getReviewsByOrder,
      getWriterStats,
      filterReviews,
      assignReviewToOrder
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
