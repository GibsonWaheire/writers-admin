/**
 * Enhanced Writer Dashboard
 * Modern, comprehensive dashboard with improved UI/UX
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
  BookOpen, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Star,
  RefreshCw,
  Upload,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getWriterIdForUser } from '../../utils/writer';
import { getPendingBidsCount, getWriterPendingBids, getWriterApprovedBids } from '../../utils/bidHelpers';
import type { Order } from '../../types/order';
import type { PendingTask } from '../../components/dashboard/PendingTasksCard';

export default function EnhancedWriterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, getWriterActiveOrders, getWriterOrderStats, getAvailableOrders } = useOrders();
  const { wallet, getMonthlyEarnings } = useWallet();
  const { notifications, unreadCount } = useNotifications();
  
  const currentWriterId = getWriterIdForUser(user?.id);
  const writerOrders = orders.filter(order => order.writerId === currentWriterId);
  const activeOrders = getWriterActiveOrders(currentWriterId);
  const availableOrders = getAvailableOrders();
  const writerStats = getWriterOrderStats(currentWriterId);
  
  // Get pending tasks
  const pendingTasks: PendingTask[] = [
    {
      id: 'revisions',
      title: 'Orders Requiring Revision',
      type: 'revision',
      priority: 'high',
      count: writerOrders.filter(o => o.status === 'Revision').length,
      actionUrl: '/orders/revisions'
    },
    {
      id: 'submitted',
      title: 'Orders Pending Review',
      type: 'review',
      priority: 'medium',
      count: writerOrders.filter(o => o.status === 'Submitted').length,
      actionUrl: '/orders/completed'
    },
    {
      id: 'pending-bids',
      title: 'Pending Bids',
      type: 'approval',
      priority: 'medium',
      count: getWriterPendingBids(orders, currentWriterId).length,
      actionUrl: '/orders/picked'
    }
  ].filter(task => (task.count || 0) > 0);

  // Calculate metrics
  const thisMonthEarnings = getMonthlyEarnings();
  const lastMonthEarnings = getMonthlyEarnings(new Date().getMonth() - 1);
  const earningsChange = lastMonthEarnings > 0 
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) 
    : 0;

  const completionRate = writerStats.total > 0 
    ? Math.round((writerStats.completed / writerStats.total) * 100) 
    : 0;

  // Stats cards
  const stats = [
    {
      title: 'Available Orders',
      value: availableOrders.length,
      icon: BookOpen,
      change: {
        value: `${availableOrders.length} ready to pick`,
        type: availableOrders.length > 0 ? 'positive' as const : 'neutral' as const
      },
      actionUrl: '/orders/available',
      details: {
        description: 'Orders currently available for you to pick up',
        items: [
          { label: 'Available Now', value: availableOrders.length, icon: BookOpen },
          { label: 'Your Active Orders', value: writerStats.inProgress, icon: FileText },
          { label: 'Completed This Month', value: writerStats.completed, icon: CheckCircle }
        ],
        action: {
          label: 'Browse Available Orders',
          onClick: () => navigate('/orders/available')
        }
      }
    },
    {
      title: 'Wallet Balance',
      value: `KES ${wallet.availableBalance.toLocaleString()}`,
      icon: DollarSign,
      change: {
        value: `+KES ${thisMonthEarnings.toLocaleString()} this month`,
        type: thisMonthEarnings > 0 ? 'positive' as const : 'neutral' as const
      },
      gradient: true,
      actionUrl: '/wallet',
      details: {
        description: 'Your current available balance',
        items: [
          { label: 'Available', value: `KES ${wallet.availableBalance.toLocaleString()}`, icon: DollarSign },
          { label: 'Pending', value: `KES ${wallet.pendingEarnings.toLocaleString()}`, icon: Clock },
          { label: 'Total Earned', value: `KES ${wallet.totalEarned.toLocaleString()}`, icon: TrendingUp }
        ],
        action: {
          label: 'Go to Wallet',
          onClick: () => navigate('/wallet')
        }
      }
    },
    {
      title: 'Active Orders',
      value: writerStats.inProgress,
      icon: FileText,
      change: {
        value: `${activeOrders.length} in progress`,
        type: 'neutral' as const
      },
      actionUrl: '/orders/assigned',
      badge: {
        text: `${writerStats.submitted} submitted`,
        variant: 'secondary' as const
      }
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Star,
      change: {
        value: `${writerStats.completed} completed`,
        type: completionRate > 80 ? 'positive' as const : 'neutral' as const
      },
      actionUrl: '/orders/completed'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: 'Browse Orders',
      icon: BookOpen,
      onClick: () => navigate('/orders/available'),
      badge: availableOrders.length > 0 ? availableOrders.length : undefined
    },
    {
      label: 'My Orders',
      icon: FileText,
      onClick: () => navigate('/orders/assigned'),
      badge: activeOrders.length > 0 ? activeOrders.length : undefined
    },
    {
      label: 'Revisions',
      icon: RefreshCw,
      onClick: () => navigate('/orders/revisions'),
      badge: writerStats.revision > 0 ? writerStats.revision : undefined,
      variant: writerStats.revision > 0 ? 'destructive' as const : 'outline' as const
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      onClick: () => navigate('/messages'),
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      label: 'Upload Files',
      icon: Upload,
      onClick: () => navigate('/orders/assigned'),
      variant: 'secondary' as const
    },
    {
      label: 'Notifications',
      icon: Bell,
      onClick: () => navigate('/notifications'),
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  // Analytics metrics
  const analyticsMetrics = [
    {
      label: 'Total Orders',
      value: writerStats.total,
      previousValue: writerStats.total - writerStats.completed
    },
    {
      label: 'Completed',
      value: writerStats.completed,
      previousValue: writerStats.completed - 1,
      trend: 'up' as const
    },
    {
      label: 'In Progress',
      value: writerStats.inProgress,
      previousValue: writerStats.inProgress
    },
    {
      label: 'Earnings (KES)',
      value: wallet.totalEarned,
      previousValue: wallet.totalEarned - thisMonthEarnings,
      format: (v: number) => `KES ${v.toLocaleString()}`,
      trend: 'up' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Writer'}!</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} New
            </Badge>
          )}
          <Button onClick={() => navigate('/notifications')}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
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
          <PendingTasksCard tasks={pendingTasks} userRole="writer" />
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
            title="Performance Overview"
            metrics={analyticsMetrics}
            columns={2}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/orders/assigned')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeOrders.length > 0 ? (
            <div className="space-y-3">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      order.status === 'Submitted' ? 'bg-purple-100' :
                      order.status === 'In Progress' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        order.status === 'Submitted' ? 'text-purple-600' :
                        order.status === 'In Progress' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {order.pages} pages • Due {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/orders/assigned?order=${order.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No active orders</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/orders/available')}
              >
                Browse Available Orders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

