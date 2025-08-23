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
  ArrowRight
} from "lucide-react";
import { OrderViewModal } from "../components/OrderViewModal";
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
  const { orders, getWriterActiveOrders, getWriterOrderStats, getAvailableOrders } = useOrders();
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
        description: "Complete overview of all your writing assignments.",
        items: [
          { label: "Total Orders", value: writerStats.total.toString(), icon: FileText },
          { label: "Active Orders", value: writerStats.inProgress.toString(), icon: Clock },
          { label: "Completed Orders", value: writerStats.completed.toString(), icon: CheckCircle },
          { label: "Success Rate", value: `${writerStats.total > 0 ? Math.round((writerStats.completed / writerStats.total) * 100) : 0}%`, icon: Star }
        ],
        action: {
          label: "View All Orders",
          onClick: () => navigate('/orders')
        }
      }
    },
    {
      title: "Pending Orders",
      value: writerStats.pending.toString(),
      icon: Clock,
      change: writerStats.pending > 0 ? `${writerStats.pending} awaiting review` : "All caught up!",
      changeType: writerStats.pending > 0 ? "neutral" as const : "positive" as const,
      onClick: () => navigate('/orders'), // Navigate to orders page
      details: {
        description: writerStats.pending > 0 
          ? "Orders waiting for client review and approval." 
          : "Great job! All your orders are processed.",
        items: writerStats.pending > 0 ? [
          { label: "Pending Review", value: writerStats.pending.toString(), icon: Clock },
          { label: "Average Wait Time", value: "2-3 days", icon: Calendar },
          { label: "Next Steps", value: "Awaiting feedback", icon: ArrowRight }
        ] : [
          { label: "Status", value: "All caught up!", icon: CheckCircle },
          { label: "Next Action", value: "Take new orders", icon: FileText }
        ],
        action: writerStats.pending > 0 ? {
          label: "View Pending Orders",
          onClick: () => navigate('/orders')
        } : {
          label: "Browse New Orders",
          onClick: () => navigate('/orders')
        }
      }
    },
    {
      title: "Completed Orders",
      value: writerStats.completed.toString(),
      icon: CheckCircle,
      change: `+${completedOrders.filter(order => {
        const orderDate = new Date(order.updatedAt);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length} this week`,
      changeType: "positive" as const,
      onClick: () => navigate('/orders'), // Navigate to orders page
      details: {
        description: "Successfully completed assignments and their earnings.",
        items: [
          { label: "Total Completed", value: writerStats.completed.toString(), icon: CheckCircle },
          { label: "This Week", value: completedOrders.filter(order => {
            const orderDate = new Date(order.updatedAt);
            const now = new Date();
            const diffDays = Math.ceil((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }).length.toString(), icon: Calendar },
          { label: "Total Earnings", value: `KES ${financialData.totalEarned.toLocaleString()}`, icon: DollarSign },
          { label: "Average per Order", value: `KES ${Math.round(financialData.averageOrderValue)}`, icon: TrendingUp }
        ],
        action: {
          label: "View Completed Orders",
          onClick: () => navigate('/orders')
        }
      }
    },
    {
      title: "Average Rating",
      value: reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      change: `${reviewStats.totalReviews} reviews`,
      changeType: "neutral" as const,
      details: {
        description: "Your performance rating based on client feedback and order completion.",
        items: [
          { label: "Current Rating", value: `${reviewStats.averageRating.toFixed(1)}/5.0`, icon: Star },
          { label: "Total Reviews", value: reviewStats.totalReviews.toString(), icon: FileText },
          { label: "Recent Reviews", value: reviewStats.recentReviews.length.toString(), icon: Star },
          { label: "Success Rate", value: `${performanceData.completionRate.toFixed(1)}%`, icon: CheckCircle }
        ],
        action: {
          label: "View All Reviews",
          onClick: () => navigate('/reviews')
        }
      }
    },
    {
      title: "This Month Earnings",
      value: `KES ${thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
      change: earningsChange !== 0 ? `${earningsChange > 0 ? '+' : ''}${earningsChange}% from last month` : "Starting fresh!",
      changeType: earningsChange > 0 ? "positive" as const : earningsChange < 0 ? "negative" as const : "neutral" as const,
      onClick: () => navigate('/wallet'), // Direct navigation
      details: {
        description: "Your earnings performance for the current month.",
        items: [
          { label: "This Month", value: `KES ${thisMonthEarnings.toLocaleString()}`, icon: TrendingUp },
          { label: "Last Month", value: `KES ${lastMonthEarnings.toLocaleString()}`, icon: Calendar },
          { label: "Change", value: `${earningsChange > 0 ? '+' : ''}${earningsChange}%`, icon: ArrowRight },
          { label: "Projected Annual", value: `KES ${(thisMonthEarnings * 12).toLocaleString()}`, icon: DollarSign }
        ],
        action: {
          label: "View Earnings Report",
          onClick: () => navigate('/wallet')
        }
      }
    }
  ];

  // Get recent orders - show recent available orders for writers to pick
  const availableOrders = getAvailableOrders();
  const recentOrders = availableOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "In Progress": "default",
      "Pending Review": "secondary", 
      "Available": "outline",
      "Completed": "default",
      "Rejected": "destructive"
    };
    return statusColors[status] || "default";
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'browse':
        navigate('/orders');
        break;
      case 'withdrawal':
        navigate('/wallet');
        break;
      case 'reviews':
        navigate('/reviews');
        break;
      case 'messages':
        navigate('/messages');
        break;
      default:
        break;
    }
  };

  const getPerformanceMetrics = () => {
    const onTimeDeliveries = completedOrders.filter(order => {
      const deadline = new Date(order.deadline);
      const completed = new Date(order.updatedAt);
      return completed <= deadline;
    }).length;
    
    const onTimePercentage = completedOrders.length > 0 ? Math.round((onTimeDeliveries / completedOrders.length) * 100) : 100;
    
    return {
      onTimeDelivery: onTimePercentage,
      clientSatisfaction: 4.8,
      monthlyGoal: Math.round((completedOrders.length / Math.max(writerOrders.length, 1)) * 100)
    };
  };

  const performance = getPerformanceMetrics();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your writing assignments today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            gradient={stat.gradient}
            onClick={stat.onClick} // Pass onClick handler
            details={stat.details}
          />
        ))}
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                Recent Available Orders
                {recentOrders.length === 0 && (
                  <span className="text-sm text-gray-500 font-normal">(No available orders)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📚</span>
                        <h4 className="font-semibold text-gray-900">{order.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>📄</span>
                          {order.pages} pages
                        </span>
                        <span className="flex items-center gap-1">
                          <span>💰</span>
                          ${order.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          Due: {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadge(order.status)} className="flex items-center gap-1">
                        {order.status === "In Progress" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                        {order.status === "Submitted" && <span className="text-yellow-600">👁️</span>}
                        {order.status === "Available" && <span className="text-green-600">🔓</span>}
                        {order.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                      >
                        <span className="mr-2">👁️</span>
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p>No available orders right now. Check back later or browse all orders!</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate('/orders')}
                  >
                    Browse All Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200" 
                variant="outline"
                onClick={() => handleQuickAction('browse')}
              >
                <span className="mr-2">📑</span>
                Browse Available Orders
              </Button>
              <Button 
                className="w-full justify-start hover:bg-green-50 hover:border-green-300 transition-all duration-200" 
                variant="outline"
                onClick={() => handleQuickAction('withdrawal')}
              >
                <span className="mr-2">💵</span>
                Request Withdrawal
              </Button>
              <Button 
                className="w-full justify-start hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200" 
                variant="outline"
                onClick={() => handleQuickAction('reviews')}
              >
                <span className="mr-2">⭐</span>
                View My Reviews
              </Button>
              <Button 
                className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" 
                variant="outline"
                onClick={() => handleQuickAction('messages')}
              >
                <span className="mr-2">💬</span>
                Check Messages
              </Button>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>⏰</span>
                  On-time delivery
                </span>
                <span className="text-sm font-medium text-green-600">{performance.onTimeDelivery}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>😊</span>
                  Client satisfaction
                </span>
                <span className="text-sm font-medium text-green-600">{performance.clientSatisfaction}/5</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🎯</span>
                  Monthly goal
                </span>
                <span className="text-sm font-medium text-blue-600">{performance.monthlyGoal}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
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
          userRole="writer"
          onAction={(action, orderId) => {
            if (action === 'pick') {
              // Handle pick order action
              console.log('Picking order:', orderId);
            }
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          activeOrdersCount={activeOrders.length}
        />
      )}
    </div>
  );
}