import type { Order, UploadedFile } from '../types/order';
import type { Writer } from '../types/user';

export interface BidWithWriter {
  bid: {
    id: string;
    writerId: string;
    writerName: string;
    bidAmount?: number;
    bidNotes?: string;
    bidAt: string;
    status: 'pending' | 'approved' | 'declined';
  };
  order: Order;
  writer?: Writer;
  performance?: WriterPerformance;
  meritScore: number;
}

export interface WriterPerformance {
  completionRate: number;
  onTimeDeliveryRate: number;
  revisionRate: number;
  rejectionRate: number;
  averageRating: number;
  totalOrders: number;
  completedOrders: number;
  totalEarnings: number;
}

/**
 * Calculate writer performance metrics
 */
export function calculateWriterPerformance(
  writerId: string,
  orders: Order[]
): WriterPerformance {
  const writerOrders = orders.filter(order => order.writerId === writerId);
  const completedOrders = writerOrders.filter(order => 
    ['Completed', 'Approved'].includes(order.status)
  );
  
  const totalOrders = writerOrders.length;
  const completionRate = totalOrders > 0 
    ? (completedOrders.length / totalOrders) * 100 
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

  // Calculate average rating (placeholder - would come from reviews)
  const averageRating = 4.5; // TODO: Get from reviews system

  // Calculate total earnings
  const totalEarnings = completedOrders.reduce((sum, order) => 
    sum + (order.totalPriceKES || order.pages * 350), 0
  );

  return {
    completionRate,
    onTimeDeliveryRate,
    revisionRate,
    rejectionRate,
    averageRating,
    totalOrders,
    completedOrders: completedOrders.length,
    totalEarnings
  };
}

/**
 * Calculate merit score for a writer based on performance
 * Score range: 0-100
 */
export function calculateMeritScore(performance: WriterPerformance): number {
  // Weighted scoring system
  const completionScore = (performance.completionRate / 100) * 30;
  const ratingScore = (performance.averageRating / 5) * 25;
  const onTimeScore = (performance.onTimeDeliveryRate / 100) * 20;
  const lowRevisionScore = Math.max(0, (100 - performance.revisionRate) / 100) * 15;
  const lowRejectionScore = Math.max(0, (100 - performance.rejectionRate) / 100) * 10;

  const meritScore = 
    completionScore +
    ratingScore +
    onTimeScore +
    lowRevisionScore +
    lowRejectionScore;

  return Math.round(meritScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Get all bids with writer performance data and merit scores
 */
export function getBidsWithPerformance(
  orders: Order[],
  writers: Writer[]
): BidWithWriter[] {
  const allBids: BidWithWriter[] = [];

  orders.forEach(order => {
    if (order.bids && order.bids.length > 0) {
      order.bids.forEach((bid: any) => {
        if (bid.status === 'pending') {
          const writer = writers.find(w => w.id === bid.writerId);
          const performance = calculateWriterPerformance(bid.writerId, orders);
          const meritScore = calculateMeritScore(performance);

          allBids.push({
            bid,
            order,
            writer,
            performance,
            meritScore
          });
        }
      });
    }
  });

  return allBids;
}

/**
 * Sort bids by merit score (highest first)
 */
export function sortBidsByMerit(bids: BidWithWriter[]): BidWithWriter[] {
  return [...bids].sort((a, b) => b.meritScore - a.meritScore);
}

/**
 * Group bids by order
 */
export function groupBidsByOrder(bids: BidWithWriter[]): Map<string, BidWithWriter[]> {
  const grouped = new Map<string, BidWithWriter[]>();
  
  bids.forEach(bidWithWriter => {
    const orderId = bidWithWriter.order.id;
    if (!grouped.has(orderId)) {
      grouped.set(orderId, []);
    }
    grouped.get(orderId)!.push(bidWithWriter);
  });

  // Sort bids within each order by merit score
  grouped.forEach((bids, orderId) => {
    grouped.set(orderId, sortBidsByMerit(bids));
  });

  return grouped;
}

/**
 * Format time ago string
 */
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return new Date(dateString).toLocaleDateString();
}
