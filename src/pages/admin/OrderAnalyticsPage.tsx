import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';

export default function OrderAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  const { orders, refreshOrders } = useOrders();

  // Calculate analytics based on time range
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    // Basic metrics
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'Completed').length;
    const rejectedOrders = filteredOrders.filter(o => o.status === 'Rejected').length;
    const inProgressOrders = filteredOrders.filter(o => ['Assigned', 'In Progress', 'Submitted'].includes(o.status)).length;
    const availableOrders = filteredOrders.filter(o => o.status === 'Available').length;

    // Revenue calculations
    const totalRevenue = filteredOrders
      .filter(o => o.status === 'Completed')
      .reduce((sum, order) => sum + (order.pages * 350), 0);
    
    const pendingRevenue = filteredOrders
      .filter(o => ['Assigned', 'In Progress', 'Submitted'].includes(o.status))
      .reduce((sum, order) => sum + (order.pages * 350), 0);

    // Completion rate
    const submittedOrders = filteredOrders.filter(o => ['Completed', 'Rejected'].includes(o.status)).length;
    const completionRate = submittedOrders > 0 ? (completedOrders / submittedOrders) * 100 : 0;

    // Average completion time (for completed orders)
    const ordersWithCompletionTime = filteredOrders.filter(o => 
      o.status === 'Completed' && o.assignedAt && o.completedAt
    );
    
    const avgCompletionTime = ordersWithCompletionTime.length > 0
      ? ordersWithCompletionTime.reduce((sum, order) => {
          const assigned = new Date(order.assignedAt!).getTime();
          const completed = new Date(order.completedAt!).getTime();
          return sum + (completed - assigned) / (1000 * 60 * 60 * 24); // Convert to days
        }, 0) / ordersWithCompletionTime.length
      : 0;

    // Discipline breakdown
    const disciplineStats = filteredOrders.reduce((acc, order) => {
      acc[order.discipline] = (acc[order.discipline] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusStats = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Writer performance
    const writerStats = filteredOrders
      .filter(o => o.writerId)
      .reduce((acc, order) => {
        const writerId = order.writerId!;
        if (!acc[writerId]) {
          acc[writerId] = {
            name: order.assignedWriter || 'Unknown',
            total: 0,
            completed: 0,
            rejected: 0,
            earnings: 0
          };
        }
        acc[writerId].total++;
        if (order.status === 'Completed') {
          acc[writerId].completed++;
          acc[writerId].earnings += order.pages * 350;
        } else if (order.status === 'Rejected') {
          acc[writerId].rejected++;
        }
        return acc;
      }, {} as Record<string, any>);

    // Daily trends (last 30 days for visual)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      last30Days.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        completed: dayOrders.filter(o => o.status === 'Completed').length,
        revenue: dayOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.pages * 350), 0)
      });
    }

    return {
      totalOrders,
      completedOrders,
      rejectedOrders,
      inProgressOrders,
      availableOrders,
      totalRevenue,
      pendingRevenue,
      completionRate,
      avgCompletionTime,
      disciplineStats,
      statusStats,
      writerStats,
      dailyTrends: last30Days
    };
  }, [orders, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const topWriters = Object.entries(analytics.writerStats)
    .sort(([,a], [,b]) => b.completed - a.completed)
    .slice(0, 5);

  const topDisciplines = Object.entries(analytics.disciplineStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into order performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button 
            variant="outline"
            onClick={refreshOrders}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{analytics.totalOrders}</div>
            <p className="text-xs text-blue-600">
              {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600">
              {analytics.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              KES {analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">
              KES {analytics.pendingRevenue.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg. Completion</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {analytics.avgCompletionTime.toFixed(1)}d
            </div>
            <p className="text-xs text-orange-600">Average days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusStats)
                .sort(([,a], [,b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(status)} border`}>
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-gray-500">
                        ({((count / analytics.totalOrders) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Disciplines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top Disciplines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDisciplines.map(([discipline, count]) => (
                <div key={discipline} className="flex items-center justify-between">
                  <div className="font-medium text-sm">{discipline}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{count}</div>
                    <div className="text-xs text-gray-500">
                      ({((count / analytics.totalOrders) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Writers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performing Writers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topWriters.map(([writerId, stats]) => (
                <div key={writerId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{stats.name}</div>
                    <div className="text-xs text-gray-500">
                      {stats.completed}/{stats.total} completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      KES {stats.earnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((stats.completed / stats.total) * 100).toFixed(0)}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.dailyTrends.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{day.orders}</span>
                      <span className="text-gray-500 ml-1">orders</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{day.completed}</span>
                      <span className="text-gray-500 ml-1">completed</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">
                        KES {day.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {analytics.inProgressOrders}
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
              <div className="text-xs text-gray-500">
                Currently being worked on
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {analytics.rejectedOrders}
              </div>
              <div className="text-sm text-gray-600">Rejected Orders</div>
              <div className="text-xs text-gray-500">
                Quality control issues
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {analytics.availableOrders}
              </div>
              <div className="text-sm text-gray-600">Available Orders</div>
              <div className="text-xs text-gray-500">
                Awaiting assignment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
