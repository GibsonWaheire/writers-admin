/**
 * Unified Order State Machine
 * Defines all valid state transitions and business rules for orders
 */

import type { OrderStatus } from '../types/order';

export type OrderAction = 
  | 'create'
  | 'assign'
  | 'bid'
  | 'approve_bid'
  | 'decline_bid'
  | 'confirm'
  | 'start_work'
  | 'upload_files'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'request_revision'
  | 'upload_revision_files'
  | 'resubmit'
  | 'complete'
  | 'reassign'
  | 'make_available'
  | 'cancel'
  | 'put_on_hold'
  | 'resolve_dispute'
  | 'refund';

export interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
  action: OrderAction;
  allowedRoles: ('admin' | 'writer')[];
  requiresData?: string[]; // Required fields in additionalData
  conditions?: (order: any) => boolean; // Additional conditions
}

/**
 * Valid state transitions for orders
 */
export const ORDER_STATE_TRANSITIONS: StateTransition[] = [
  // Order Creation
  { from: 'Draft', to: 'Available', action: 'create', allowedRoles: ['admin'] },
  
  // Bidding Flow
  { from: 'Available', to: 'Awaiting Approval', action: 'bid', allowedRoles: ['writer'], requiresData: ['writerId', 'writerName'] },
  { from: 'Awaiting Approval', to: 'Assigned', action: 'approve_bid', allowedRoles: ['admin'] },
  { from: 'Awaiting Approval', to: 'Available', action: 'decline_bid', allowedRoles: ['admin'] },
  
  // Direct Assignment
  { from: 'Available', to: 'Assigned', action: 'assign', allowedRoles: ['admin'], requiresData: ['writerId', 'writerName'] },
  
  // Work Flow
  { from: 'Assigned', to: 'In Progress', action: 'confirm', allowedRoles: ['writer'] },
  { from: 'Assigned', to: 'In Progress', action: 'start_work', allowedRoles: ['writer'] },
  
  // File Upload (doesn't change status)
  { from: 'In Progress', to: 'In Progress', action: 'upload_files', allowedRoles: ['writer'], requiresData: ['files'] },
  { from: 'Revision', to: 'Revision', action: 'upload_revision_files', allowedRoles: ['writer'], requiresData: ['files'] },
  
  // Submission
  { from: 'In Progress', to: 'Submitted', action: 'submit', allowedRoles: ['writer'], requiresData: ['files'] },
  
  // Admin Review
  { from: 'Submitted', to: 'Approved', action: 'approve', allowedRoles: ['admin'] },
  { from: 'Submitted', to: 'Rejected', action: 'reject', allowedRoles: ['admin'] },
  { from: 'Submitted', to: 'Revision', action: 'request_revision', allowedRoles: ['admin'], requiresData: ['explanation'] },
  
  // Revision Flow
  { from: 'Revision', to: 'Submitted', action: 'resubmit', allowedRoles: ['writer'], requiresData: ['files', 'revisionNotes'] },
  
  // Completion
  { from: 'Approved', to: 'Completed', action: 'complete', allowedRoles: ['admin', 'writer'] },
  
  // Reassignment
  { from: 'In Progress', to: 'Available', action: 'reassign', allowedRoles: ['writer', 'admin'], requiresData: ['reason'] },
  { from: 'Assigned', to: 'Available', action: 'reassign', allowedRoles: ['writer', 'admin'], requiresData: ['reason'] },
  
  // Availability
  { from: 'Assigned', to: 'Available', action: 'make_available', allowedRoles: ['admin'] },
  { from: 'In Progress', to: 'Available', action: 'make_available', allowedRoles: ['admin'] },
  
  // Cancellation
  { from: 'Available', to: 'Cancelled', action: 'cancel', allowedRoles: ['admin'] },
  { from: 'Assigned', to: 'Cancelled', action: 'cancel', allowedRoles: ['admin'] },
  
  // Hold
  { from: 'In Progress', to: 'On Hold', action: 'put_on_hold', allowedRoles: ['admin'], requiresData: ['reason'] },
  { from: 'On Hold', to: 'In Progress', action: 'start_work', allowedRoles: ['admin', 'writer'] },
];

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  action: OrderAction,
  userRole: 'admin' | 'writer',
  order?: any,
  additionalData?: Record<string, unknown>
): { valid: boolean; reason?: string } {
  const transition = ORDER_STATE_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus && t.action === action
  );
  
  if (!transition) {
    return { valid: false, reason: `Invalid transition from ${currentStatus} to ${targetStatus} via ${action}` };
  }
  
  if (!transition.allowedRoles.includes(userRole)) {
    return { valid: false, reason: `${userRole} is not allowed to perform ${action}` };
  }
  
  // Check required data
  if (transition.requiresData) {
    for (const field of transition.requiresData) {
      if (!additionalData || !additionalData[field]) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }
  }
  
  // Check additional conditions
  if (transition.conditions && order) {
    if (!transition.conditions(order)) {
      return { valid: false, reason: 'Transition conditions not met' };
    }
  }
  
  return { valid: true };
}

