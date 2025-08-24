import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Eye,
  Play,
  RotateCcw,
  User
} from 'lucide-react';
import { AssignmentConfirmationModal } from './AssignmentConfirmationModal';
import { UnifiedAssignmentModal } from './UnifiedAssignmentModal';
import type { Order } from '../types/order';
import type { AssignmentHistory } from '../types/notification';

interface AssignedOrderCardProps {
  order: Order;
  assignment?: AssignmentHistory;
  onView: (order: Order) => void;
  onConfirmAssignment: (orderId: string, confirmation: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => void;
  onDeclineAssignment: (orderId: string, reason: string) => void;
  onStartWork: (orderId: string, data: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => void;
  onRequestReassignment: (orderId: string, data: {
    reason: string;
    additionalNotes?: string;
  }) => void;
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
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [unifiedModalAction, setUnifiedModalAction] = useState<'start_work' | 'reassign'>('start_work');

  const needsConfirmation = order.status === 'Assigned' && assignment?.status === 'pending';
  const canStartWork = order.status === 'Assigned' && assignment?.status === 'confirmed';
  const canReassign = order.status === 'Assigned' || order.status === 'In Progress';

  const handleStartWork = () => {
    setUnifiedModalAction('start_work');
    setShowUnifiedModal(true);
  };

  const handleReassign = () => {
    setUnifiedModalAction('reassign');
    setShowUnifiedModal(true);
  };

  const handleUnifiedAction = (actionType: 'start_work' | 'reassign', data: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
    reason?: string;
  }) => {
    if (actionType === 'start_work') {
      onStartWork(order.id, data);
    } else if (actionType === 'reassign') {
      onRequestReassignment(order.id, {
        reason: data.reason || 'No reason provided',
        additionalNotes: data.additionalNotes
      });
    }
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

  const deadlineStatus = getDeadlineStatus();

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{order.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {order.discipline}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {order.paperType}
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {order.pages} pages
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {order.format}
                </Badge>
              </div>
            </div>
            
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                KES {order.totalPriceKES?.toLocaleString() || (order.pages * 350).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Earnings</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Deadline Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                variant={order.status === 'Assigned' ? 'default' : 'secondary'}
                className={order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : ''}
              >
                {order.status}
              </Badge>
              <div className={`text-sm ${deadlineStatus.color} ${deadlineStatus.bg} px-2 py-1 rounded-full`}>
                {deadlineStatus.text}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Due: {new Date(order.deadline).toLocaleDateString()}
            </div>
          </div>

          {/* Assignment Details */}
          {assignment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Assignment Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Assigned:</span>
                  <span className="text-blue-900 ml-2">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Priority:</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {assignment.priority}
                  </Badge>
                </div>
                {assignment.notes && (
                  <div className="col-span-2">
                    <span className="text-blue-700">Notes:</span>
                    <span className="text-blue-900 ml-2">{assignment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
                {canStartWork && (
                  <Button
                    size="sm"
                    onClick={handleStartWork}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Work
                  </Button>
                )}
                {canReassign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReassign}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reassign
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Assignment */}
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

      {/* Unified Modal for Start Work and Reassign */}
      <UnifiedAssignmentModal
        isOpen={showUnifiedModal}
        onClose={() => setShowUnifiedModal(false)}
        order={order}
        assignment={assignment}
        actionType={unifiedModalAction}
        onConfirm={handleUnifiedAction}
      />
    </>
  );
}
