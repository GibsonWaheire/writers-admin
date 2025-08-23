import React, { createContext, useContext, useCallback } from 'react';
import { useOrders } from './OrderContext';
import { useReviews } from './ReviewsContext';
import { useFinancial } from './FinancialContext';
import type { WriterPerformance, PlatformAnalytics, AnalyticsFilter, MonthlyMetric } from '../types/analytics';

interface AnalyticsContextType {
  platformAnalytics: PlatformAnalytics;
  getWriterPerformance: (writerId: string) => WriterPerformance;
  getFilteredAnalytics: (filters: AnalyticsFilter) => PlatformAnalytics;
  generateMonthlyData: (dataType: 'orders' | 'revenue' | 'writers') => MonthlyMetric[];
  exportAnalytics: (format: 'pdf' | 'excel' | 'csv') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { orders, getWriterOrderStats } = useOrders();
  const { reviews, getWriterStats } = useReviews();
  const { financialSummary, getWriterFinancials } = useFinancial();

  const generateMonthlyData = useCallback((dataType: 'orders' | 'revenue' | 'writers'): MonthlyMetric[] => {
    const months = [];
    const now = new Date();
    
    // Generate last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
      
      let value = 0;
      
      switch (dataType) {
        case 'orders':
          value = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear();
          }).length;
          break;
          
        case 'revenue':
          value = orders.filter(order => {
            if (!['Completed', 'Approved'].includes(order.status)) return false;
            const orderDate = new Date(order.completedAt || order.updatedAt);
            return orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear();
          }).reduce((sum, order) => sum + (order.pages * 350), 0);
          break;
          
        case 'writers':
          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear() &&
                   order.writerId;
          });
          value = new Set(monthOrders.map(order => order.writerId)).size;
          break;
      }
      
      months.push({ month: monthStr, value });
    }
    
    return months;
  }, [orders]);

  const getWriterPerformance = useCallback((writerId: string): WriterPerformance => {
    const writerOrders = orders.filter(order => order.writerId === writerId);
    const completedOrders = writerOrders.filter(order => 
      ['Completed', 'Approved'].includes(order.status)
    );
    const writerReviewStats = getWriterStats(writerId);
    const writerFinancials = getWriterFinancials(writerId);

    const totalOrders = writerOrders.length;
    const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    // Calculate average completion time
    const completionTimes = completedOrders
      .filter(order => order.completedAt)
      .map(order => {
        const start = new Date(order.createdAt);
        const end = new Date(order.completedAt!);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
      });
    
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // Calculate on-time delivery rate
    const onTimeOrders = completedOrders.filter(order => {
      if (!order.completedAt) return false;
      const deadline = new Date(order.deadline);
      const completed = new Date(order.completedAt);
      return completed <= deadline;
    }).length;
    
    const onTimeDeliveryRate = completedOrders.length > 0 
      ? (onTimeOrders / completedOrders.length) * 100 
      : 100;

    // Calculate revision and rejection rates
    const revisionOrders = writerOrders.filter(order => order.status === 'Revision').length;
    const rejectedOrders = writerOrders.filter(order => order.status === 'Rejected').length;
    
    const revisionRate = totalOrders > 0 ? (revisionOrders / totalOrders) * 100 : 0;
    const rejectionRate = totalOrders > 0 ? (rejectedOrders / totalOrders) * 100 : 0;

    // Generate monthly data
    const monthlyOrders = generateMonthlyData('orders').map(metric => ({
      month: metric.month,
      value: orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const [year, month] = metric.month.split('-');
        return order.writerId === writerId &&
               orderDate.getMonth() === parseInt(month) - 1 &&
               orderDate.getFullYear() === parseInt(year);
      }).length
    }));

    const monthlyEarnings = generateMonthlyData('revenue').map(metric => ({
      month: metric.month,
      value: orders.filter(order => {
        if (order.writerId !== writerId || !['Completed', 'Approved'].includes(order.status)) return false;
        const orderDate = new Date(order.completedAt || order.updatedAt);
        const [year, month] = metric.month.split('-');
        return orderDate.getMonth() === parseInt(month) - 1 &&
               orderDate.getFullYear() === parseInt(year);
      }).reduce((sum, order) => sum + (order.pages * 350), 0)
    }));

    const monthlyRatings = monthlyOrders.map(metric => ({
      month: metric.month,
      value: reviews.filter(review => {
        if (review.writerId !== writerId) return false;
        const reviewDate = new Date(review.createdAt);
        const [year, month] = metric.month.split('-');
        return reviewDate.getMonth() === parseInt(month) - 1 &&
               reviewDate.getFullYear() === parseInt(year);
      }).reduce((sum, review, _, arr) => sum + (review.rating / arr.length), 0) || 0
    }));

    const recentOrders = completedOrders
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
      .slice(0, 10)
      .map(order => ({
        orderId: order.id,
        title: order.title,
        status: order.status,
        completedAt: order.completedAt,
        rating: reviews.find(review => review.orderId === order.id)?.rating,
        earnings: order.pages * 350
      }));

    return {
      writerId,
      writerName: writerOrders[0]?.assignedWriter || 'Unknown Writer',
      totalOrders,
      completedOrders: completedOrders.length,
      completionRate,
      averageRating: writerReviewStats.averageRating,
      totalEarnings: writerFinancials.totalEarned,
      averageOrderValue: writerFinancials.averageOrderValue,
      averageCompletionTime,
      onTimeDeliveryRate,
      revisionRate,
      rejectionRate,
      clientSatisfactionScore: writerReviewStats.averageRating,
      monthlyOrders,
      monthlyEarnings,
      monthlyRatings,
      recentOrders
    };
  }, [orders, reviews, getWriterStats, getWriterFinancials, generateMonthlyData]);

  const calculatePlatformAnalytics = useCallback((): PlatformAnalytics => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => 
      ['Completed', 'Approved'].includes(order.status)
    ).length;

    const activeWriters = new Set(
      orders.filter(order => order.writerId).map(order => order.writerId)
    ).size;

    const totalRevenue = financialSummary.totalRevenue;

    // Calculate average completion time
    const completedOrdersWithTimes = orders.filter(order => 
      ['Completed', 'Approved'].includes(order.status) && order.completedAt
    );
    
    const averageCompletionTime = completedOrdersWithTimes.length > 0
      ? completedOrdersWithTimes.reduce((sum, order) => {
          const start = new Date(order.createdAt);
          const end = new Date(order.completedAt!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedOrdersWithTimes.length
      : 0;

    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    const clientSatisfactionScore = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Mock writer retention rate (would be calculated from user data)
    const writerRetentionRate = 85;

    // Calculate month-over-month growth
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;

    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).length;

    const orderGrowth = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    const currentMonthRevenue = orders.filter(order => {
      if (!['Completed', 'Approved'].includes(order.status)) return false;
      const orderDate = new Date(order.completedAt || order.updatedAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).reduce((sum, order) => sum + (order.pages * 350), 0);

    const lastMonthRevenue = orders.filter(order => {
      if (!['Completed', 'Approved'].includes(order.status)) return false;
      const orderDate = new Date(order.completedAt || order.updatedAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).reduce((sum, order) => sum + (order.pages * 350), 0);

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Orders by status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalOrders) * 100
    }));

    // Orders by discipline distribution
    const disciplineCounts = orders.reduce((acc, order) => {
      acc[order.discipline] = (acc[order.discipline] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersByDiscipline = Object.entries(disciplineCounts).map(([discipline, count]) => ({
      discipline,
      count,
      percentage: (count / totalOrders) * 100
    }));

    // Top writers
    const writerPerformances = Array.from(
      new Set(orders.filter(order => order.writerId).map(order => order.writerId))
    ).map(writerId => getWriterPerformance(writerId!));

    const topWriters = writerPerformances
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10)
      .map(writer => ({
        writerId: writer.writerId,
        writerName: writer.writerName,
        completedOrders: writer.completedOrders,
        averageRating: writer.averageRating,
        totalEarnings: writer.totalEarnings
      }));

    return {
      totalOrders,
      completedOrders,
      activeWriters,
      totalRevenue,
      averageCompletionTime,
      averageOrderValue,
      clientSatisfactionScore,
      writerRetentionRate,
      monthOverMonthGrowth: {
        orders: orderGrowth,
        revenue: revenueGrowth,
        writers: 5 // Mock data
      },
      ordersByStatus,
      ordersByDiscipline,
      monthlyOrdersData: generateMonthlyData('orders'),
      monthlyRevenueData: generateMonthlyData('revenue'),
      monthlyWriterData: generateMonthlyData('writers'),
      topWriters,
      recentOrderTrends: [] // Would be calculated from recent data
    };
  }, [orders, reviews, financialSummary, generateMonthlyData, getWriterPerformance]);

  const platformAnalytics = calculatePlatformAnalytics();

  const getFilteredAnalytics = useCallback((filters: AnalyticsFilter): PlatformAnalytics => {
    // Filter orders based on criteria
    let filteredOrders = orders;

    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (filters.writerId) {
      filteredOrders = filteredOrders.filter(order => order.writerId === filters.writerId);
    }

    if (filters.discipline) {
      filteredOrders = filteredOrders.filter(order => order.discipline === filters.discipline);
    }

    if (filters.orderStatus) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.orderStatus);
    }

    // Recalculate analytics with filtered data
    // This would use the same logic as calculatePlatformAnalytics but with filteredOrders
    return platformAnalytics; // Simplified for now
  }, [orders, platformAnalytics]);

  const exportAnalytics = useCallback((format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting analytics in ${format} format...`);
    // Implementation would generate and download the file
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      platformAnalytics,
      getWriterPerformance,
      getFilteredAnalytics,
      generateMonthlyData,
      exportAnalytics
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
