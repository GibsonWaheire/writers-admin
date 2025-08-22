
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
  Upload,
  Edit,
  ThumbsUp,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion } from '../types/order';

interface OrderCardProps {
  order: Order;
  userRole: 'writer' | 'admin';
  onView: (order: Order) => void;
  onAction?: (action: string, orderId: string) => void;
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      'Available': { variant: 'outline' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🟢' },

      'Pending Approval': { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
      'Awaiting Confirmation': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏳' },
      'Confirmed': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
      'In Progress': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🔵' },
      'Pending Review': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🟠' },
      'Completed': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
      'Rejected': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
      'Requires Admin Approval': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50', icon: '⚠️' },
      'Upload to Client': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '📤' },
      'Editor Revision': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50', icon: '✏️' },
      'Approved': { variant: 'default' as const, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👍' },
      'Awaiting Payment': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
      'Pay Later': { variant: 'outline' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '💳' },

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
            onClick={() => setShowConfirmationModal(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Pick Order
          </Button>
        );
      }
      
      if (order.status === 'Awaiting Confirmation') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowConfirmationModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Confirm Order
            </Button>
          </div>
        );
      }
      
      if (order.status === 'In Progress') {
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction?.('submit', order.id)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Work
            </Button>
            <Button 
              onClick={() => onAction?.('upload_to_client', order.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload to Client
            </Button>
          </div>
        );
      }

      if (order.status === 'Pending Review') {
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

      if (order.status === 'Editor Revision') {
        return (
          <Button 
            onClick={() => onAction?.('submit', order.id)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Revision
          </Button>
        );
      }

      if (order.status === 'Upload to Client') {
        return (
          <Button 
            onClick={() => onAction?.('approve_final', order.id)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Mark as Final
          </Button>
        );
      }

      if (order.status === 'Approved') {
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
          <Button 
            onClick={() => onAction?.('assign', order.id)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Assign Order
          </Button>
        );
      }
      
      if (order.status === 'Pending Approval') {
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

  const handleConfirmOrder = (confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    if (onConfirm) {
      onConfirm(order.id, confirmation, questions);
    }
    setShowConfirmationModal(false);
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
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-green-600">KES {order.priceKES?.toLocaleString() || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">CPP:</span>
                <span className="font-medium text-blue-600">KES {order.cpp?.toLocaleString() || 'N/A'}</span>
              </div>


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
          {(order.clientMessages.length > 0 || order.uploadedFiles.length > 0) && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
              {order.clientMessages.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {order.clientMessages.length} message{order.clientMessages.length !== 1 ? 's' : ''}
                </span>
              )}
              {order.uploadedFiles.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {order.uploadedFiles.length} file{order.uploadedFiles.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Confirmation Modal */}
      {showConfirmationModal && (
        <OrderConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          order={order}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
}
