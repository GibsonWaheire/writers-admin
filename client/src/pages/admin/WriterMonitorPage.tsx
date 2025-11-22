import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Search,
  Star,
  DollarSign,
  FileText,
  RefreshCw
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useUsers } from '../../contexts/UsersContext';
import type { Order } from '../../types/order';

interface WriterStats {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  averageCompletionTime: number;
  successRate: number;
  totalEarnings: number;
  currentCapacity: number;
  maxCapacity: number;
  recentOrders: Order[];
  performanceTrend: 'up' | 'down' | 'stable';
}

export default function WriterMonitorPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'orders' | 'earnings'>('rating');

  const { 
    orders, 
    handleOrderAction,
    getWriterActiveOrders,
    getWriterOrderStats,
    getWriterTotalEarnings,
    refreshOrders
  } = useOrders();
  const { writers } = useUsers();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Calculate comprehensive writer statistics
  const writerStats: WriterStats[] = writers.map(writer => {
    const writerOrders = orders.filter(o => o.writerId === writer.id);
    const activeOrders = getWriterActiveOrders(writer.id);
    const stats = getWriterOrderStats(writer.id);
    const earnings = getWriterTotalEarnings(writer.id);
    
    // Calculate average completion time (in hours)
    const completedOrders = writerOrders.filter(o => o.status === 'Completed' && o.startedAt && o.completedAt);
    const avgCompletionTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => {
          const started = new Date(order.startedAt!).getTime();
          const completed = new Date(order.completedAt!).getTime();
          return sum + (completed - started) / (1000 * 60 * 60); // Convert to hours
        }, 0) / completedOrders.length
      : 0;

    // Calculate success rate
    const totalSubmitted = stats.completed + stats.rejected;
    const successRate = totalSubmitted > 0 ? (stats.completed / totalSubmitted) * 100 : 0;

    // Determine performance trend (simplified)
    const recentOrders = writerOrders
      .filter(o => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const recentSuccessRate = recentOrders.length > 0 
      ? (recentOrders.filter(o => o.status === 'Completed').length / recentOrders.length) * 100
      : successRate;
    
    const performanceTrend: 'up' | 'down' | 'stable' = 
      recentSuccessRate > successRate + 5 ? 'up' :
      recentSuccessRate < successRate - 5 ? 'down' : 'stable';

    return {
      id: writer.id,
      name: writer.name,
      email: writer.email,
      rating: writer.rating || 0,
      totalOrders: stats.total,
      activeOrders: activeOrders.length,
      completedOrders: stats.completed,
      rejectedOrders: stats.rejected,
      averageCompletionTime: Math.round(avgCompletionTime),
      successRate: Math.round(successRate),
      totalEarnings: earnings,
      currentCapacity: activeOrders.length,
      maxCapacity: writer.maxConcurrentOrders || 5,
      recentOrders: recentOrders.slice(0, 5),
      performanceTrend
    };
  });

  // Filter and sort writers
  const filteredWriters = writerStats
    .filter(writer => 
      writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        default:
          return 0;
      }
    });

  const getPerformanceColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 80) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const overallStats = {
    totalWriters: writers.length,
    activeWriters: writerStats.filter(w => w.activeOrders > 0).length,
    availableWriters: writerStats.filter(w => w.currentCapacity < w.maxCapacity).length,
    avgSuccessRate: Math.round(writerStats.reduce((sum, w) => sum + w.successRate, 0) / writers.length),
    totalEarnings: writerStats.reduce((sum, w) => sum + w.totalEarnings, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Writer Monitor</h1>
          <p className="text-muted-foreground">
            Track writer performance, capacity, and order management
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={refreshOrders}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Writers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{overallStats.totalWriters}</div>
            <p className="text-xs text-blue-600">Registered writers</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Writers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{overallStats.activeWriters}</div>
            <p className="text-xs text-green-600">Currently working</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Available</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{overallStats.availableWriters}</div>
            <p className="text-xs text-yellow-600">With capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{overallStats.avgSuccessRate}%</div>
            <p className="text-xs text-purple-600">Platform average</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              KES {overallStats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search writers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="orders">Sort by Orders</option>
              <option value="earnings">Sort by Earnings</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredWriters.length} writers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWriters.map((writer) => (
          <Card key={writer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{writer.name}</CardTitle>
                  <p className="text-sm text-gray-600">{writer.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getPerformanceColor(writer.performanceTrend)}`}>
                    {getPerformanceIcon(writer.performanceTrend)}
                    <span className="text-sm font-medium">
                      {writer.performanceTrend === 'up' ? 'Improving' : 
                       writer.performanceTrend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{writer.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{writer.totalOrders}</div>
                  <div className="text-xs text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{writer.completedOrders}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{writer.successRate}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    KES {writer.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Earnings</div>
                </div>
              </div>

              {/* Capacity */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Capacity</span>
                  <Badge className={`${getCapacityColor(writer.currentCapacity, writer.maxCapacity)} border`}>
                    {writer.currentCapacity}/{writer.maxCapacity}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((writer.currentCapacity / writer.maxCapacity) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Orders ({writer.recentOrders.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {writer.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{order.title}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.status}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="text-xs px-2 py-1"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {writer.recentOrders.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No recent orders</p>
                  )}
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                <span>Avg. Completion: {writer.averageCompletionTime}h</span>
                {writer.rejectedOrders > 0 && (
                  <span className="text-red-600">
                    <XCircle className="h-3 w-3 inline mr-1" />
                    {writer.rejectedOrders} rejected
                  </span>
                )}
                {writer.activeOrders > 0 && (
                  <span className="text-blue-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {writer.activeOrders} active
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
          activeOrdersCount={0}
        />
      )}
    </div>
  );
}
