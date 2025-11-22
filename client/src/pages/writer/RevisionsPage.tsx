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
  MessageSquare,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { OrderCard } from '../../components/OrderCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { SubmitRevisionModal } from '../../components/SubmitRevisionModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

export default function RevisionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const { 
    orders,
    handleOrderAction
  } = useOrders();
  
  const { user } = useAuth();
  const currentWriterId = user?.id || 'writer-1';

  // Get revision orders for current writer
  const revisionOrders = orders.filter(order => 
    order.writerId === currentWriterId && 
    ['Revision Required', 'Revision Submitted', 'Under Revision Review'].includes(order.status)
  );

  // Filter orders based on search and priority
  const filterOrders = (orders: Order[]) => {
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

  const filteredOrders = filterOrders(revisionOrders);

  const handleSubmitRevision = async (orderId: string, data: any) => {
    try {
      await handleOrderAction('resubmit', orderId, data);
      setIsRevisionModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to submit revision:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, data?: any) => {
    try {
      if (action === 'submit_revision') {
        setIsModalOpen(false);
        setIsRevisionModalOpen(true);
        return;
      }
      
      await handleOrderAction(action, orderId, data);
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to perform order action:', error);
    }
  };

  // Get deadline status
  const getDeadlineStatus = (order: Order) => {
    const deadline = new Date(order.deadline);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft <= 0) return 'overdue';
    if (hoursLeft <= 6) return 'urgent';
    if (hoursLeft <= 24) return 'warning';
    return 'normal';
  };

  // Get order counts by status and priority
  const statusCounts = {
    'Revision Required': revisionOrders.filter(o => o.status === 'Revision Required').length,
    'Revision Submitted': revisionOrders.filter(o => o.status === 'Revision Submitted').length,
    'Under Revision Review': revisionOrders.filter(o => o.status === 'Under Revision Review').length
  };

  const urgentRevisions = revisionOrders.filter(order => ['overdue', 'urgent'].includes(getDeadlineStatus(order)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revision Orders</h1>
          <p className="text-gray-600 mt-1">Complete revisions based on feedback and resubmit</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredOrders.length} Revisions
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
                <p className="text-sm font-medium text-gray-600">Total Revisions</p>
                <p className="text-2xl font-bold text-gray-900">{revisionOrders.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{statusCounts['Revision Required']}</p>
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
                <p className="text-sm font-medium text-gray-600">Potential Recovery</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {revisionOrders.reduce((sum, order) => 
                    sum + (order.totalPriceKES || order.pages * 350), 0
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
                placeholder="Search revision orders..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewOrder}
              showActions={true}
              actions={
                order.status === 'Revision Required' ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsRevisionModalOpen(true);
                      }}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Submit Revision
                    </Button>
                  </div>
                ) : order.status === 'Revision Submitted' ? (
                  <Badge variant="secondary" className="w-full justify-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Under Review
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-full justify-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    In Review Process
                  </Badge>
                )
              }
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Revision Orders</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || priorityFilter
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You don't have any orders requiring revisions at the moment."
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
          userRole={user?.role || 'writer'}
        />
      )}

      {/* Submit Revision Modal */}
      {selectedOrder && (
        <SubmitRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => {
            setIsRevisionModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSubmit={handleSubmitRevision}
        />
      )}
    </div>
  );
}
