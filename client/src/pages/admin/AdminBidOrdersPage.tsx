import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Search, 
  FileText,
  Hand,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  User
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useUsers } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

export default function AdminBidOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [writerFilter, setWriterFilter] = useState<string>("");

  const { orders, handleOrderAction } = useOrders();
  const { writers } = useUsers();
  const { user } = useAuth();

  // Get all orders with pending bids (orders stay Available, but have bids)
  const ordersWithBids = orders.filter(order => 
    order.status === 'Available' && 
    order.bids && 
    order.bids.length > 0 &&
    order.bids.some((bid: any) => bid.status === 'pending')
  );

  // Get all pending bids across all orders
  const allPendingBids = ordersWithBids.flatMap(order => 
    (order.bids || [])
      .filter((bid: any) => bid.status === 'pending')
      .map((bid: any) => ({ order, bid }))
  );

  // Filter orders based on search and writer
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWriter = !writerFilter || 
        (order.bids || []).some((bid: any) => 
          bid.writerId === writerFilter && bid.status === 'pending'
        );
      
      return matchesSearch && matchesWriter;
    });
  };

  const filteredOrders = filterOrders(ordersWithBids);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleApproveBid = async (order: Order, bidId: string) => {
    if (!confirm(`Are you sure you want to approve this bid? The order will be assigned to this writer and all other pending bids will be declined.`)) {
      return;
    }

    try {
      await handleOrderAction('approve_bid', order.id, { 
        bidId,
        adminId: user?.id 
      });
    } catch (error) {
      console.error('Failed to approve bid:', error);
      alert('Failed to approve bid. Please try again.');
    }
  };

  const handleDeclineBid = async (order: Order, bidId: string) => {
    if (!confirm(`Are you sure you want to decline this bid? The order will remain available for other writers.`)) {
      return;
    }

    try {
      await handleOrderAction('decline_bid', order.id, { 
        bidId,
        notes: 'Bid declined by admin'
      });
    } catch (error) {
      console.error('Failed to decline bid:', error);
      alert('Failed to decline bid. Please try again.');
    }
  };

  const handleOrderActionLocal = async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    await handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get unique writers who have pending bids
  const writersWithBids = Array.from(
    new Set(
      allPendingBids.map(({ bid }) => bid.writerId).filter(Boolean)
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Bids Management</h1>
          <p className="text-gray-600 mt-1">
            Review and manage bids from writers. Multiple writers can bid on the same order.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Orders with Bids</p>
                <p className="text-2xl font-bold text-gray-900">{ordersWithBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Hand className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending Bids</p>
                <p className="text-2xl font-bold text-gray-900">{allPendingBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Writers Bidding</p>
                <p className="text-2xl font-bold text-gray-900">{writersWithBids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Bids per Order</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ordersWithBids.length > 0 
                    ? (allPendingBids.length / ordersWithBids.length).toFixed(1)
                    : '0'}
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by title, description, or discipline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={writerFilter}
              onChange={(e) => setWriterFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Writers</option>
              {writersWithBids.map(writerId => {
                const writer = writers.find(w => w.id === writerId);
                const bid = allPendingBids.find(({ bid }) => bid.writerId === writerId)?.bid;
                return (
                  <option key={writerId} value={writerId}>
                    {writer?.name || bid?.writerName || writerId}
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders with Bids List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const pendingBids = (order.bids || []).filter((bid: any) => bid.status === 'pending');
            
            return (
              <Card key={order.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Available
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          <Users className="h-3 w-3 mr-1" />
                          {pendingBids.length} Bid{pendingBids.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{order.pages} pages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Due: {new Date(order.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-green-600">
                            KES {(order.totalPriceKES || order.pages * 350).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Order
                    </Button>
                  </div>

                  {/* Bids List */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Hand className="h-4 w-4" />
                      Pending Bids ({pendingBids.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {pendingBids.map((bid: any) => {
                        const writer = writers.find(w => w.id === bid.writerId);
                        return (
                          <Card key={bid.id} className="bg-gray-50 border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-semibold text-gray-900">
                                      {writer?.name || bid.writerName || 'Unknown Writer'}
                                    </span>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                      Pending
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>Bid placed: {getTimeAgo(bid.bidAt)}</span>
                                    </div>
                                    {bid.notes && (
                                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                        <span className="font-medium">Notes:</span> {bid.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApproveBid(order, bid.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                    onClick={() => handleDeclineBid(order, bid.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Hand className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No Orders with Bids</p>
              <p className="text-gray-400 text-sm mt-2">
                {ordersWithBids.length === 0 
                  ? "No writers have placed bids on any orders yet."
                  : "No orders match your search criteria."}
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
          userRole="admin"
          onAction={handleOrderActionLocal}
        />
      )}
    </div>
  );
}

