import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { AssignedOrderCard } from '../../components/AssignedOrderCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

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
  const currentWriterId = user?.id || 'writer-1';

  // Get assigned orders for current writer
  const assignedOrders = orders.filter(order => 
    order.writerId === currentWriterId && 
    ['Awaiting Confirmation', 'Confirmed', 'In Progress'].includes(order.status)
  );

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

  const handleSubmitWork = async (orderId: string, data: any) => {
    try {
      await handleOrderAction('submit_to_admin', orderId, data);
    } catch (error) {
      console.error('Failed to submit work:', error);
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
    'Awaiting Confirmation': assignedOrders.filter(o => o.status === 'Awaiting Confirmation').length,
    'Confirmed': assignedOrders.filter(o => o.status === 'Confirmed').length,
    'In Progress': assignedOrders.filter(o => o.status === 'In Progress').length
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

  const urgentOrders = assignedOrders.filter(order => ['overdue', 'urgent'].includes(getDeadlineStatus(order)));

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
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{urgentOrders.length}</p>
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
              <option value="Awaiting Confirmation">Awaiting Confirmation</option>
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
              onStartWork={handleStartWork}
              onRequestReassignment={handleRequestReassignment}
              onSubmitWork={handleSubmitWork}
              onViewDetails={handleViewOrder}
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
