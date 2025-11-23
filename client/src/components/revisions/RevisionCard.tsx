/**
 * Revision Card Component
 * Enhanced card with CRUD actions for revision orders
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import type { Order } from '../../types/order';

export interface RevisionCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete?: (order: Order) => void;
  getDeadlineStatus: (order: Order) => 'overdue' | 'urgent' | 'warning' | 'normal';
}

export function RevisionCard({
  order,
  onView,
  onEdit,
  onDelete,
  getDeadlineStatus
}: RevisionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deadlineStatus = getDeadlineStatus(order);
  const hasRevisionFiles = order.revisionFiles && order.revisionFiles.length > 0;

  const getStatusColor = () => {
    switch (deadlineStatus) {
      case 'overdue':
        return 'border-l-red-500 bg-red-50/50';
      case 'urgent':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50';
      default:
        return 'border-l-orange-500';
    }
  };

  const getStatusBadge = () => {
    switch (deadlineStatus) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'urgent':
        return <Badge className="bg-orange-600">Urgent</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600">Due Soon</Badge>;
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm(`Are you sure you want to remove this revision from your list? This will not delete the order, but you'll need to access it through other pages.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(order);
    } catch (error) {
      console.error('Failed to delete revision:', error);
      alert('Failed to remove revision. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={`border-l-4 ${getStatusColor()} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
              {getStatusBadge()}
              {hasRevisionFiles && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Files Ready
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{order.description}</p>
            
            {/* Revision Feedback */}
            {order.revisionExplanation && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-red-900 text-sm mb-1">Revision Required</h4>
                    <p className="text-xs text-red-800 line-clamp-2">{order.revisionExplanation}</p>
                    {order.revisionCount && order.revisionCount > 0 && (
                      <p className="text-xs text-red-700 mt-1">
                        Revision #{order.revisionCount} • Score: {order.revisionScore || 10}/10
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Order Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium ml-1">{order.pages}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium ml-1">
                    {new Date(order.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium ml-1 text-green-600">
                    KES {(order.pages * 350).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600">Files:</span>
                  <span className="font-medium ml-1">
                    {order.revisionFiles?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onEdit(order)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
                'Removing...'
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