/**
 * Get all valid next states for an order
 */
export function getValidNextStates(
  currentStatus: OrderStatus,
  userRole: 'admin' | 'writer',
  order?: any
): Array<{ status: OrderStatus; action: OrderAction; label: string }> {
  const transitions = ORDER_STATE_TRANSITIONS.filter(
    t => t.from === currentStatus && t.allowedRoles.includes(userRole)
  );
  
  return transitions.map(t => ({
    status: t.to,
    action: t.action,
    label: getActionLabel(t.action)
  }));
}

/**
 * Get human-readable label for an action
 */
function getActionLabel(action: OrderAction): string {
  const labels: Record<OrderAction, string> = {
    create: 'Create Order',
    assign: 'Assign to Writer',
    bid: 'Bid on Order',
    approve_bid: 'Approve Bid',
    decline_bid: 'Decline Bid',
    confirm: 'Confirm Assignment',
    start_work: 'Start Working',
    upload_files: 'Upload Files',
    submit: 'Submit for Review',
    approve: 'Approve',
    reject: 'Reject',
    request_revision: 'Request Revision',
    upload_revision_files: 'Upload Revision Files',
    resubmit: 'Resubmit Revision',
    complete: 'Mark Complete',
    reassign: 'Reassign Order',
    make_available: 'Make Available',
    cancel: 'Cancel Order',
    put_on_hold: 'Put on Hold',
    resolve_dispute: 'Resolve Dispute',
    refund: 'Refund Order'
  };
  
  return labels[action] || action;
}

/**
 * Get status display information
 */
export function getStatusInfo(status: OrderStatus): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
} {
  const statusMap: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
    'Draft': { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: '📝', description: 'Order saved as draft' },
    'Available': { label: 'Available', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '🟢', description: 'Available for writers to pick' },
    'Awaiting Approval': { label: 'Awaiting Approval', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: '⏳', description: 'Writer bid pending admin approval' },
    'Assigned': { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '👤', description: 'Assigned to writer' },
    'In Progress': { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '🔵', description: 'Writer is working on it' },
    'Submitted': { label: 'Submitted', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '📤', description: 'Submitted for admin review' },
    'Approved': { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅', description: 'Approved by admin' },
    'Rejected': { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌', description: 'Rejected by admin' },
    'Revision': { label: 'Revision', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: '✏️', description: 'Revision requested' },
    'Resubmitted': { label: 'Resubmitted', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '📝', description: 'Revision resubmitted' },
    'Completed': { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50', icon: '🎉', description: 'Order completed' },
    'Late': { label: 'Late', color: 'text-red-600', bgColor: 'bg-red-50', icon: '⏰', description: 'Past deadline' },
    'Auto-Reassigned': { label: 'Auto-Reassigned', color: 'text-red-600', bgColor: 'bg-red-50', icon: '🔄', description: 'Automatically reassigned' },
    'Cancelled': { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: '🚫', description: 'Order cancelled' },
    'On Hold': { label: 'On Hold', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '⏸️', description: 'Temporarily on hold' },
    'Disputed': { label: 'Disputed', color: 'text-red-600', bgColor: 'bg-red-50', icon: '⚠️', description: 'Under dispute' },
    'Refunded': { label: 'Refunded', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: '↩️', description: 'Order refunded' }
  };
  
  return statusMap[status] || {
    label: status,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: '❓',
    description: 'Unknown status'
  };
}

