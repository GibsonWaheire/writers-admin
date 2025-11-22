import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, User, Clock, DollarSign, FileText } from 'lucide-react';
import type { Order } from '../types/order';

interface BidOrdersCardProps {
  order: Order;
  writerName?: string;
  writerEmail?: string;
  onView: (order: Order) => void;
  userRole: 'writer' | 'admin';
}

export function BidOrdersCard({ 
  order, 
  writerName, 
  writerEmail, 
  onView, 
  userRole 
}: BidOrdersCardProps) {
  const bidAt = order.assignedAt || order.updatedAt;
  const orderValue = (order.pages || 0) * 350;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-gray-900">{order.title}</h4>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              {order.status}
            </Badge>
            {order.status === 'Awaiting Approval' && (
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
                📝 Bid Pending Approval
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-700">Writer:</span>{' '}
                  <span className="font-semibold text-blue-700">
                    {order.assignedWriter || writerName || 'Unknown'}
                  </span>
                  {writerEmail && (
                    <div className="text-xs text-gray-500">{writerEmail}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <span className="font-medium text-gray-700">Bid Placed:</span>{' '}
                <span className="text-gray-900">
                  {bidAt ? new Date(bidAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <span className="font-medium text-gray-700">Deadline:</span>{' '}
                <span className="text-gray-900">
                  {new Date(order.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <span className="font-medium text-gray-700">Value:</span>{' '}
                <span className="font-semibold text-green-700">
                  KES {orderValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {order.orderNumber && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Order #{order.orderNumber}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(order)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

