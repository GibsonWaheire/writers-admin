import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  Eye,
  Play,
  RefreshCw
} from 'lucide-react';
import { AssignmentConfirmationModal } from './AssignmentConfirmationModal';
import type { Order } from '../types/order';
import type { AssignmentHistory } from '../types/notification';

interface AssignedOrderCardProps {
  order: Order;
  assignment?: AssignmentHistory;
  onView: (order: Order) => void;
  onConfirmAssignment: (orderId: string, confirmation: any) => void;
  onDeclineAssignment: (orderId: string, reason: string) => void;
  onStartWork: (orderId: string) => void;
  onRequestReassignment: (orderId: string) => void;
}

export function AssignedOrderCard({
  order,
  assignment,
  onView,
  onConfirmAssignment,
  onDeclineAssignment,
  onStartWork,
  onRequestReassignment
}: AssignedOrderCardProps) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeadlineStatus = () => {
    const deadline = new Date(order.deadline);
    const now = new Date();
    const diffInHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) return { color: 'text-red-600', bg: 'bg-red-50', urgent: true };
    if (diffInHours < 24) return { color: 'text-orange-600', bg: 'bg-orange-50', urgent: true };
    if (diffInHours < 72) return { color: 'text-yellow-600', bg: 'bg-yellow-50', urgent: false };
    return { color: 'text-green-600', bg: 'bg-green-50', urgent: false };
  };

  const deadlineStatus = getDeadlineStatus();
  const needsConfirmation = assignment?.status === 'pending';
  const isAutoConfirmSoon = assignment && new Date(assignment.autoConfirmDeadline).getTime() - new Date().getTime() < 2 * 60 * 60 * 1000; // 2 hours

  return (
    <>
      <Card className={`border-l-4 ${
        needsConfirmation 
          ? 'border-l-yellow-500 bg-yellow-50' 
          : 'border-l-blue-500'
      } hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold line-clamp-1">{order.title}</h3>
                {assignment && (
                  <Badge className={`${getPriorityColor(assignment.priority)} border text-xs`}>
                    {assignment.priority}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {order.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{assignment?.assignedByName || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{assignment ? formatTimeAgo(assignment.assignedAt) : 'Recently'}</span>
                </div>
                {assignment?.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Custom deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-green-600 mb-1">
                {formatCurrency(order.pages * 350)}
              </div>
              <div className={`text-sm ${deadlineStatus.color}`}>
                Due: {order.deadline}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Assignment Info */}
          {assignment?.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 text-sm">Admin Notes:</p>
                  <p className="text-blue-700 text-sm">{assignment.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Warning */}
          {needsConfirmation && (
            <div className={`mb-4 p-3 rounded-lg ${isAutoConfirmSoon ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${isAutoConfirmSoon ? 'text-red-600' : 'text-yellow-600'}`} />
                <div>
                  <p className={`font-medium text-sm ${isAutoConfirmSoon ? 'text-red-800' : 'text-yellow-800'}`}>
                    {isAutoConfirmSoon ? 'Urgent: Auto-confirmation soon!' : 'Confirmation Required'}
                  </p>
                  <p className={`text-xs ${isAutoConfirmSoon ? 'text-red-700' : 'text-yellow-700'}`}>
                    {isAutoConfirmSoon 
                      ? 'This assignment will be auto-confirmed very soon. Please confirm or decline now.'
                      : 'Please confirm this assignment or it will be auto-confirmed.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Subject:</span>
              <p className="font-medium">{order.discipline}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{order.paperType}</p>
            </div>
            <div>
              <span className="text-gray-500">Pages:</span>
              <p className="font-medium">{order.pages}</p>
            </div>
            <div>
              <span className="text-gray-500">Format:</span>
              <p className="font-medium">{order.format}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(order)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            {needsConfirmation ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowConfirmationModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => onStartWork(order.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Work
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestReassignment(order.id)}
                  className="text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reassign
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmationModal && assignment && (
        <AssignmentConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          order={order}
          assignment={assignment}
          onConfirm={(confirmation) => {
            onConfirmAssignment(order.id, confirmation);
            setShowConfirmationModal(false);
          }}
          onDecline={(reason) => {
            onDeclineAssignment(order.id, reason);
            setShowConfirmationModal(false);
          }}
        />
      )}
    </>
  );
}
