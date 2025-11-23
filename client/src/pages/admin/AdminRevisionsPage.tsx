/**
 * Admin Revisions Page
 * Admin can APPROVE revisions (sets to Completed) and DELETE tasks
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle, 
  Trash2, 
  Eye, 
  RefreshCw,
  AlertTriangle,
  FileText,
  Clock,
  User,
  DollarSign,
  XCircle
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

export default function AdminRevisionsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const { 
    orders, 
    handleOrderAction,
    deleteOrder
  } = useOrders();
  const { user } = useAuth();

  // Get orders with revision files submitted (status is Submitted with revisionFiles)
  const revisionOrders = orders.filter(order => 
    order.status === 'Submitted' && 
    order.revisionFiles && 
    order.revisionFiles.length > 0
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleApprove = async (order: Order) => {
    if (!confirm(`Are you sure you want to APPROVE this revision? The order will be marked as Completed and the writer will see it in their Completed Orders.`)) {
      return;
    }

    try {
      setIsApproving(order.id);
      
      // APPROVE action - this sets status to Completed
      await handleOrderAction('approve', order.id, {
        adminId: user?.id,
        notes: 'Revision approved by admin'
      });

      // Refresh to see updated status
      window.location.reload();
    } catch (error) {
      console.error('Failed to approve revision:', error);
      alert('Failed to approve revision. Please try again.');
    } finally {
      setIsApproving(null);
    }
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Are you sure you want to DELETE this revision task? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(order.id);
      await deleteOrder(order.id);
      // Order will be removed from the list automatically
    } catch (error) {
      console.error('Failed to delete revision:', error);
      alert('Failed to delete revision. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOrderActionLocal = (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    handleOrderAction(action, orderId, {
      ...additionalData,
      adminId: user?.id
    });
    
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just submitted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revision Reviews</h1>
          <p className="text-gray-600 mt-1">Review and approve revision submissions from writers</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-orange-50 text-orange-700 border-orange-200">
          {revisionOrders.length} Pending Review
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Revisions</p>
                <p className="text-2xl font-bold text-gray-900">{revisionOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Approve</p>
                <p className="text-2xl font-bold text-gray-900">{revisionOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">
                  {revisionOrders.reduce((sum, order) => sum + (order.revisionFiles?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revision Orders List */}
      <div className="space-y-4">
        {revisionOrders.length > 0 ? (
          revisionOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Revision Submitted
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{order.description}</p>
                    
                    {/* Writer Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Writer:</span>
                        <span className="font-medium">{order.assignedWriter || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {order.revisionSubmittedAt 
                            ? getTimeAgo(order.revisionSubmittedAt)
                            : getTimeAgo(order.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Files:</span>
                        <span className="font-medium">{order.revisionFiles?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium text-green-600">
                          KES {(order.pages * 350).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Revision Notes */}
                    {order.revisionResponseNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-blue-700 mb-1">Writer's Revision Notes:</p>
                        <p className="text-sm text-blue-800">{order.revisionResponseNotes}</p>
                      </div>
                    )}

                    {/* Original Revision Request */}
                    {order.revisionExplanation && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-red-700 mb-1">Original Revision Request:</p>
                            <p className="text-xs text-red-800 line-clamp-2">{order.revisionExplanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ACTION BUTTONS - APPROVE is PRIMARY */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* DELETE BUTTON */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(order)}
                      disabled={isDeleting === order.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      {isDeleting === order.id ? (
                        'Deleting...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                    
                    {/* APPROVE BUTTON - PRIMARY ACTION */}
                    <Button
                      size="lg"
                      onClick={() => handleApprove(order)}
                      disabled={isApproving === order.id}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-lg"
                    >
                      {isApproving === order.id ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          APPROVE REVISION
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Revisions Pending</h3>
              <p className="text-gray-500">
                All revision submissions have been reviewed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onAction={handleOrderActionLocal}
          userRole="admin"
        />
      )}
    </div>
  );
}

