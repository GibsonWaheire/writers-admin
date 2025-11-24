import { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../contexts/OrderContext";
import { useUsers } from "../contexts/UsersContext";
import { UploadNewOrderModal } from "../components/UploadNewOrderModal";
import type { Order } from "../types/order";
import { 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  UserCheck,
  AlertTriangle,
  Eye,
  UserPlus,
  Plus,
  BarChart3,
  Star,
  Download,
  RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { orders, getOrdersByStatus, createOrder, refreshOrders } = useOrders();
  const { writers, filterWriters } = useUsers();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh all data on mount and when needed
  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshOrders();
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    };
    refreshData();
  }, [refreshOrders]);

  // Calculate real-time stats from order data and writers
  const calculateStats = () => {
    const totalOrders = orders.length;
    
    // Get active writers from writers table (not just from orders)
    const activeWritersList = filterWriters({ status: 'active' });
    const activeWritersCount = activeWritersList.length;
    
    // Also count writers with active orders
    const writersWithOrders = Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId!))).length;
    
    const pendingReviews = getOrdersByStatus('Awaiting Approval').length;
    const completedOrders = getOrdersByStatus('Completed').length + getOrdersByStatus('Approved').length;
    const totalRevenue = orders
      .filter(o => ['Completed', 'Approved'].includes(o.status))
      .reduce((sum, order) => sum + (order.pages * 350), 0);
    
    // Calculate completion rate
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    return {
      totalOrders,
      activeWriters: activeWritersCount, // Use actual active writers count
      writersWithOrders, // Writers who have orders
      pendingReviews,
      completedOrders,
      totalRevenue,
      completionRate
    };
  };

  const stats = calculateStats();

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      // Small delay to show refresh animation
      setTimeout(() => setIsRefreshing(false), 500);
    } catch (error) {
      console.error('Failed to refresh:', error);
      setIsRefreshing(false);
    }
  };

  const pendingOrders = [
    ...getOrdersByStatus('Awaiting Approval').slice(0, 3), // Show first 3 orders awaiting approval
    ...getOrdersByStatus('Revision').slice(0, 2)   // Show first 2 revision orders
  ].map(order => ({
    id: order.id,
    title: order.title,
    writer: order.assignedWriter || 'Unassigned',
    pages: order.pages,
    price: `KES ${(order.pages * 350).toLocaleString()}`,
    deadline: order.deadline,
    status: order.status === 'Awaiting Approval' ? 'Pending Review' : 'Revision Required',
    priority: order.status === 'Awaiting Approval' ? 'High' : 'Medium'
  }));

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "Pending Review": "secondary",
      "Revision Required": "destructive",
      "In Progress": "default", 
      "Available": "outline",
      "Completed": "default",
      "Rejected": "destructive"
    };
    return statusColors[status] || "default";
  };

  const getPriorityBadge = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    const priorityColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "High": "destructive",
      "Medium": "secondary",
      "Low": "outline"
    };
    return priorityColors[priority] || "default";
  };

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handleViewOrder = () => {
    navigate('/admin/orders');
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    try {
      await createOrder(orderData);
      // Order will be automatically available for writers
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleExportDatabase = () => {
    try {
      // Get current database state from localStorage
      const dbKey = 'writers_admin_db';
      const currentDb = localStorage.getItem(dbKey);
      
      if (currentDb) {
        // Parse the database
        const db = JSON.parse(currentDb);
        
        // Create download link
        const jsonData = JSON.stringify(db, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'db.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Database exported successfully:', {
          ordersCount: db.orders?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        // Show success message
        alert(`Database exported successfully!\nOrders: ${db.orders?.length || 0}\n\nPlease save the downloaded 'db.json' file to your project root to replace the existing one.`);
        
      } else {
        console.error('No database found in localStorage');
        alert('No database found in localStorage');
      }
    } catch (error) {
      console.error('Failed to export database:', error);
      alert('Failed to export database. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome to the administrative control panel. Manage your writing platform from here.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 text-lg"
            >
              <RefreshCw className={`mr-2 h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync Data'}
            </Button>
            
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
            >
              <Plus className="mr-2 h-6 w-6" />
              Upload New Order
            </Button>
            
            <Button 
              onClick={handleExportDatabase}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 px-6 py-3 text-lg"
            >
              <Download className="mr-2 h-6 w-6" />
              Export Database
            </Button>
          </div>
        </div>
        
        {/* Sync Status */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-lg">🔄</div>
            <div className="text-sm text-green-800 flex-1">
              <p className="font-medium mb-1">Real-time Sync Active:</p>
              <p>All data (orders, writers, stats) syncs automatically. Use the "Sync Data" button to manually refresh if needed. Currently showing {orders.length} orders and {stats.activeWriters} active writers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={FileText}
          change={`${orders.length} total`}
          changeType="positive"
          gradient={true}
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Active Writers"
          value={stats.activeWriters.toString()}
          icon={Users}
          change={`${stats.writersWithOrders} with orders`}
          changeType="positive"
          onClick={() => navigate('/admin/orders/writers')}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews.toString()}
          icon={Clock}
          change={`${stats.pendingReviews} urgent`}
          changeType="neutral"
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders.toString()}
          icon={CheckCircle}
          change={`${stats.completedOrders} done`}
          changeType="positive"
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={`KES ${stats.totalRevenue.toLocaleString()}`}
          changeType="positive"
          onClick={() => navigate('/admin/financial')}
        />

      </div>

      {/* Main Navigation Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
          onClick={() => handleNavigation('/admin/orders')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Orders Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Manage and monitor all writing orders, assign writers, and review submissions
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
          onClick={() => handleNavigation('/admin/writers')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">👥</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Writer Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Monitor writer performance, manage accounts, and track productivity metrics
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200"
          onClick={() => handleNavigation('/admin/reviews')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Reviews & Ratings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Monitor client feedback, ratings, and quality metrics for all writers
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200"
          onClick={() => handleNavigation('/admin/financial')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Financial Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Track payments, earnings, and financial reports for the platform
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200"
          onClick={() => handleNavigation('/admin/users')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">👤</span>
              </div>
              <CardTitle className="text-lg text-gray-800">User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Manage writer accounts, permissions, and platform access controls
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200"
          onClick={() => handleNavigation('/admin/analytics')}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Analytics & Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Comprehensive analytics, performance reports, and business insights
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Orders Requiring Action
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/orders')}
                className="text-xs"
              >
                View All Orders
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                     onClick={() => navigate('/admin/orders')}>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{order.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Writer: {order.writer}</span>
                      <span>{order.pages} pages</span>
                      <span>{order.price}</span>
                      <span>Due: {new Date(order.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadge(order.priority)}>
                      {order.priority}
                    </Badge>
                    <Badge variant={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder();
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">No orders require immediate action</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/orders')}
                  className="text-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="default"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Order
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleNavigation('/admin/orders?tab=pending-assignment')}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Orders
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleNavigation('/admin/users')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Writers
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleNavigation('/admin/financial')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Process Payments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              Recent System Activity
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/analytics')}
              className="text-xs"
            >
              View Analytics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.length > 0 && (
              <>
                <div 
                  className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate('/admin/orders')}
                >
                  <span className="text-green-600">✅</span>
                  <span>Total orders in system: {orders.length}</span>
                  <span className="text-muted-foreground text-xs ml-auto">Current</span>
                </div>
                <div 
                  className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate('/admin/orders/writers')}
                >
                  <span className="text-blue-600">👤</span>
                  <span>Active writers: {stats.activeWriters} ({stats.writersWithOrders} with orders)</span>
                  <span className="text-muted-foreground text-xs ml-auto">Current</span>
                </div>
                <div 
                  className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-yellow-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate('/admin/orders')}
                >
                  <span className="text-yellow-600">📄</span>
                  <span>Orders pending review: {stats.pendingReviews}</span>
                  <span className="text-muted-foreground text-xs ml-auto">Current</span>
                </div>
                <div 
                  className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate('/admin/financial')}
                >
                  <span className="text-purple-600">💰</span>
                  <span>Total revenue: KES {stats.totalRevenue.toLocaleString()}</span>
                  <span className="text-muted-foreground text-xs ml-auto">Current</span>
                </div>
              </>
            )}
            {orders.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">No activity data available</p>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(true)}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Order
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Order Modal */}
      <UploadNewOrderModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}