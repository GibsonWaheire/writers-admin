import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  AlertTriangle,
  CheckCircle,
  User,
  DollarSign,
  FileText
} from 'lucide-react';
import { AssignedOrderCard } from '../../components/AssignedOrderCard';
import { BidOrdersCard } from '../../components/BidOrdersCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';
import { getWriterIdForUser } from '../../utils/writer';

export default function AssignedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { 
    orders,
    handleOrderAction
  } = useOrders();
  
  const { user } = useAuth();
  const currentWriterId = getWriterIdForUser(user?.id);

  // Get assigned orders for current writer (including all assigned and in-progress orders)
  // This includes orders picked by the writer (which go directly to 'Assigned' status)
  const assignedOrders = orders.filter(order => 
    order.writerId === currentWriterId && 
    ['Awaiting Approval', 'Assigned', 'Confirmed', 'In Progress', 'Submitted', 'Revision'].includes(order.status)
  );

  // Get recently picked orders by this writer (synced with admin view)
  // These are orders the writer picked themselves (pickedBy === 'writer')
  const recentlyPickedOrders = orders.filter(order => 
    order.pickedBy === 'writer' && 
    order.writerId === currentWriterId && 
    ['Awaiting Approval'].includes(order.status as string)
  ).sort((a, b) => {
    // Sort by assignedAt or updatedAt, most recent first
    const dateA = new Date(a.assignedAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.assignedAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  // Filter orders based on search and status
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredOrders = filterOrders(assignedOrders);

  const handleStartWork = async (orderId: string, data: any) => {
    try {
      await handleOrderAction('start_work', orderId, data);
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  const handleRequestReassignment = async (orderId: string, data: any) => {
    try {
      await handleOrderAction('make_available', orderId, {
        ...data,
        source: 'writer_reassignment'
      });
    } catch (error) {
      console.error('Failed to request reassignment:', error);
    }
  };

  const handleUploadFiles = async (orderId: string, files: any[]) => {
    try {
      await handleOrderAction('upload_files', orderId, { files });
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  };

  const handleSubmitWork = async (orderId: string, data: any) => {
    try {
      await handleOrderAction('submit_to_admin', orderId, data);
    } catch (error) {
      console.error('Failed to submit work:', error);
    }
  };

  const handleConfirmAssignment = async (orderId: string, confirmation: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => {
    try {
      await handleOrderAction('confirm', orderId, confirmation);
    } catch (error) {
      console.error('Failed to confirm assignment:', error);
    }
  };

  const handleDeclineAssignment = async (orderId: string, reason: string) => {
    try {
      await handleOrderAction('make_available', orderId, { reason });
    } catch (error) {
      console.error('Failed to decline assignment:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, data?: any) => {
    try {
      await handleOrderAction(action, orderId, data);
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to perform order action:', error);
    }
  };

  // Get order counts by status
  const statusCounts = {
    'Awaiting Approval': assignedOrders.filter(o => (o.status as string) === 'Awaiting Approval').length,
    'Confirmed': assignedOrders.filter(o => (o.status as string) === 'Confirmed').length,
    'In Progress': assignedOrders.filter(o => o.status === 'In Progress').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Orders</h1>
          <p className="text-gray-600 mt-1">Manage your assigned orders and track progress</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredOrders.length} Active Orders
        </Badge>
      </div>

      {/* Awaiting Approval Alert */}
      {statusCounts['Awaiting Approval'] > 0 && (
        <Card className="border-orange-400 border-2 bg-gradient-to-r from-orange-50 to-amber-50 shadow-xl animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-900 mb-1">
                  ⚠️ {statusCounts['Awaiting Approval']} Order{statusCounts['Awaiting Approval'] !== 1 ? 's' : ''} Awaiting Admin Approval
                </h3>
                <p className="text-orange-800 font-medium">
                  You have bid on {statusCounts['Awaiting Approval']} order{statusCounts['Awaiting Approval'] !== 1 ? 's' : ''} that {statusCounts['Awaiting Approval'] === 1 ? 'is' : 'are'} waiting for admin approval. 
                  Once approved, {statusCounts['Awaiting Approval'] === 1 ? 'it will' : 'they will'} appear as "Assigned" and you can start working.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{assignedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Awaiting Approval</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts['Awaiting Approval']}</p>
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts['In Progress']}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {assignedOrders.reduce((sum, order) => 
                    sum + (order.totalPriceKES || order.pages * 350), 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bid Orders */}
      {recentlyPickedOrders.length > 0 && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-5 w-5" />
              Recent Bid Orders ({recentlyPickedOrders.length})
            </CardTitle>
            <p className="text-sm text-blue-700 mt-1">
              Orders you have bid on and are waiting for admin approval
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyPickedOrders.slice(0, 10).map((order) => (
                <BidOrdersCard
                  key={order.id}
                  order={order}
                  onView={handleViewOrder}
                  userRole="writer"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                placeholder="Search assigned orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <AssignedOrderCard
              key={order.id}
              order={order}
              onView={handleViewOrder}
              onStartWork={handleStartWork}
              onRequestReassignment={handleRequestReassignment}
              onConfirmAssignment={handleConfirmAssignment}
              onDeclineAssignment={handleDeclineAssignment}
              onSubmitWork={handleSubmitWork}
              onUploadFiles={handleUploadFiles}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assigned Orders</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter
                  ? "No orders match your current filters. Try adjusting your search criteria."
                  : "You don't have any assigned orders at the moment. Browse available orders to get started."
                }
              </p>
              {(searchTerm || statusFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
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
          userRole={user?.role || 'writer'}
        />
      )}
    </div>
  );
}
