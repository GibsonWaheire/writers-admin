import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  CheckCircle,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react';
import { OrderCard } from '../../components/OrderCard';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';
import { getWriterIdForUser } from '../../utils/writer';

export default function CompletedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");

  const { 
    orders,
    handleOrderAction,
    getWriterTotalEarnings
  } = useOrders();
  
  const { user } = useAuth();
  const currentWriterId = getWriterIdForUser(user?.id);

  // Get completed orders for current writer
  const completedOrders = orders.filter(order => 
    order.writerId === currentWriterId && 
    ['Completed', 'Paid'].includes(order.status)
  );

  // Filter orders based on search and filters
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDiscipline = !disciplineFilter || order.discipline === disciplineFilter;
      
      let matchesTime = true;
      if (timeFilter) {
        const completedDate = new Date(order.updatedAt || order.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        
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
      
      return matchesSearch && matchesDiscipline && matchesTime;
    });
  };

  const filteredOrders = filterOrders(completedOrders);

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
  const totalEarnings = completedOrders.reduce((sum, order) => 
    sum + (order.totalPriceKES || order.pages * 350), 0
  );

  const averageRating = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length
    : 0;

  const thisMonthOrders = completedOrders.filter(order => {
    const completedDate = new Date(order.updatedAt || order.createdAt);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && 
           completedDate.getFullYear() === now.getFullYear();
  });

  const thisMonthEarnings = thisMonthOrders.reduce((sum, order) => 
    sum + (order.totalPriceKES || order.pages * 350), 0
  );

  // Get unique disciplines for filter
  const disciplines = [...new Set(completedOrders.map(order => order.discipline))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Completed Orders</h1>
          <p className="text-gray-600 mt-1">View your completed work and track your achievements</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredOrders.length} Completed
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">KES {totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  {averageRating > 0 && <span className="text-sm text-gray-500 ml-1">/ 5</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">KES {thisMonthEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {thisMonthOrders.length}
              </div>
              <p className="text-sm text-gray-600">Orders This Month</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {completedOrders.length > 0 
                  ? Math.round(completedOrders.reduce((sum, order) => sum + order.pages, 0) / completedOrders.length)
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Avg. Pages per Order</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {completedOrders.length > 0 
                  ? Math.round(totalEarnings / completedOrders.length)
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Avg. Earnings per Order</p>
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
                placeholder="Search completed orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Disciplines</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
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
              completedView={true}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Completed Orders</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || disciplineFilter || timeFilter
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You haven't completed any orders yet. Start working on available orders to see them here."
                  }
                </p>
                {(searchTerm || disciplineFilter || timeFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setDisciplineFilter("");
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
