import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  XCircle,
  AlertTriangle,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingDown,
  BookOpen,
  Info
} from 'lucide-react';
import { OrderCard } from '../../components/OrderCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';
import { getWriterIdForUser } from '../../utils/writer';

export default function RejectedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [reasonFilter, setReasonFilter] = useState<string>("");

  const { 
    orders,
    handleOrderAction
  } = useOrders();
  
  const { user } = useAuth();
  const currentWriterId = getWriterIdForUser(user?.id);

  // Get rejected orders for current writer
  const rejectedOrders = orders.filter(order => 
    order.writerId === currentWriterId && 
    ['Rejected', 'Cancelled'].includes(order.status)
  );

  // Filter orders based on search and filters
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesTime = true;
      if (timeFilter) {
        const rejectedDate = new Date(order.updatedAt || order.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - rejectedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (timeFilter) {
          case 'week':
            matchesTime = daysDiff <= 7;
            break;
          case 'month':
            matchesTime = daysDiff <= 30;
            break;
          case 'quarter':
            matchesTime = daysDiff <= 90;
            break;
        }
      }

      let matchesReason = true;
      if (reasonFilter && order.rejectionReason) {
        const reason = order.rejectionReason.toLowerCase();
        switch (reasonFilter) {
          case 'quality':
            matchesReason = reason.includes('quality') || reason.includes('standard');
            break;
          case 'deadline':
            matchesReason = reason.includes('deadline') || reason.includes('late') || reason.includes('time');
            break;
          case 'requirements':
            matchesReason = reason.includes('requirement') || reason.includes('instruction') || reason.includes('specification');
            break;
          case 'plagiarism':
            matchesReason = reason.includes('plagiarism') || reason.includes('originality');
            break;
        }
      }
      
      return matchesSearch && matchesTime && matchesReason;
    });
  };

  const filteredOrders = filterOrders(rejectedOrders);

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

  // Calculate statistics
  const lostEarnings = rejectedOrders.reduce((sum, order) => 
    sum + (order.totalPriceKES || order.pages * 350), 0
  );

  const thisMonthRejections = rejectedOrders.filter(order => {
    const rejectedDate = new Date(order.updatedAt || order.createdAt);
    const now = new Date();
    return rejectedDate.getMonth() === now.getMonth() && 
           rejectedDate.getFullYear() === now.getFullYear();
  });

  // Get rejection reason categories
  const rejectionReasons = rejectedOrders.reduce((acc, order) => {
    if (order.rejectionReason) {
      const reason = order.rejectionReason.toLowerCase();
      if (reason.includes('quality') || reason.includes('standard')) {
        acc.quality = (acc.quality || 0) + 1;
      } else if (reason.includes('deadline') || reason.includes('late') || reason.includes('time')) {
        acc.deadline = (acc.deadline || 0) + 1;
      } else if (reason.includes('requirement') || reason.includes('instruction') || reason.includes('specification')) {
        acc.requirements = (acc.requirements || 0) + 1;
      } else if (reason.includes('plagiarism') || reason.includes('originality')) {
        acc.plagiarism = (acc.plagiarism || 0) + 1;
      } else {
        acc.other = (acc.other || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const mostCommonReason = Object.entries(rejectionReasons).reduce((a, b) => 
    rejectionReasons[a[0]] > rejectionReasons[b[0]] ? a : b, ['none', 0]
  )[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rejected Orders</h1>
          <p className="text-gray-600 mt-1">Learn from feedback and improve your future work</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredOrders.length} Rejected
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Lost Earnings</p>
                <p className="text-2xl font-bold text-gray-900">KES {lostEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{thisMonthRejections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Main Issue</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {mostCommonReason !== 'none' ? mostCommonReason : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Improvement Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Common Rejection Reasons</h4>
              <div className="space-y-2">
                {Object.entries(rejectionReasons).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{reason}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tips to Improve</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Read order requirements carefully before starting</li>
                <li>• Double-check your work for quality and accuracy</li>
                <li>• Submit orders well before the deadline</li>
                <li>• Use plagiarism checkers to ensure originality</li>
                <li>• Ask questions if requirements are unclear</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search rejected orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rejection Reasons</option>
              <option value="quality">Quality Issues</option>
              <option value="deadline">Deadline Issues</option>
              <option value="requirements">Requirements Not Met</option>
              <option value="plagiarism">Plagiarism/Originality</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
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
              showActions={false}
              rejectedView={true}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rejected Orders</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || reasonFilter || timeFilter
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "Great! You don't have any rejected orders. Keep up the excellent work!"
                  }
                </p>
                {(searchTerm || reasonFilter || timeFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setReasonFilter("");
                      setTimeFilter("");
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
    </div>
  );
}
