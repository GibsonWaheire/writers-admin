import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Search, 
  FileText,
  Hand,
  Eye,
  Users,
  Clock,
  DollarSign,
  ArrowUpDown,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { BidCard } from '../../components/bidding/BidCard';
import { useOrders } from '../../contexts/OrderContext';
import { useUsers } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getBidsWithPerformance, 
  groupBidsByOrder, 
  sortBidsByMerit,
  type BidWithWriter 
} from '../../utils/bidHelpers';
import type { Order } from '../../types/order';

type SortOption = 'merit' | 'time' | 'rating' | 'completion';
type FilterOption = 'all' | 'high-merit' | 'experienced';

export default function AdminBidOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [writerFilter, setWriterFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>('merit');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const { orders, handleOrderAction, refreshOrders } = useOrders();
  const { writers } = useUsers();
  const { user } = useAuth();

  // Debug: Log orders with bids
  useEffect(() => {
    const ordersWithBids = orders.filter(o => o.bids && o.bids.length > 0);
    console.log('🔍 AdminBidOrdersPage: Orders with bids:', {
      totalOrders: orders.length,
      ordersWithBids: ordersWithBids.length,
      ordersWithBidsDetails: ordersWithBids.map(o => ({
        id: o.id,
        title: o.title,
        bidsCount: o.bids?.length || 0,
        pendingBids: o.bids?.filter((b: any) => b.status === 'pending').length || 0,
        bids: o.bids
      }))
    });
  }, [orders]);

  // Get all bids with performance data (only pending bids)
  // Note: getBidsWithPerformance already filters for pending bids, so we don't need to filter again
  const allBidsWithPerformance = useMemo(() => {
    return getBidsWithPerformance(orders, writers);
  }, [orders, writers]);

  // Filter and sort bids
  const processedBids = useMemo(() => {
    let filtered = [...allBidsWithPerformance];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(({ order }) => 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by writer
    if (writerFilter) {
      filtered = filtered.filter(({ bid }) => bid.writerId === writerFilter);
    }

    // Filter by merit/experience
    if (filterBy === 'high-merit') {
      filtered = filtered.filter(({ meritScore }) => meritScore >= 80);
    } else if (filterBy === 'experienced') {
      filtered = filtered.filter(({ performance }) => 
        performance && performance.totalOrders >= 10
      );
    }

    // Sort bids
    switch (sortBy) {
      case 'merit':
        filtered = sortBidsByMerit(filtered);
        break;
      case 'time':
        filtered.sort((a, b) => 
          new Date(b.bid.bidAt).getTime() - new Date(a.bid.bidAt).getTime()
        );
        break;
      case 'rating':
        filtered.sort((a, b) => 
          (b.performance?.averageRating || 0) - (a.performance?.averageRating || 0)
        );
        break;
      case 'completion':
        filtered.sort((a, b) => 
          (b.performance?.completionRate || 0) - (a.performance?.completionRate || 0)
        );
        break;
    }

    return filtered;
  }, [allBidsWithPerformance, searchTerm, writerFilter, sortBy, filterBy]);

  // Group bids by order (sorted by merit within each order)
  const bidsByOrder = useMemo(() => {
    return groupBidsByOrder(processedBids);
  }, [processedBids]);

  // Get orders with bids (sorted by number of bids, then by order date)
  const ordersWithBids = useMemo(() => {
    const orderIds = Array.from(bidsByOrder.keys());
    return orderIds
      .map(orderId => orders.find(o => o.id === orderId))
      .filter((order): order is Order => order !== undefined)
      .sort((a, b) => {
        const bidsA = bidsByOrder.get(a.id)?.length || 0;
        const bidsB = bidsByOrder.get(b.id)?.length || 0;
        if (bidsB !== bidsA) return bidsB - bidsA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [bidsByOrder, orders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleApproveBid = async (orderId: string, bidId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!confirm(`Are you sure you want to approve this bid? The order will be assigned to this writer and all other pending bids will be declined.`)) {
      return;
    }

    try {
      await handleOrderAction('approve_bid', orderId, { 
        bidId,
        adminId: user?.id 
      });
    } catch (error) {
      console.error('Failed to approve bid:', error);
      alert('Failed to approve bid. Please try again.');
    }
  };

  const handleDeclineBid = async (orderId: string, bidId: string) => {
    if (!confirm(`Are you sure you want to decline this bid? The order will remain available for other writers.`)) {
      return;
    }

    try {
      await handleOrderAction('decline_bid', orderId, { 
        bidId,
        notes: 'Bid declined by admin'
      });
    } catch (error) {
      console.error('Failed to decline bid:', error);
      alert('Failed to decline bid. Please try again.');
    }
  };

  const handleAssignBestMatch = async (orderId: string) => {
    const bids = bidsByOrder.get(orderId);
    if (!bids || bids.length === 0) return;

    // Get the highest merit score bid
    const bestBid = bids[0];
    
    if (!confirm(`Assign this order to ${bestBid.writer?.name || bestBid.bid.writerName} (Merit Score: ${bestBid.meritScore.toFixed(0)})?`)) {
      return;
    }

    await handleApproveBid(orderId, bestBid.bid.id);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    await handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get unique writers who have pending bids
  const writersWithBids = useMemo(() => {
    return Array.from(
      new Set(
        allBidsWithPerformance.map(({ bid }) => bid.writerId).filter(Boolean)
      )
    );
  }, [allBidsWithPerformance]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBids = allBidsWithPerformance.length;
    const avgMeritScore = totalBids > 0
      ? allBidsWithPerformance.reduce((sum, { meritScore }) => sum + meritScore, 0) / totalBids
      : 0;
    const highMeritBids = allBidsWithPerformance.filter(({ meritScore }) => meritScore >= 80).length;

    return {
      ordersWithBids: ordersWithBids.length,
      totalBids,
      uniqueWriters: writersWithBids.length,
      avgMeritScore,
      highMeritBids
    };
  }, [allBidsWithPerformance, ordersWithBids.length, writersWithBids.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bid Orders Management</h1>
          <p className="text-gray-600 mt-1">
            Review and assign orders based on writer merit and performance. Bids are automatically sorted by merit score (highest first).
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshOrders()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Orders with Bids</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordersWithBids}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueWriters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Merit Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMeritScore.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">High Merit (80+)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highMeritBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={writerFilter}
              onChange={(e) => setWriterFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Writers</option>
              {writersWithBids.map(writerId => {
                const writer = writers.find(w => w.id === writerId);
                return (
                  <option key={writerId} value={writerId}>
                    {writer?.name || writerId}
                  </option>
                );
              })}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="merit">Sort by Merit Score</option>
              <option value="rating">Sort by Rating</option>
              <option value="completion">Sort by Completion Rate</option>
              <option value="time">Sort by Bid Time</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Bids</option>
              <option value="high-merit">High Merit (80+)</option>
              <option value="experienced">Experienced (10+ orders)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders with Bids List - Ordered by Merit */}
      <div className="space-y-4">
        {ordersWithBids.length > 0 ? (
          ordersWithBids.map((order) => {
            const bids = bidsByOrder.get(order.id) || [];
            const sortedBids = sortBidsByMerit(bids);
            
            return (
              <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
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
                          {bids.length} Bid{bids.length !== 1 ? 's' : ''}
                        </Badge>
                        {sortedBids.length > 0 && sortedBids[0].meritScore >= 80 && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            High Merit Available
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{order.description}</p>
                      
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
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            KES {(order.totalPriceKES || order.pages * 350).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{order.discipline}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {sortedBids.length > 0 && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleAssignBestMatch(order.id)}
                          title={`Assign to ${sortedBids[0].writer?.name || sortedBids[0].bid.writerName} (Merit: ${sortedBids[0].meritScore.toFixed(0)})`}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Assign Best Match
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Order
                      </Button>
                    </div>
                  </div>

                  {/* Bids List - Ordered by Merit */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Hand className="h-4 w-4" />
                        Pending Bids ({bids.length}) - Sorted by Merit Score
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        {sortBy === 'merit' ? 'Merit' : sortBy === 'rating' ? 'Rating' : sortBy === 'completion' ? 'Completion' : 'Time'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {sortedBids.length > 0 ? (
                        sortedBids.map((bidWithWriter) => (
                          <BidCard
                            key={bidWithWriter.bid.id}
                            bidWithWriter={bidWithWriter}
                            onApprove={handleApproveBid}
                            onDecline={handleDeclineBid}
                          />
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No pending bids for this order.
                        </div>
                      )}
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
              <p className="text-gray-500 text-lg font-medium">No Orders with Pending Bids</p>
              <p className="text-gray-400 text-sm mt-2">
                {allBidsWithPerformance.length === 0 
                  ? "No writers have placed bids on any orders yet. Writers can bid on available orders from their dashboard."
                  : "No orders match your search criteria. Try adjusting your filters."}
              </p>
              {allBidsWithPerformance.length === 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/admin/orders/all'}
                  >
                    View All Available Orders
                  </Button>
                </div>
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
          userRole="admin"
          onAction={handleOrderActionLocal}
        />
      )}
    </div>
  );
}
