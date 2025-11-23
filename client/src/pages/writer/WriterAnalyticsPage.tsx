/**
 * Writer Analytics Page
 * Comprehensive analytics for writers
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MetricsChart } from '../../components/analytics/MetricsChart';
import { OrderStatCard } from '../../components/dashboard';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock,
  Star,
  BarChart3
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { getWriterIdForUser } from '../../utils/writer';

export default function WriterAnalyticsPage() {
  const { user } = useAuth();
  const { orders, getWriterOrderStats } = useOrders();
  const { wallet, getMonthlyEarnings } = useWallet();
  
  const currentWriterId = getWriterIdForUser(user?.id);
  const writerOrders = orders.filter(order => order.writerId === currentWriterId);
  const stats = getWriterOrderStats(currentWriterId);
  
  // Calculate metrics
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const revisionRate = stats.total > 0 ? (stats.revision / stats.total) * 100 : 0;
  const rejectionRate = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;
  
  const thisMonthEarnings = getMonthlyEarnings();
  const avgOrderValue = stats.completed > 0 ? wallet.totalEarned / stats.completed : 0;
  
  // Time-based metrics
  const thisWeekOrders = writerOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  }).length;
  
  const thisMonthOrders = writerOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return orderDate >= monthAgo;
  }).length;

  const performanceMetrics = [
    {
      label: 'Total Orders',
      value: stats.total,
      previousValue: stats.total - thisMonthOrders,
      trend: 'up' as const
    },
    {
      label: 'Completion Rate',
      value: completionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      previousValue: completionRate - 5,
      trend: completionRate > 80 ? 'up' as const : 'neutral' as const
    },
    {
      label: 'Revision Rate',
      value: revisionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      previousValue: revisionRate + 2,
      trend: revisionRate < 10 ? 'up' as const : 'down' as const
    },
    {
      label: 'Avg Order Value',
      value: avgOrderValue,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: avgOrderValue - 500,
      trend: 'up' as const
    }
  ];

  const earningsMetrics = [
    {
      label: 'Total Earnings',
      value: wallet.totalEarned,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: wallet.totalEarned - thisMonthEarnings,
      trend: 'up' as const
    },
    {
      label: 'This Month',
      value: thisMonthEarnings,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: thisMonthEarnings - 10000,
      trend: 'up' as const
    },
    {
      label: 'Available Balance',
      value: wallet.availableBalance,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: wallet.availableBalance,
      trend: 'neutral' as const
    },
    {
      label: 'Pending Earnings',
      value: wallet.pendingEarnings,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: wallet.pendingEarnings,
      trend: 'neutral' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your performance and earnings</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OrderStatCard
          title="Total Earnings"
          value={`KES ${wallet.totalEarned.toLocaleString()}`}
          icon={DollarSign}
          change={{
            value: `+KES ${thisMonthEarnings.toLocaleString()} this month`,
            type: 'positive'
          }}
          gradient={true}
        />
        <OrderStatCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={CheckCircle}
          change={{
            value: `${stats.completed} completed`,
            type: completionRate > 80 ? 'positive' : 'neutral'
          }}
        />
        <OrderStatCard
          title="Total Orders"
          value={stats.total}
          icon={FileText}
          change={{
            value: `${thisMonthOrders} this month`,
            type: 'positive'
          }}
        />
        <OrderStatCard
          title="Avg Rating"
          value="4.8"
          icon={Star}
          change={{
            value: "Based on reviews",
            type: 'positive'
          }}
        />
      </div>

      {/* Performance Metrics */}
      <MetricsChart
        title="Performance Metrics"
        metrics={performanceMetrics}
        columns={4}
      />

      {/* Earnings Metrics */}
      <MetricsChart
        title="Earnings Overview"
        metrics={earningsMetrics}
        columns={4}
      />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.completed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.inProgress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revisions</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${revisionRate}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.revision}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rejected</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${rejectionRate}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.rejected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time-Based Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{thisWeekOrders} orders</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{thisMonthOrders} orders</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total} orders</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

