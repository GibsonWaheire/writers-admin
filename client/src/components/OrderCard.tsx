
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  DollarSign, 
  FileText, 
  Eye, 
  BookOpen, 
  FileType,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit,
  ThumbsUp,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  RefreshCw,
  UserX,
  Clock
} from 'lucide-react';
import { OrderReassignmentModal } from './OrderReassignmentModal';
import { SubmitToAdminModal } from './SubmitToAdminModal';
import { SubmitRevisionModal } from './SubmitRevisionModal';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion } from '../types/order';

interface OrderCardProps {
  order: Order;
  userRole: 'writer' | 'admin';
  onView: (order: Order) => void;
  onAction?: (action: string, orderId: string, additionalData?: Record<string, unknown>) => void;
  onConfirm?: (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => void;
  showActions?: boolean;
}

export function OrderCard({ 
  order, 
  userRole, 
  onView, 
  onAction, 
  onConfirm,
  showActions = true 
}: OrderCardProps) {
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [showSubmitToAdminModal, setShowSubmitToAdminModal] = useState(false);
  const [showSubmitRevisionModal, setShowSubmitRevisionModal] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      'Draft': { variant: 'outline' as const, color: 'text-gray-600', bg: 'bg-gray-50', icon: '📝' },
      'Available': { variant: 'outline' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🟢' },
      'Assigned': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '👤' },
      'In Progress': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🔵' },
      'Submitted': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50', icon: '📤', text: 'Under Review' },
      'Approved': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
      'Rejected': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
      'Revision': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '✏️' },
      'Resubmitted': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50', icon: '📝' },
      'Completed': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '🎉' },
      'Late': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '⏰' },
      'Auto-Reassigned': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '🔄' },
      'Cancelled': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
      'On Hold': { variant: 'secondary' as const, color: 'text-gray-600', bg: 'bg-gray-50', icon: '⏸️' },
      'Disputed': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '⚠️' },
      'Refunded': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '↩️' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <Badge variant={config.variant} className={`${config.color} ${config.bg} border-0 flex items-center gap-1`}>
        <span>{config.icon}</span>
        {status}
      </Badge>
    );
  };

  const getDeadlineStatus = () => {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    if (userRole === 'writer') {
      if (order.status === 'Available') {
        return (
          <Button 
            onClick={handleAutoBid}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Bid on Order
          </Button>
        );
      }
      
      if (order.status === 'Assigned') {
        return (
          <div className="flex gap-2">
              <Button 
                onClick={handleAutoBid}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Bid on Order
              </Button>
          </div>
        );
      }
      
      if (order.status === 'In Progress') {
        // Check if order has less than 12 hours remaining
        const deadline = new Date(order.deadline);
        const now = new Date();
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        const canReassign = hoursRemaining >= 12;
        
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSubmitToAdminModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit to Admin
            </Button>
            {canReassign ? (
            <Button 
              onClick={() => setShowReassignmentModal(true)}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reassign Order
            </Button>
            ) : (
              <Button 
                size="sm"
                variant="outline"
                disabled
                className="border-gray-300 text-gray-400"
                title={`Cannot reassign: Only ${hoursRemaining.toFixed(1)} hours remaining`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cannot Reassign
              </Button>
            )}
          </div>
        );
      }

      if (order.status === 'Submitted') {
        return (
          <Button 
            onClick={() => onAction?.('request_revision', order.id)}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Request Revision
          </Button>
        );
      }

      if (order.status === 'Revision') {
        return (
          <Button 
            onClick={() => setShowSubmitRevisionModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Revision
          </Button>
        );
      }

      if (order.status === 'Approved') {
        return (
          <Button 
            onClick={() => onAction?.('complete', order.id)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        );
      }

      if (order.status === 'Completed') {
        return (
          <Button 
            onClick={() => onAction?.('pay_later', order.id)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Later
          </Button>
        );
      }
    }

    if (userRole === 'admin') {
      if (order.status === 'Available') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('assign', order.id)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Order
            </Button>
          </div>
        );
      }
      
      if (order.status === 'Assigned') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('make_available', order.id)}
              size="sm"
              variant="outline"
              className="text-orange-600 hover:bg-orange-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Make Available
            </Button>
            <Button 
              onClick={() => onAction?.('reassign', order.id, { reason: 'Admin reassignment' })}
              size="sm"
              variant="outline"
              className="text-blue-600 hover:bg-blue-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              Reassign
            </Button>
            <Button 
              onClick={() => onAction?.('put_on_hold', order.id, { reason: 'Order paused by admin' })}
              size="sm"
              variant="outline"
              className="text-yellow-600 hover:bg-yellow-50"
            >
              <Clock className="h-4 w-4 mr-2" />
              Put on Hold
            </Button>
            <Button 
              onClick={() => onAction?.('mark_urgent', order.id, { reason: 'Marked as urgent' })}
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark Urgent
            </Button>
          </div>
        );
      }
      
      if (order.status === 'Submitted') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('approve', order.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => onAction?.('request_revision', order.id)}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            <Button 
              onClick={() => onAction?.('reject', order.id)}
              size="sm"
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        );
      }

      if (order.status === 'In Progress') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('make_available', order.id)}
              size="sm"
              variant="outline"
              className="text-orange-600 hover:bg-orange-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Make Available
            </Button>
            <Button 
              onClick={() => onAction?.('reassign', order.id, { reason: 'Admin reassignment' })}
              size="sm"
              variant="outline"
            >
              <UserX className="h-4 w-4 mr-2" />
              Reassign
            </Button>
            <Button 
              onClick={() => onAction?.('put_on_hold', order.id)}
              size="sm"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              Put on Hold
            </Button>
          </div>
        );
      }

      if (order.status === 'Revision') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('make_available', order.id)}
              size="sm"
              variant="outline"
              className="text-orange-600 hover:bg-orange-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Make Available
            </Button>
            <Button 
              onClick={() => onAction?.('approve', order.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => onAction?.('reject', order.id)}
              size="sm"
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        );
      }
    }

    return null;
  };

  const handleAutoBid = () => {
    if (!onConfirm) return;
    const autoConfirmation: WriterConfirmation = {
      id: `auto-conf-${Date.now()}`,
      hasReadInstructions: true,
      hasUnderstoodRequirements: true,
      canMeetDeadline: true,
      hasNoConflicts: true,
      additionalNotes: '',
      confirmedAt: new Date().toISOString(),
      writerId: 'pending-writer'
    };
    const autoQuestions: WriterQuestion[] = [];
    onConfirm(order.id, autoConfirmation, autoQuestions);
  };

  const handleReassignOrder = (reason: string) => {
    if (onAction) {
      onAction('reassign', order.id, { reason, writerId: 'current-writer' });
    }
    setShowReassignmentModal(false);
  };

  const handleSubmitToAdmin = (submission: {
    files: import('../types/order').UploadedFile[];
    notes: string;
    estimatedCompletionTime?: string;
  }) => {
    if (onAction) {
      onAction('submit_to_admin', order.id, submission);
    }
    setShowSubmitToAdminModal(false);
  };

  const handleSubmitRevision = (submission: {
    files: import('../types/order').UploadedFile[];
    notes: string;
    revisionNotes?: string;
  }) => {
    if (onAction) {
      onAction('resubmit', order.id, {
        ...submission,
        revisionNotes: submission.revisionNotes
      });
    }
    setShowSubmitRevisionModal(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">

        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg text-gray-900 line-clamp-2">
                {order.title}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {order.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              {getStatusBadge(order.status)}
              <span className="text-xs text-gray-500 font-mono">
                {order.id}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Academic Details */}
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Discipline:</span>
                <span className="font-medium">{order.discipline}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{order.paperType}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileType className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{order.format}</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Requirements */}
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{order.pages}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-gray-600">Words:</span>
                <span className="font-medium">{order.words.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Total Price:</span>
                <span className="font-bold text-green-600">KES {(order.pages * 350).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">CPP:</span>
                <span className="font-medium text-blue-600">KES 350</span>
              </div>

              {order.fineAmount && order.fineAmount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-600">Fine:</span>
                  <span className="font-medium text-red-600">KES {order.fineAmount.toLocaleString()}</span>
                </div>
              )}


            </div>
          </div>

          {/* Deadline and Status */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(order.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDeadlineStatus().bg} ${getDeadlineStatus().color}`}>
                {getDeadlineStatus().text}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {renderActionButtons()}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(order)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          {((order.clientMessages || []).length > 0 || (order.uploadedFiles || []).length > 0) && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
              {(order.clientMessages || []).length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {(order.clientMessages || []).length} message{(order.clientMessages || []).length !== 1 ? 's' : ''}
                </span>
              )}
              {(order.uploadedFiles || []).length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {(order.uploadedFiles || []).length} file{(order.uploadedFiles || []).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Reassignment Modal */}
      <OrderReassignmentModal
        order={order}
        isOpen={showReassignmentModal}
        onClose={() => setShowReassignmentModal(false)}
        onConfirm={handleReassignOrder}
      />

      {/* Submit to Admin Modal */}
      <SubmitToAdminModal
        order={order}
        isOpen={showSubmitToAdminModal}
        onClose={() => setShowSubmitToAdminModal(false)}
        onSubmit={handleSubmitToAdmin}
      />

      {/* Submit Revision Modal */}
      <SubmitRevisionModal
        order={order}
        isOpen={showSubmitRevisionModal}
        onClose={() => setShowSubmitRevisionModal(false)}
        onSubmit={handleSubmitRevision}
      />
    </>
  );
}
