/**
 * Admin POD Revisions Page
 * Admin can APPROVE POD revisions and REQUEST another revision
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  FileText,
  Clock,
  User,
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { PODOrderCard } from '../../components/PODOrderCard';
import { RequestPODRevisionModal } from '../../components/RequestPODRevisionModal';
import { usePOD } from '../../contexts/PODContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PODOrder } from '../../types/pod';

export default function AdminPODRevisionsPage() {
  const [selectedOrder, setSelectedOrder] = useState<PODOrder | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { 
    podOrders, 
    handlePODOrderAction
  } = usePOD();
  const { user } = useAuth();

  // Get POD orders with revision files submitted (status is Submitted to Admin with revisionCount > 0)
  const revisionPODOrders = podOrders.filter(order => 
    order.status === 'Submitted to Admin' && 
    (order.revisionCount && order.revisionCount > 0)
  );

  // Filter orders
  const filteredOrders = revisionPODOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedWriter && order.assignedWriter.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleViewOrder = (order: PODOrder) => {
    setSelectedOrder(order);
  };

  const handleApprove = async (order: PODOrder) => {
    if (!confirm(`Are you sure you want to APPROVE this POD revision? The order will be marked as Admin Approved and ready for delivery.`)) {
      return;
    }

    try {
      setIsApproving(order.id);
      
      // APPROVE action - this sets status to Admin Approved
      await handlePODOrderAction('admin_approve', order.id, {
        adminId: user?.id,
        notes: 'POD revision approved by admin'
      });

      // Refresh to see updated status
      window.location.reload();
    } catch (error) {
      console.error('Failed to approve POD revision:', error);
      alert('Failed to approve POD revision. Please try again.');
    } finally {
      setIsApproving(null);
    }
  };

  const handleRequestRevision = (order: PODOrder) => {
    setSelectedOrder(order);
    setIsRevisionModalOpen(true);
  };

  const handleRequestRevisionConfirm = async (orderId: string, explanation: string, notes?: string) => {
    try {
      await handlePODOrderAction('admin_reject', orderId, {
        adminId: user?.id,
        notes: explanation,
        explanation: explanation
      });
      
      setIsRevisionModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to request POD revision:', error);
      alert('Failed to request revision. Please try again.');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">POD Revision Reviews</h1>
          <p className="text-gray-600 mt-1">Review and approve POD revision submissions from writers</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-orange-50 text-orange-700 border-orange-200">
          {filteredOrders.length} Pending Review
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search POD revisions by title, writer, or discipline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Revisions</option>
                <option value="first">First Revision</option>
                <option value="second">Second Revision</option>
                <option value="third">Third+ Revision</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending POD Revisions</p>
                <p className="text-2xl font-bold text-gray-900">{revisionPODOrders.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{revisionPODOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total POD Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {revisionPODOrders.reduce((sum, order) => sum + (order.pages * 350), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POD Revision Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        POD Revision #{order.revisionCount || 1}
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
                          {order.revisionRequestedAt 
                            ? getTimeAgo(order.revisionRequestedAt)
                            : getTimeAgo(order.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Files:</span>
                        <span className="font-medium">{order.uploadedFiles?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">POD Amount:</span>
                        <span className="font-medium text-green-600">
                          KES {(order.pages * 350).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Revision Notes */}
                    {order.revisionNotes && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-red-700 mb-1">Previous Revision Request:</p>
                        <p className="text-sm text-red-800">{order.revisionNotes}</p>
                      </div>
                    )}

                    {/* Admin Review Notes (if any) */}
                    {order.adminReviewNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-1">Admin Review Notes:</p>
                        <p className="text-sm text-blue-800">{order.adminReviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ACTION BUTTONS */}
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
                    {/* REQUEST ANOTHER REVISION BUTTON */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestRevision(order)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Another Revision
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
                          APPROVE POD REVISION
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
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No POD Revisions Pending</h3>
              <p className="text-gray-500">
                All POD revision submissions have been reviewed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Request POD Revision Modal */}
      {selectedOrder && (
        <RequestPODRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => {
            setIsRevisionModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onRequestRevision={handleRequestRevisionConfirm}
        />
      )}
    </div>
  );
}

