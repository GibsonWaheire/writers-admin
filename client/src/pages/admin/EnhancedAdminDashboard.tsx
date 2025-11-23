/**
 * Enhanced Admin Dashboard
 * Comprehensive admin overview with analytics and quick actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  OrderStatCard, 
  QuickActionCard, 
  PendingTasksCard 
} from '../../components/dashboard';
import { MetricsChart } from '../../components/analytics/MetricsChart';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  RefreshCw,
  BarChart3,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingBidsCount } from '../../utils/bidHelpers';
import type { PendingTask } from '../../components/dashboard/PendingTasksCard';

export default function EnhancedAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, getOrdersByStatus } = useOrders();
  const { notifications, unreadCount } = useNotifications();
  
  // Calculate stats
  const totalOrders = orders.length;
  const pendingReviews = getOrdersByStatus('Submitted').length;
  const revisionOrders = getOrdersByStatus('Revision').length;
  const completedOrders = getOrdersByStatus('Completed').length + getOrdersByStatus('Approved').length;
  const activeWriters = Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId!))).length;
  const pendingBids = getPendingBidsCount(orders);
  
  const totalRevenue = orders
    .filter(o => ['Completed', 'Approved'].includes(o.status))
    .reduce((sum, order) => sum + (order.pages * 350), 0);
  
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const revisionRate = totalOrders > 0 ? (revisionOrders / totalOrders) * 100 : 0;

  // Pending tasks
  const pendingTasks: PendingTask[] = [
    {
      id: 'pending-review',
      title: 'Orders Pending Review',
      type: 'review',
      priority: pendingReviews > 5 ? 'urgent' : pendingReviews > 0 ? 'high' : 'low',
      count: pendingReviews,
      actionUrl: '/admin/orders/review'
    },
    {
      id: 'revisions',
      title: 'Orders Requiring Revision',
      type: 'revision',
      priority: revisionOrders > 0 ? 'high' : 'low',
      count: revisionOrders,
      actionUrl: '/admin/orders'
    },
    {
      id: 'pending-bids',
      title: 'Pending Bids',
      type: 'approval',
      priority: pendingBids > 0 ? 'medium' : 'low',
      count: pendingBids,
      actionUrl: '/admin/orders/picked'
    },
    {
      id: 'assignments',
      title: 'New Assignments Needed',
      type: 'assignment',
      priority: 'medium',
      count: getOrdersByStatus('Available').length,
      actionUrl: '/admin/orders/assign'
    }
  ].filter(task => (task.count || 0) > 0);

  // Stats cards
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: FileText,
      change: {
        value: `${completedOrders} completed`,
        type: 'positive' as const
      },
      actionUrl: '/admin/orders/all',
      details: {
        description: 'Overview of all orders in the system',
        items: [
          { label: 'Completed', value: completedOrders, icon: CheckCircle },
          { label: 'In Progress', value: getOrdersByStatus('In Progress').length, icon: Clock },
          { label: 'Available', value: getOrdersByStatus('Available').length, icon: FileText }
        ],
        action: {
          label: 'View All Orders',
          onClick: () => navigate('/admin/orders/all')
        }
      }
    },
    {
      title: 'Pending Review',
      value: pendingReviews,
      icon: Eye,
      change: {
        value: `${revisionOrders} revisions`,
        type: pendingReviews > 0 ? 'negative' as const : 'neutral' as const
      },
      actionUrl: '/admin/orders/review',
      badge: {
        text: pendingReviews > 0 ? 'Action Required' : 'All Clear',
        variant: pendingReviews > 0 ? 'destructive' as const : 'default' as const
      },
      details: {
        description: 'Orders awaiting your review',
        items: [
          { label: 'New Submissions', value: pendingReviews, icon: FileText },
          { label: 'Revisions', value: revisionOrders, icon: RefreshCw }
        ],
        action: {
          label: 'Review Orders',
          onClick: () => navigate('/admin/orders/review')
        }
      }
    },
    {
      title: 'Active Writers',
      value: activeWriters,
      icon: Users,
      change: {
        value: `${getOrdersByStatus('In Progress').length} active orders`,
        type: 'neutral' as const
      },
      actionUrl: '/admin/writers',
      details: {
        description: 'Writers currently working on orders',
        items: [
          { label: 'Active Writers', value: activeWriters, icon: Users },
          { label: 'Total Writers', value: activeWriters, icon: Users }
        ],
        action: {
          label: 'Manage Writers',
          onClick: () => navigate('/admin/writers')
        }
      }
    },
    {
      title: 'Total Revenue',
      value: `KES ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: {
        value: `${completionRate.toFixed(1)}% completion rate`,
        type: completionRate > 80 ? 'positive' as const : 'neutral' as const
      },
      gradient: true,
      actionUrl: '/admin/financial',
      details: {
        description: 'Revenue from completed orders',
        items: [
          { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign },
          { label: 'Completed Orders', value: completedOrders, icon: CheckCircle },
          { label: 'Completion Rate', value: `${completionRate.toFixed(1)}%`, icon: TrendingUp }
        ],
        action: {
          label: 'View Financials',
          onClick: () => navigate('/admin/financial')
        }
      }
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: 'Create Order',
      icon: Plus,
      onClick: () => navigate('/admin/orders/new'),
      variant: 'default' as const
    },
    {
      label: 'Review Orders',
      icon: Eye,
      onClick: () => navigate('/admin/orders/review'),
      badge: pendingReviews > 0 ? pendingReviews : undefined,
      variant: pendingReviews > 0 ? 'destructive' as const : 'outline' as const
    },
    {
      label: 'Assign Orders',
      icon: Users,
      onClick: () => navigate('/admin/orders/assign'),
      variant: 'outline' as const
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/admin/analytics'),
      variant: 'outline' as const
    },
    {
      label: 'Bids',
      icon: CheckCircle,
      onClick: () => navigate('/admin/orders/picked'),
      badge: pendingBids > 0 ? pendingBids : undefined,
      variant: 'outline' as const
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      onClick: () => navigate('/messages'),
      badge: unreadCount > 0 ? unreadCount : undefined,
      variant: 'outline' as const
    }
  ];

  // Analytics metrics
  const analyticsMetrics = [
    {
      label: 'Total Orders',
      value: totalOrders,
      previousValue: totalOrders - 10,
      trend: 'up' as const
    },
    {
      label: 'Completed',
      value: completedOrders,
      previousValue: completedOrders - 5,
      trend: 'up' as const
    },
    {
      label: 'Pending Review',
      value: pendingReviews,
      previousValue: pendingReviews + 2,
      trend: pendingReviews > 0 ? 'down' as const : 'neutral' as const
    },
    {
      label: 'Revenue (KES)',
      value: totalRevenue,
      previousValue: totalRevenue - 50000,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      trend: 'up' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Admin'}!</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} New
            </Badge>
          )}
          <Button onClick={() => navigate('/admin/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <OrderStatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="lg:col-span-1">
          <PendingTasksCard tasks={pendingTasks} userRole="admin" />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard 
            title="Quick Actions" 
            actions={quickActions}
            columns={2}
          />
        </div>

        {/* Analytics Preview */}
        <div className="lg:col-span-1">
          <MetricsChart 
            title="System Overview"
            metrics={analyticsMetrics}
            columns={2}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders/all')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingReviews > 0 ? (
            <div className="space-y-3">
              {getOrdersByStatus('Submitted').slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Pending Review
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {order.assignedWriter || 'Unassigned'} • {order.pages} pages
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/orders/review?order=${order.id}`)}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
              <p>All caught up! No pending reviews</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

