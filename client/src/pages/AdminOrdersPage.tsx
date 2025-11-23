import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus,
  Clock,
  DollarSign,
  FileText,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  Eye,
  UserCheck
} from "lucide-react";
import { OrderCard } from "../components/OrderCard";
import { OrderViewModal } from "../components/OrderViewModal";
import { OrderAssignmentModal } from "../components/OrderAssignmentModal";
import { AdminOrdersTable } from "../components/AdminOrdersTable";
import { UploadNewOrderModal } from "../components/UploadNewOrderModal";
import { OrderManagementModal } from "../components/OrderManagementModal";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { useUsers } from "../contexts/UsersContext";
import type { Order } from "../types/order";

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [orderToManage, setOrderToManage] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("under-review");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");
  const [filterPaperType, setFilterPaperType] = useState<string>("");
  const [filterPriceRange, setFilterPriceRange] = useState<string>("");

  const { 
    orders, 
    handleOrderAction, 
    getOrdersByStatus, 
    getAvailableOrders,
    getWriterActiveOrders,
    getWriterOrderStats,
    getWriterTotalEarnings,
    createOrder,
    updateOrder,
    deleteOrder,
    addAdminMessage
  } = useOrders();
  const { user } = useAuth();
  const { writers } = useUsers();
  
  const userRole = user?.role || 'admin';

  // Debug: Monitor orders state changes
  useEffect(() => {
    console.log('🔍 AdminOrdersPage: Orders state updated:', {
      totalOrders: orders.length,
      availableOrders: orders.filter(o => o.status === 'Available').length,
      assignedOrders: orders.filter(o => o.status === 'Assigned').length,
      submittedOrders: orders.filter(o => o.status === 'Submitted').length,
      completedOrders: orders.filter(o => o.status === 'Completed').length,
      orders: orders.map(o => ({ id: o.id, status: o.status, writerId: o.writerId, assignedWriter: o.assignedWriter }))
    });
  }, [orders]);

  // Add manual refresh function
  const handleRefreshOrders = async () => {
    console.log('🔄 AdminOrdersPage: Manually refreshing orders...');
    try {
      // Force refresh from context
      await handleOrderAction('refresh', 'dummy', {});
      console.log('✅ AdminOrdersPage: Orders refreshed successfully');
    } catch (error) {
      console.error('❌ AdminOrdersPage: Failed to refresh orders:', error);
    }
  };

  // Admin-focused order categories
  const underReviewOrders = getOrdersByStatus('Submitted');
  const revisionRequests = getOrdersByStatus('Revision');
  const approvedOrders = getOrdersByStatus('Approved');
  const rejectedOrders = getOrdersByStatus('Rejected');
  const completedOrders = getOrdersByStatus('Completed');
  const availableOrders = getAvailableOrders(); // Available orders that can be assigned

  // Get writer-specific orders for monitoring (not for action)
  const allWriters = Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId!)));
  const writerStats = allWriters.map(writerId => {
    // Use context functions for better consistency and performance
    const writerOrders = getWriterActiveOrders(writerId);
    const writerStatsFromContext = getWriterOrderStats(writerId);
    const stats = {
      writerId,
      writerName: writerOrders[0]?.assignedWriter || 'Unknown',
      total: writerStatsFromContext.total,
      inProgress: writerStatsFromContext.inProgress,
      submitted: writerStatsFromContext.submitted,
      completed: writerStatsFromContext.completed,
      rejected: writerStatsFromContext.rejected,
      earnings: getWriterTotalEarnings(writerId),
      // Add performance metrics
      completionRate: writerStatsFromContext.total > 0 ? 
        Math.round((writerStatsFromContext.completed / writerStatsFromContext.total) * 100) : 0,
      activeOrders: writerStatsFromContext.inProgress + writerStatsFromContext.submitted
    };
    return stats;
  });

  // Filter orders based on search and filters
  const filterOrders = (orderList: Order[]) => {
    return orderList.filter(order => {
      const matchesSearch = 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.paperType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDiscipline = !filterDiscipline || order.discipline === filterDiscipline;
      const matchesPaperType = !filterPaperType || order.paperType === filterPaperType;
      
      let matchesPrice = true;
      if (filterPriceRange) {
        const [min, max] = filterPriceRange.split('-').map(Number);
        if (max) {
          matchesPrice = (order.pages * 350) >= min && (order.pages * 350) <= max;
        } else {
          matchesPrice = (order.pages * 350) >= min;
        }
      }
      
      return matchesSearch && matchesDiscipline && matchesPaperType && matchesPrice;
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    if (action === 'assign') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setOrderToAssign(order);
        setShowAssignmentModal(true);
      }
      return;
    }
    
    if (action === 'make_available') {
      console.log('🔄 AdminOrdersPage: Making order available, orderId:', orderId);
      handleOrderAction('make_available', orderId, additionalData).then(() => {
        console.log('✅ AdminOrdersPage: make_available completed, refreshing orders...');
        // Force a refresh after the action completes
        setTimeout(() => {
          console.log('🔄 AdminOrdersPage: Forcing refresh after timeout...');
          handleRefreshOrders();
        }, 1000);
      });
      return;
    }
    
    handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleAssignToWriter = (writerId: string, options: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    requireConfirmation?: boolean;
  }) => {
    if (orderToAssign) {
      // Get the actual writer name from the writers data
      const writer = writers.find(w => w.id === writerId);
      const writerName = writer?.name || 'Unknown Writer';
      
      console.log('🔄 Admin assigning order with enhanced options:', {
        orderId: orderToAssign.id,
        writerId,
        writerName,
        options,
        writer
      });
      
      handleOrderAction('assign', orderToAssign.id, { 
        writerId, 
        writerName,
        notes: options.notes,
        priority: options.priority,
        deadline: options.deadline,
        requireConfirmation: options.requireConfirmation
      });
      setShowAssignmentModal(false);
      setOrderToAssign(null);
    }
  };

  const handleMakeAvailable = (notes?: string) => {
    if (orderToAssign) {
      console.log('🔄 Admin making order available:', {
        orderId: orderToAssign.id,
        notes
      });
      
      handleOrderAction('make_available', orderToAssign.id, { notes });
      setShowAssignmentModal(false);
      setOrderToAssign(null);
    }
  };

  // Direct make available function for OrderCard buttons
  const handleDirectMakeAvailable = (orderId: string) => {
    console.log('🔄 Admin directly making order available:', { orderId });
    
    // Find the order to get its current status
    const order = orders.find(o => o.id === orderId);
    if (order) {
      console.log('📋 Order details before make available:', {
        id: order.id,
        status: order.status,
        writerId: order.writerId,
        assignedWriter: order.assignedWriter
      });
      
      console.log('📞 Calling handleOrderAction with:', {
        action: 'make_available',
        orderId,
        additionalData: { 
          notes: 'Made available directly by admin',
          source: 'direct_button'
        }
      });
      
      handleOrderAction('make_available', orderId, { 
        notes: 'Made available directly by admin',
        source: 'direct_button'
      });
      
      console.log('✅ handleOrderAction called successfully');
    } else {
      console.error('❌ Order not found:', orderId);
    }
  };

  // Handle create order
  const handleCreateOrder = async (orderData: Partial<Order>) => {
    try {
      const newOrder = await createOrder(orderData);
      setShowUploadModal(false);
      
      console.log('✅ AdminOrdersPage: Order uploaded successfully and is now available for writers:', {
        orderId: newOrder.id,
        title: newOrder.title,
        status: newOrder.status
      });
      
      // Optional: Add a toast notification here
      // toast.success(`Order "${newOrder.title}" uploaded and is now available for writers to pick up!`);
      
    } catch (error) {
      console.error('❌ AdminOrdersPage: Error creating order:', error);
    }
  };

  // Handle order management
  const handleManageOrder = (order: Order) => {
    setOrderToManage(order);
    setShowManagementModal(true);
  };

  // Get unique disciplines and paper types for filters
  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();
  const paperTypes = Array.from(new Set(orders.map(order => order.paperType))).sort();

  // Calculate admin metrics
  const calculateAdminMetrics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => ['Completed', 'Approved'].includes(o.status))
      .reduce((sum, order) => sum + (order.pages * 350), 0);
    const pendingReviews = underReviewOrders.length;
    const urgentRevisions = revisionRequests.length;
    const completionRate = totalOrders > 0 ? 
      Math.round((completedOrders.length / totalOrders) * 100) : 0;
    
    return {
      totalOrders,
      totalRevenue,
      pendingReviews,
      urgentRevisions,
      completionRate
    };
  };

  const adminMetrics = calculateAdminMetrics();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Orders Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all writing orders, assign writers, and review submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload New Order
          </Button>
          

          
          {/* Manual refresh button */}
          <Button 
            variant="outline"
            onClick={handleRefreshOrders}
            className="ml-2"
          >
            🔄 Refresh Orders
          </Button>
        </div>
      </div>

      {/* Admin Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{adminMetrics.totalOrders}</div>
            <p className="text-xs text-blue-600">All platform orders</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{adminMetrics.pendingReviews}</div>
            <p className="text-xs text-yellow-600">Awaiting admin action</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Revision Requests</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{adminMetrics.urgentRevisions}</div>
            <p className="text-xs text-red-600">Need writer attention</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{adminMetrics.completionRate}%</div>
            <p className="text-xs text-green-600">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">KES {adminMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-purple-700">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Disciplines</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
            
            <select
              value={filterPaperType}
              onChange={(e) => setFilterPaperType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Paper Types</option>
              {paperTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={filterPriceRange}
              onChange={(e) => setFilterPriceRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Prices</option>
              <option value="0-20000">KES 0 - 20,000</option>
              <option value="20000-50000">KES 20,000 - 50,000</option>
              <option value="50000-100000">KES 50,000 - 100,000</option>
              <option value="100000-">KES 100,000+</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* All Orders Table - Comprehensive View */}
      <AdminOrdersTable
        orders={orders}
        onView={handleViewOrder}
        onAction={(action, orderId, additionalData) => {
          if (action === 'make_available') {
            handleDirectMakeAvailable(orderId);
          } else {
            handleOrderActionLocal(action, orderId, additionalData);
          }
        }}
        onAssign={(order) => {
          setOrderToAssign(order);
          setShowAssignmentModal(true);
        }}
        onManage={handleManageOrder}
      />

      {/* Legacy Tabs - Keep for specific workflows if needed */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="under-review" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Under Review ({filterOrders(underReviewOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="revision-requests" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Revision Requests ({filterOrders(revisionRequests).length})
          </TabsTrigger>

          <TabsTrigger value="pending-assignment" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Pending Assignment ({filterOrders(availableOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({filterOrders(approvedOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({filterOrders(rejectedOrders).length})
          </TabsTrigger>

          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Completed ({filterOrders(completedOrders).length})
          </TabsTrigger>
        </TabsList>

        {/* Under Review Tab */}
        <TabsContent value="under-review" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Orders Under Review</h3>
            <p className="text-sm text-gray-600">
              {underReviewOrders.length} orders awaiting admin review
            </p>
          </div>
          
          {filterOrders(underReviewOrders).length > 0 ? (
            filterOrders(underReviewOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={(action, orderId, additionalData) => {
                  if (action === 'make_available') {
                    handleDirectMakeAvailable(orderId);
                  } else {
                    handleOrderActionLocal(action, orderId, additionalData);
                  }
                }}
                showActions={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Under Review</h3>
              <p className="text-gray-500">All submitted orders have been reviewed.</p>
            </div>
          )}
        </TabsContent>

        {/* Revision Requests Tab */}
        <TabsContent value="revision-requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revision Requests</h3>
            <p className="text-sm text-gray-600">
              {revisionRequests.length} orders need revision
            </p>
          </div>
          
          {filterOrders(revisionRequests).length > 0 ? (
            filterOrders(revisionRequests).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={(action, orderId, additionalData) => {
                  if (action === 'make_available') {
                    handleDirectMakeAvailable(orderId);
                  } else {
                    handleOrderActionLocal(action, orderId, additionalData);
                  }
                }}
                showActions={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Revision Requests</h3>
              <p className="text-gray-500">All orders are up to standard.</p>
            </div>
          )}
        </TabsContent>

        {/* Pending Assignment Tab */}
        <TabsContent value="pending-assignment" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Orders Pending Assignment</h3>
            <p className="text-sm text-gray-600">
              {availableOrders.length} orders available for writer assignment
            </p>
          </div>
          
          {filterOrders(availableOrders).length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-medium">Admin Assignment Required</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  These orders need to be manually assigned to writers or made available for self-selection.
                </p>
              </div>
              
              {filterOrders(availableOrders).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onView={handleViewOrder}
                  onAction={(action, orderId, additionalData) => {
                    if (action === 'make_available') {
                      handleDirectMakeAvailable(orderId);
                    } else {
                      handleOrderActionLocal(action, orderId, additionalData);
                    }
                  }}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Pending Assignment</h3>
              <p className="text-gray-500">All orders have been assigned to writers.</p>
            </div>
          )}
        </TabsContent>

        {/* Approved Orders Tab */}
        <TabsContent value="approved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Approved Orders</h3>
            <p className="text-sm text-gray-600">
              {approvedOrders.length} orders approved and ready for client delivery
            </p>
          </div>
          
          {filterOrders(approvedOrders).length > 0 ? (
            filterOrders(approvedOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={(action, orderId, additionalData) => {
                  if (action === 'make_available') {
                    handleDirectMakeAvailable(orderId);
                  } else {
                    handleOrderActionLocal(action, orderId, additionalData);
                  }
                }}
                showActions={false}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Approved Orders</h3>
              <p className="text-gray-500">No orders have been approved yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Rejected Orders Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rejected Orders</h3>
            <p className="text-sm text-gray-600">
              {rejectedOrders.length} orders rejected by admin
            </p>
          </div>
          
          {filterOrders(rejectedOrders).length > 0 ? (
            filterOrders(rejectedOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={(action, orderId, additionalData) => {
                  if (action === 'make_available') {
                    handleDirectMakeAvailable(orderId);
                  } else {
                    handleOrderActionLocal(action, orderId, additionalData);
                  }
                }}
                showActions={false}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Rejected Orders</h3>
              <p className="text-gray-500">Great! No orders have been rejected.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completed Orders</h3>
            <p className="text-sm text-gray-600">
              {completedOrders.length} orders successfully completed
            </p>
          </div>
          
          {filterOrders(completedOrders).length > 0 ? (
            filterOrders(completedOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={(action, orderId, additionalData) => {
                  if (action === 'make_available') {
                    handleDirectMakeAvailable(orderId);
                  } else {
                    handleOrderActionLocal(action, orderId, additionalData);
                  }
                }}
                showActions={false}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Completed Orders</h3>
              <p className="text-gray-500">No orders have been completed yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Writer Performance Monitoring */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Writer Performance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {writerStats.map((writer) => (
              <div key={writer.writerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{writer.writerName}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Total: {writer.total}</span>
                    <span className="text-blue-600">Active: {writer.activeOrders}</span>
                    <span>Completed: {writer.completed}</span>
                    <span className="text-red-600">Rejected: {writer.rejected}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="text-green-600">Success Rate: {writer.completionRate}%</span>
                    <span className="text-orange-600">Earnings: KES {writer.earnings.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      KES {writer.earnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {writer.activeOrders} active orders
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          order={selectedOrder}
          userRole={userRole}
          onAction={(action, orderId, additionalData) => {
            if (action === 'make_available') {
              handleDirectMakeAvailable(orderId);
            } else {
              handleOrderActionLocal(action, orderId, additionalData);
            }
          }}
        />
      )}

      {/* Order Assignment Modal */}
      {orderToAssign && (
        <OrderAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setOrderToAssign(null);
          }}
          order={orderToAssign}
          onAssign={handleAssignToWriter}
          onMakeAvailable={handleMakeAvailable}
        />
      )}

      {/* Upload New Order Modal */}
      <UploadNewOrderModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleCreateOrder}
      />

      {/* Order Management Modal */}
      {orderToManage && (
        <OrderManagementModal
          isOpen={showManagementModal}
          onClose={() => {
            setShowManagementModal(false);
            setOrderToManage(null);
          }}
          order={orderToManage}
          onSave={updateOrder}
          onDelete={deleteOrder}
          onAddMessage={addAdminMessage}
          userRole={userRole}
        />
      )}
    </div>
  );
}
