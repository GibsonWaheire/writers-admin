/**
 * Bidding System Helpers
 * Utilities for managing bids and preventing duplicates
 */

import type { Order } from '../types/order';

export interface Bid {
  orderId: string;
  writerId: string;
  writerName: string;
  bidAt: string;
  bidAmount?: number;
  bidNotes?: string;
  status: 'pending' | 'approved' | 'declined';
}

/**
 * Check if a writer has already bid on an order
 */
export function hasWriterBid(order: Order, writerId: string): boolean {
  // Check if order has bidBy field set to this writer
  if (order.bidBy === writerId || order.bidBy === `writer-${writerId}`) {
    return true;
  }
  
  // Check if order status is 'Awaiting Approval' and writerId matches
  if (order.status === 'Awaiting Approval' && order.writerId === writerId) {
    return true;
  }
  
  return false;
}

/**
 * Check if a writer can bid on an order
 */
export function canWriterBid(order: Order, writerId: string): {
  canBid: boolean;
  reason?: string;
} {
  // Check if order is available
  if (order.status !== 'Available') {
    return {
      canBid: false,
      reason: 'Order is not available for bidding'
    };
  }
  
  // Check if writer already bid
  if (hasWriterBid(order, writerId)) {
    return {
      canBid: false,
      reason: 'You have already bid on this order'
    };
  }
  
  // Check if order is assigned to another writer
  if (order.writerId && order.writerId !== writerId) {
    return {
      canBid: false,
      reason: 'Order is already assigned to another writer'
    };
  }
  
  return { canBid: true };
}

/**
 * Get all bids for an order
 */
export function getOrderBids(order: Order): Bid[] {
  const bids: Bid[] = [];
  
  // If order has a bid, create bid object
  if (order.bidBy && order.status === 'Awaiting Approval') {
    bids.push({
      orderId: order.id,
      writerId: order.bidBy,
      writerName: order.assignedWriter || 'Unknown Writer',
      bidAt: order.bidAt || order.updatedAt,
      bidAmount: order.bidAmount,
      bidNotes: order.bidNotes,
      status: order.bidStatus === 'approved' ? 'approved' :
              order.bidStatus === 'declined' ? 'declined' : 'pending'
    });
  }
  
  return bids;
}

/**
 * Get pending bids count for admin
 */
export function getPendingBidsCount(orders: Order[]): number {
  return orders.filter(order => 
    order.status === 'Awaiting Approval' && 
    order.bidBy && 
    order.bidStatus !== 'approved' && 
    order.bidStatus !== 'declined'
  ).length;
}

/**
 * Get writer's pending bids
 */
export function getWriterPendingBids(orders: Order[], writerId: string): Order[] {
  return orders.filter(order =>
    order.status === 'Awaiting Approval' &&
    (order.bidBy === writerId || order.bidBy === `writer-${writerId}`) &&
    order.bidStatus !== 'approved' &&
    order.bidStatus !== 'declined'
  );
}

/**
 * Get writer's approved bids
 */
export function getWriterApprovedBids(orders: Order[], writerId: string): Order[] {
  return orders.filter(order =>
    order.status === 'Assigned' &&
    (order.bidBy === writerId || order.bidBy === `writer-${writerId}`) &&
    order.bidStatus === 'approved'
  );
}

