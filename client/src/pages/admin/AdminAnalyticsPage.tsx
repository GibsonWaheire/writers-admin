/**
 * Admin Analytics Page
 * Comprehensive analytics for admin
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MetricsChart } from '../../components/analytics/MetricsChart';
import { OrderStatCard } from '../../components/dashboard';
import { 
  FileText, 
  Users, 
  DollarSign, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { getPendingBidsCount } from '../../utils/bidHelpers';

export default function AdminAnalyticsPage() {
  const { orders, getOrdersByStatus } = useOrders();
  
  // Calculate comprehensive stats
  const totalOrders = orders.length;
  const completedOrders = getOrdersByStatus('Completed').length + getOrdersByStatus('Approved').length;
  const pendingReviews = getOrdersByStatus('Submitted').length;
  const revisionOrders = getOrdersByStatus('Revision').length;
  const rejectedOrders = getOrdersByStatus('Rejected').length;
  const inProgressOrders = getOrdersByStatus('In Progress').length;
  const availableOrders = getOrdersByStatus('Available').length;
  
  const activeWriters = Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId!))).length;
  const pendingBids = getPendingBidsCount(orders);
  
  const totalRevenue = orders
    .filter(o => ['Completed', 'Approved'].includes(o.status))
    .reduce((sum, order) => sum + (order.pages * 350), 0);
  
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const revisionRate = totalOrders > 0 ? (revisionOrders / totalOrders) * 100 : 0;
  const rejectionRate = totalOrders > 0 ? (rejectedOrders / totalOrders) * 100 : 0;
  
  // Time-based metrics
  const thisWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  }).length;
  
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return orderDate >= monthAgo;
  }).length;

  const systemMetrics = [
    {
      label: 'Total Orders',
      value: totalOrders,
      previousValue: totalOrders - thisMonthOrders,
      trend: 'up' as const
    },
    {
      label: 'Completion Rate',
      value: completionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      previousValue: completionRate - 2,
      trend: completionRate > 80 ? 'up' as const : 'neutral' as const
    },
    {
      label: 'Revision Rate',
      value: revisionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      previousValue: revisionRate + 1,
      trend: revisionRate < 15 ? 'up' as const : 'down' as const
    },
    {
      label: 'Rejection Rate',
      value: rejectionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      previousValue: rejectionRate + 0.5,
      trend: rejectionRate < 5 ? 'up' as const : 'down' as const
    }
  ];

  const revenueMetrics = [
    {
      label: 'Total Revenue',
      value: totalRevenue,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: totalRevenue - 100000,
      trend: 'up' as const
    },
    {
      label: 'Completed Orders',
      value: completedOrders,
      previousValue: completedOrders - 5,
      trend: 'up' as const
    },
    {
      label: 'Avg Order Value',
      value: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      previousValue: completedOrders > 0 ? (totalRevenue - 100000) / completedOrders : 0,
      trend: 'up' as const
    },
    {
      label: 'Active Writers',
      value: activeWriters,
      previousValue: activeWriters - 1,
      trend: 'up' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">System-wide analytics and insights</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OrderStatCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={{
            value: `${completionRate.toFixed(1)}% completion rate`,
            type: completionRate > 80 ? 'positive' : 'neutral'
          }}
          gradient={true}
        />
        <OrderStatCard
          title="Total Orders"
          value={totalOrders}
          icon={FileText}
          change={{
            value: `${thisMonthOrders} this month`,
            type: 'positive'
          }}
        />
        <OrderStatCard
          title="Active Writers"
          value={activeWriters}
          icon={Users}
          change={{
            value: `${inProgressOrders} active orders`,
            type: 'neutral'
          }}
        />
        <OrderStatCard
          title="Pending Review"
          value={pendingReviews}
          icon={AlertTriangle}
          change={{
            value: `${revisionOrders} revisions`,
            type: pendingReviews > 0 ? 'negative' : 'positive'
          }}
          badge={{
            text: pendingReviews > 0 ? 'Action Required' : 'All Clear',
            variant: pendingReviews > 0 ? 'destructive' : 'default'
          }}
        />
      </div>

      {/* System Metrics */}
      <MetricsChart
        title="System Performance Metrics"
        metrics={systemMetrics}
        columns={4}
      />

      {/* Revenue Metrics */}
      <MetricsChart
        title="Revenue & Completion Metrics"
        metrics={revenueMetrics}
        columns={4}
      />

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
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
                  <span className="font-medium">{completedOrders}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(inProgressOrders / totalOrders) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium">{inProgressOrders}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Review</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(pendingReviews / totalOrders) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium">{pendingReviews}</span>
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
                  <span className="font-medium">{revisionOrders}</span>
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
                  <span className="font-medium">{rejectedOrders}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time-Based Activity</CardTitle>
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
                  <p className="text-sm text-gray-600">Pending Bids</p>
                  <p className="text-2xl font-bold">{pendingBids} bids</p>
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

