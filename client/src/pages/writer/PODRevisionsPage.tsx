/**
 * Writer POD Revisions Page
 * Writers can view POD orders requiring revision and submit revised work
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  RefreshCw,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Upload,
  Send,
  Truck
} from 'lucide-react';
import { PODOrderCard } from '../../components/PODOrderCard';
import { PODSubmitModal } from '../../components/PODSubmitModal';
import { usePOD } from '../../contexts/PODContext';
import { useAuth } from '../../contexts/AuthContext';
import { getWriterIdForUser } from '../../utils/writer';
import type { PODOrder } from '../../types/pod';

export default function PODRevisionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PODOrder | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState<PODOrder | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const { 
    podOrders
  } = usePOD();
  
  const { user } = useAuth();
  const currentWriterId = getWriterIdForUser(user?.id);

  // Get POD revision orders for current writer
  const revisionPODOrders = podOrders.filter(order => 
    order.writerId === currentWriterId && 
    order.status === 'Revision Required'
  );

  // Filter orders based on search and priority
  const filterOrders = (orders: PODOrder[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesPriority = true;
      if (priorityFilter) {
        const deadline = new Date(order.deadline);
        const now = new Date();
        const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        switch (priorityFilter) {
          case 'urgent':
            matchesPriority = hoursLeft <= 6;
            break;
          case 'high':
            matchesPriority = hoursLeft > 6 && hoursLeft <= 24;
            break;
          case 'normal':
            matchesPriority = hoursLeft > 24;
            break;
        }
      }
      
      return matchesSearch && matchesPriority;
    });
  };

  const filteredOrders = filterOrders(revisionPODOrders);

  const handleSubmitRevision = (order: PODOrder) => {
    setSubmittingOrder(order);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitRevisionConfirm = async (submission: {
    files: File[];
    notes: string;
  }) => {
    if (!submittingOrder) return;

    try {
      // The PODSubmitModal handles the submission via handlePODOrderAction
      // This is just for closing the modal
      setIsSubmitModalOpen(false);
      setSubmittingOrder(null);
      
      // Show success message
      alert('POD revision submitted successfully! Admin will review your submission.');
    } catch (error) {
      console.error('Failed to submit POD revision:', error);
      alert('Failed to submit POD revision. Please try again.');
    }
  };

  // Get deadline status
  const getDeadlineStatus = (order: PODOrder) => {
    const deadline = new Date(order.deadline);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft <= 0) return 'overdue';
    if (hoursLeft <= 6) return 'urgent';
    if (hoursLeft <= 24) return 'warning';
    return 'normal';
  };

  const urgentRevisions = revisionPODOrders.filter(order => ['overdue', 'urgent'].includes(getDeadlineStatus(order)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POD Revision Orders</h1>
          <p className="text-gray-600 mt-1">Complete POD revisions based on feedback and resubmit</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredOrders.length} POD Revisions
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total POD Revisions</p>
                <p className="text-2xl font-bold text-gray-900">{revisionPODOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{urgentRevisions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Action</p>
                <p className="text-2xl font-bold text-gray-900">{revisionPODOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">POD Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {revisionPODOrders.reduce((sum, order) => 
                    sum + (order.pages * 350), 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search POD revision orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent (&lt; 6 hours)</option>
              <option value="high">High (&lt; 24 hours)</option>
              <option value="normal">Normal (&gt; 24 hours)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                    
                    {/* Revision Feedback from Admin */}
                    {order.revisionNotes && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-2">POD Revision Required</h4>
                            <p className="text-sm text-red-800 whitespace-pre-wrap">{order.revisionNotes}</p>
                            {order.revisionCount && order.revisionCount > 0 && (
                              <p className="text-xs text-red-700 mt-2">
                                Revision #{order.revisionCount}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Pages:</span>
                        <span className="font-medium ml-2">{order.pages}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium ml-2">{new Date(order.deadline).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">POD Amount:</span>
                        <span className="font-medium ml-2 text-green-600">KES {(order.pages * 350).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Files:</span>
                        <span className="font-medium ml-2">
                          {order.uploadedFiles?.length || 0} uploaded
                        </span>
                      </div>
                    </div>

                    {/* File Upload Status */}
                    {order.uploadedFiles && order.uploadedFiles.length > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {order.uploadedFiles.length} file{order.uploadedFiles.length !== 1 ? 's' : ''} ready to resubmit
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            No files uploaded yet. Upload files before resubmitting.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {/* Submit POD Revision Button */}
                  <Button
                    size="sm"
                    onClick={() => handleSubmitRevision(order)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {order.uploadedFiles && order.uploadedFiles.length > 0 ? (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Resubmit POD Revision
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Resubmit
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No POD Revision Orders</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || priorityFilter
                    ? "No POD orders match your current filters. Try adjusting your search criteria."
                    : "You don't have any POD orders requiring revisions at the moment."
                  }
                </p>
                {(searchTerm || priorityFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPriorityFilter("");
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* POD Order Card Modal (for viewing details) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <PODOrderCard order={selectedOrder} />
            <Button
              variant="outline"
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Submit POD Revision Modal */}
      {submittingOrder && (
        <PODSubmitModal
          isOpen={isSubmitModalOpen}
          onClose={() => {
            setIsSubmitModalOpen(false);
            setSubmittingOrder(null);
          }}
          order={submittingOrder}
          onSubmit={handleSubmitRevisionConfirm}
        />
      )}
    </div>
  );
}

