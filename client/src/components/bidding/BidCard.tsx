/**
 * Enhanced Bid Card Component
 * Displays bid information with status and actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import type { Order } from '../../types/order';

export interface BidInfo {
  orderId: string;
  orderTitle: string;
  writerId: string;
  writerName: string;
  bidAt: string;
  bidAmount?: number;
  bidNotes?: string;
  status: 'pending' | 'approved' | 'declined';
  order?: Order;
}

export interface BidCardProps {
  bid: BidInfo;
  userRole: 'admin' | 'writer';
  onApprove?: (bidId: string) => void;
  onDecline?: (bidId: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export function BidCard({ 
  bid, 
  userRole, 
  onApprove, 
  onDecline, 
  onViewOrder 
}: BidCardProps) {
  const getStatusBadge = () => {
    switch (bid.status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">{bid.orderTitle}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeAgo(bid.bidAt)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Writer:</span>
            <span className="font-medium">{bid.writerName}</span>
          </div>
          
          {bid.bidAmount && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Bid Amount:</span>
              <span className="font-medium text-green-600">KES {bid.bidAmount.toLocaleString()}</span>
            </div>
          )}
          
          {bid.bidNotes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4" />
                Notes:
              </div>
              <p className="text-sm text-gray-600">{bid.bidNotes}</p>
            </div>
          )}
          
          {bid.order && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium ml-2">{bid.order.pages}</span>
              </div>
              <div>
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium ml-2">
                  {new Date(bid.order.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
          
          {userRole === 'admin' && bid.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onApprove?.(bid.orderId)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => onDecline?.(bid.orderId)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          )}
          
          {onViewOrder && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewOrder(bid.orderId)}
            >
              View Order Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

