import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  Star,
  TrendingUp,
  Calendar,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { OrderViewModal } from "../components/OrderViewModal";
import { RealTimeOrderIndicator } from "../components/RealTimeOrderIndicator";
import { useOrders } from "../contexts/OrderContext";
import { useWallet } from "../contexts/WalletContext";
import { useReviews } from "../contexts/ReviewsContext";
import { useFinancial } from "../contexts/FinancialContext";
import { useAnalytics } from "../contexts/AnalyticsContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../types/order";

export default function WriterDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { orders, getWriterActiveOrders, getWriterOrderStats, getAvailableOrders, availableOrdersCount } = useOrders();
  const { wallet, getMonthlyEarnings } = useWallet();
  const { getWriterStats: getReviewStats } = useReviews();
  const { getWriterFinancials } = useFinancial();
  const { getWriterPerformance } = useAnalytics();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Map user ID to writer ID - this handles the mismatch between auth user ID and writer profile ID
  const getWriterIdForUser = (userId: string) => {
    // For demo purposes, map user ID "1" to writer ID "writer-1"
    // In a real app, this would be stored in the user record or writers table
    const userToWriterMap: Record<string, string> = {
      '1': 'writer-1',
      '2': 'writer-2',
      'writer-1': 'writer-1', // Handle cases where writer-1 is passed directly
      'writer-2': 'writer-2'  // Handle cases where writer-2 is passed directly
    };
    return userToWriterMap[userId] || userId;
  };
  
  // Get writer-specific data using the mapped writer ID
  const currentWriterId = user?.id ? getWriterIdForUser(user.id) : 'writer-1';
  const writerOrders = orders.filter(order => order.writerId === currentWriterId);
  const activeOrders = getWriterActiveOrders(currentWriterId);
  const completedOrders = writerOrders.filter(order => 
    ['Completed', 'Approved'].includes(order.status)
  );
  const writerStats = getWriterOrderStats(currentWriterId);
  
  // Get integrated data from new systems
  const reviewStats = getReviewStats(currentWriterId);
  const financialData = getWriterFinancials(currentWriterId);
  const performanceData = getWriterPerformance(currentWriterId);
  
  // Calculate real statistics
  const totalEarnings = financialData.totalEarned;
  const thisMonthEarnings = getMonthlyEarnings();
  const lastMonthEarnings = getMonthlyEarnings(new Date().getMonth() - 1);
  const earningsChange = lastMonthEarnings > 0 ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) : 0;
  
  const stats = [
    {
      title: "Available Orders",
      value: availableOrdersCount.toString(),
      icon: BookOpen,
      change: `${availableOrdersCount} orders ready to pick`,
      changeType: availableOrdersCount > 0 ? "positive" as const : "neutral" as const,
      onClick: () => navigate('/available-orders'), // Navigate to available orders
      details: {
        description: "Orders currently available for you to pick up and work on.",
        items: [
          { label: "Available Now", value: availableOrdersCount.toString(), icon: BookOpen },
          { label: "Your Active Orders", value: writerStats.inProgress.toString(), icon: FileText },
          { label: "Completed This Month", value: writerStats.completed.toString(), icon: CheckCircle }
        ],
        action: {
          label: "View Available Orders",
          onClick: () => navigate('/available-orders')
        }
      }
    },
    {
      title: "Wallet Balance",
      value: `KES ${wallet.availableBalance.toLocaleString()}`,
      icon: DollarSign,
      change: `+KES ${thisMonthEarnings.toLocaleString()} this month`,
      changeType: thisMonthEarnings > 0 ? "positive" as const : "neutral" as const,
      gradient: true,
      onClick: () => navigate('/wallet'), // Direct navigation
      details: {
        description: "Your current available balance for withdrawals and spending.",
        items: [
          { label: "Available Balance", value: `KES ${wallet.availableBalance.toLocaleString()}`, icon: DollarSign },
          { label: "Pending Earnings", value: `KES ${wallet.pendingEarnings.toLocaleString()}`, icon: Clock },
          { label: "Total Earned", value: `KES ${wallet.totalEarned.toLocaleString()}`, icon: TrendingUp },
          { label: "Total Withdrawn", value: `KES ${wallet.totalWithdrawn.toLocaleString()}`, icon: ArrowRight }
        ],
        action: {
          label: "Go to Wallet",
          onClick: () => navigate('/wallet')
        }
      }
    },
    {
      title: "Total Orders",
      value: writerStats.total.toString(),
      icon: FileText,
      change: `${writerStats.inProgress} active now`,
      changeType: "positive" as const,
      onClick: () => navigate('/orders'), // Direct navigation
      details: {
        description: "Your order history and current workload.",
        items: [
          { label: "Total Orders", value: writerStats.total.toString(), icon: FileText },
          { label: "Active Orders", value: writerStats.inProgress.toString(), icon: Clock },
          { label: "Completed Orders", value: writerStats.completed.toString(), icon: CheckCircle },
          { label: "Success Rate", value: `${Math.round((writerStats.completed / Math.max(writerStats.total, 1)) * 100)}%`, icon: Star }
        ],
        action: {
          label: "View All Orders",
          onClick: () => navigate('/orders')
        }
      }
    },
    {
      title: "Active Orders",
      value: writerStats.inProgress.toString(),
      icon: Clock,
      change: `${activeOrders.length} in progress`,
      changeType: "positive" as const,
      onClick: () => navigate('/orders'), // Direct navigation
      details: {
        description: "Orders you're currently working on.",
        items: activeOrders.slice(0, 3).map(order => ({
          label: order.title.substring(0, 30) + (order.title.length > 30 ? '...' : ''),
          value: order.status,
          icon: Clock
        })),
        action: {
          label: "View Active Orders",
          onClick: () => navigate('/orders')
        }
      }
    },
    {
      title: "This Month",
      value: `KES ${thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
      change: `${earningsChange > 0 ? '+' : ''}${earningsChange}% from last month`,
      changeType: earningsChange > 0 ? "positive" as const : earningsChange < 0 ? "negative" as const : "neutral" as const,
      onClick: () => navigate('/wallet'), // Direct navigation
      details: {
        description: "Your earnings performance this month.",
        items: [
          { label: "This Month", value: `KES ${thisMonthEarnings.toLocaleString()}`, icon: TrendingUp },
          { label: "Last Month", value: `KES ${lastMonthEarnings.toLocaleString()}`, icon: Calendar },
          { label: "Change", value: `${earningsChange > 0 ? '+' : ''}${earningsChange}%`, icon: earningsChange > 0 ? TrendingUp : TrendingUp },
          { label: "Total Earned", value: `KES ${totalEarnings.toLocaleString()}`, icon: DollarSign }
        ],
        action: {
          label: "View Earnings",
          onClick: () => navigate('/wallet')
        }
      }
    },
    {
      title: "Rating",
      value: (reviewStats.averageRating || 0).toFixed(1),
      icon: Star,
      change: `${reviewStats.totalReviews || 0} reviews`,
      changeType: "positive" as const,
      onClick: () => navigate('/reviews'), // Direct navigation
      details: {
        description: "Your performance rating and client feedback.",
        items: [
          { label: "Average Rating", value: (reviewStats.averageRating || 0).toFixed(1), icon: Star },
          { label: "Total Reviews", value: (reviewStats.totalReviews || 0).toString(), icon: FileText },
          { label: "Recent Reviews", value: (reviewStats.recentReviews?.length || 0).toString(), icon: Star },
          { label: "Performance", value: `${Math.round((reviewStats.averageRating || 0) * 20)}%`, icon: CheckCircle }
        ],
        action: {
          label: "View Reviews",
          onClick: () => navigate('/reviews')
        }
      }
    },
    {
      title: "Performance",
      value: `${performanceData.completionRate || 0}%`,
      icon: CheckCircle,
      change: `${performanceData.onTimeDeliveryRate || 0}% on-time`,
      changeType: "positive" as const,
      onClick: () => navigate('/analytics'), // Direct navigation
      details: {
        description: "Your overall performance metrics.",
        items: [
          { label: "Completion Rate", value: `${performanceData.completionRate || 0}%`, icon: CheckCircle },
          { label: "On-Time Delivery", value: `${performanceData.onTimeDeliveryRate || 0}%`, icon: Clock },
          { label: "Client Satisfaction", value: `${performanceData.clientSatisfactionScore || 0}%`, icon: Star },
          { label: "Revision Rate", value: `${performanceData.revisionRate || 0}%`, icon: TrendingUp }
        ],
        action: {
          label: "View Analytics",
          onClick: () => navigate('/analytics')
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Writer Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your writing performance overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/orders')}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Orders
            </Button>
            <Button 
              onClick={() => navigate('/wallet')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Wallet
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Order Indicator */}
      <RealTimeOrderIndicator userRole="writer" />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            gradient={stat.gradient}
            onClick={stat.onClick}
            details={stat.details}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Orders */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-800">Active Orders</CardTitle>
                <p className="text-blue-600 text-sm">{activeOrders.length} orders in progress</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{order.title}</h4>
                    <p className="text-xs text-gray-600">{order.discipline}</p>
                  </div>
                  <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                    {order.status}
                  </Badge>
                </div>
              ))}
              {activeOrders.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No active orders</p>
                </div>
              )}
            </div>
            {activeOrders.length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={() => navigate('/orders')}
              >
                View All Active Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Available Orders */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-green-800">Available Orders</CardTitle>
                <p className="text-green-600 text-sm">{getAvailableOrders().length} orders waiting</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAvailableOrders().slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{order.title}</h4>
                    <p className="text-xs text-gray-600">{order.discipline} • {order.pages} pages</p>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    KES {order.totalPriceKES?.toLocaleString() || 'N/A'}
                  </Badge>
                </div>
              ))}
              {getAvailableOrders().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No available orders</p>
                </div>
              )}
            </div>
            {getAvailableOrders().length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={() => navigate('/orders')}
              >
                Pick Up Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-800">Recent Activity</CardTitle>
                <p className="text-purple-600 text-sm">Your latest achievements</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{order.title}</h4>
                    <p className="text-xs text-gray-600">Completed • KES {order.totalPriceKES?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No completed orders yet</p>
                </div>
              )}
            </div>
            {completedOrders.length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                onClick={() => navigate('/orders')}
              >
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          userRole={user?.role || 'writer'}
          onAction={async (action: string, orderId: string, data?: Record<string, unknown>) => {
            // Handle order actions from modal
            console.log('Order action:', action, orderId, data);
          }}
        />
      )}
    </div>
  );
}