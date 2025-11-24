import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  FileText,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

export default function PendingReviewPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const { 
    orders, 
    handleOrderAction, 
    refreshOrders
  } = useOrders();
  const { user } = useAuth();

  // Get orders that need admin review (Awaiting Approval status)
  const submittedOrders = orders.filter(order => 
    order.status === 'Awaiting Approval' && !(order.revisionFiles && order.revisionFiles.length > 0)
  );
  const revisionOrders = orders.filter(order => 
    (order.status === 'Awaiting Approval' || order.status === 'Submitted') && (order.revisionFiles && order.revisionFiles.length > 0)
  );
  const allPendingReview = [...revisionOrders, ...submittedOrders];

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    handleOrderAction(action, orderId, {
      ...additionalData,
      adminId: user?.id,
      notes: reviewNotes
    });
    
    setIsModalOpen(false);
    setSelectedOrder(null);
    setReviewNotes('');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just submitted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPriorityLevel = (order: Order) => {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 6) return 'urgent';
    if (hoursUntilDeadline < 24) return 'high';
    if (hoursUntilDeadline < 48) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const sortedOrders = allPendingReview.sort((a, b) => {
    const aPriority = getPriorityLevel(a);
    const bPriority = getPriorityLevel(b);
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
    
    const priorityDiff = (priorityOrder[aPriority as keyof typeof priorityOrder] || 3) - 
                        (priorityOrder[bPriority as keyof typeof priorityOrder] || 3);
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by submission time
    return new Date(b.submittedToAdminAt || b.updatedAt).getTime() - 
           new Date(a.submittedToAdminAt || a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Review</h1>
          <p className="text-muted-foreground">
            Orders submitted by writers awaiting admin review and approval
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshOrders}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Urgent Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {sortedOrders.filter(o => getPriorityLevel(o) === 'urgent').length}
            </div>
            <p className="text-xs text-red-600">&lt; 6 hours to deadline</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {sortedOrders.filter(o => getPriorityLevel(o) === 'high').length}
            </div>
            <p className="text-xs text-orange-600">&lt; 24 hours to deadline</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Submitted</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{submittedOrders.length}</div>
            <p className="text-xs text-blue-600">New submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Resubmissions</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{revisionOrders.length}</div>
            <p className="text-xs text-purple-600">After revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Orders Awaiting Review ({allPendingReview.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedOrders.length > 0 ? (
            <div className="space-y-4">
              {sortedOrders.map((order) => {
                const priority = getPriorityLevel(order);
                const isResubmission = (order.revisionFiles || []).length > 0;
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{order.title}</h3>
                          <Badge className={`${getPriorityColor(priority)} border`}>
                            {priority.toUpperCase()}
                          </Badge>
                          {isResubmission && (
                            <Badge variant="secondary">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Resubmitted
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Writer:</span> {order.assignedWriter || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {getTimeAgo(order.submittedToAdminAt || order.updatedAt)}
                          </div>
                          <div>
                            <span className="font-medium">Deadline:</span> {new Date(order.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Discipline:</span> {order.discipline}
                          </div>
                          <div>
                            <span className="font-medium">Pages:</span> {order.pages}
                          </div>
                          <div>
                            <span className="font-medium">Format:</span> {order.format}
                          </div>
                          <div>
                            <span className="font-medium">Value:</span> KES {(order.pages * 350).toLocaleString()}
                          </div>
                        </div>
                        
                        {order.submissionNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                              <MessageSquare className="h-4 w-4" />
                              Writer's Notes:
                            </div>
                            <p className="text-blue-600 text-sm">{order.submissionNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleOrderActionLocal('approve', order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {isResubmission ? 'Approve Revision' : 'Approve'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleOrderActionLocal('request_revision', order.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Revision
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOrderActionLocal('reject', order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">No orders are currently awaiting review.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
            setReviewNotes('');
          }}
          order={selectedOrder}
          userRole="admin"
          onAction={handleOrderActionLocal}
        />
      )}
    </div>
  );
}
