import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Search, 
  FileText,
  Hand,
  Eye
} from 'lucide-react';
import { PickedOrdersCard } from '../../components/PickedOrdersCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useUsers } from '../../contexts/UsersContext';
import type { Order } from '../../types/order';

export default function AdminPickedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [writerFilter, setWriterFilter] = useState<string>("");

  const { orders, handleOrderAction } = useOrders();
  const { writers } = useUsers();

  // Get all orders picked by writers
  const pickedOrders = orders.filter(order => 
    order.pickedBy === 'writer' && 
    order.writerId && 
    ['Assigned', 'In Progress', 'Submitted', 'Revision'].includes(order.status as string)
  ).sort((a, b) => {
    // Sort by assignedAt or updatedAt, most recent first
    const dateA = new Date(a.assignedAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.assignedAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  // Filter orders based on search, status, and writer
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      const matchesWriter = !writerFilter || order.writerId === writerFilter;
      
      return matchesSearch && matchesStatus && matchesWriter;
    });
  };

  const filteredOrders = filterOrders(pickedOrders);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    await handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get status counts
  const statusCounts = pickedOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statuses = ['Assigned', 'In Progress', 'Submitted', 'Revision'];

  // Get unique writers who have picked orders
  const writersWithPickedOrders = Array.from(
    new Set(pickedOrders.map(order => order.writerId).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Picked Orders</h1>
          <p className="text-gray-600 mt-1">
            Orders that writers have picked and are currently working on
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hand className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Picked</p>
                <p className="text-2xl font-bold text-gray-900">{pickedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {statuses.map((status) => (
          <Card key={status}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={writerFilter}
              onChange={(e) => setWriterFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Writers</option>
              {writersWithPickedOrders.map(writerId => {
                const writer = writers.find(w => w.id === writerId);
                const pickedOrder = pickedOrders.find(o => o.writerId === writerId);
                return (
                  <option key={writerId} value={writerId}>
                    {writer?.name || pickedOrder?.assignedWriter || writerId}
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Picked Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Picked Orders by Writers ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const writer = writers.find(w => w.id === order.writerId);
                return (
                  <PickedOrdersCard
                    key={order.id}
                    order={order}
                    writerName={writer?.name}
                    writerEmail={writer?.email}
                    onView={handleViewOrder}
                    userRole="admin"
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Hand className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No picked orders found</p>
              <p className="text-gray-400 text-sm mt-2">
                {pickedOrders.length === 0 
                  ? "No writers have picked any orders yet."
                  : "No orders match your search criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userRole="admin"
          onAction={handleOrderActionLocal}
        />
      )}
    </div>
  );
}

