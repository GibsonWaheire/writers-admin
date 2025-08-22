import { useState } from "react";
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
  BarChart3
} from "lucide-react";
import { OrderCard } from "../components/OrderCard";
import { OrderViewModal } from "../components/OrderViewModal";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import type { Order, WriterConfirmation, WriterQuestion } from "../types/order";
import { AvailableOrdersTable } from "../components/AvailableOrdersTable";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
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
    confirmOrder,
    getWriterTotalEarnings,
    pickOrder
  } = useOrders();
  const { user } = useAuth();
  
  const userRole = user?.role || 'writer';
  const isAdmin = userRole === 'admin';
  const writerId = user?.id || 'writer-1'; // Default for demo

  // Get orders by status - properly categorized
  const availableOrders = getAvailableOrders(); // Only truly available orders (status: 'Available', no writerId)
  const assignedOrders = getOrdersByStatus('Assigned'); // Orders picked but not yet started
  const inProgressOrders = getOrdersByStatus('In Progress'); // Orders actively being worked on
  const submittedOrders = getOrdersByStatus('Submitted'); // Orders submitted for review
  const approvedOrders = getOrdersByStatus('Approved'); // Orders approved by admin
  const completedOrders = getOrdersByStatus('Completed'); // Orders marked as complete
  const rejectedOrders = getOrdersByStatus('Rejected'); // Orders rejected by admin
  const revisionOrders = getOrdersByStatus('Revision'); // Orders requiring revision
  const resubmittedOrders = getOrdersByStatus('Resubmitted'); // Orders resubmitted after revision

  // Get writer-specific orders and stats (excluding POD orders)
  const myOrders = getWriterActiveOrders(writerId);
  const writerStats = getWriterOrderStats(writerId);
  const writerTotalEarnings = getWriterTotalEarnings(writerId);

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
    if (action === 'confirm_order' && additionalData?.confirmation && additionalData?.questions) {
      // Handle order confirmation the same way as the main Pick Order button
      confirmOrder(orderId, additionalData.confirmation as WriterConfirmation, additionalData.questions as WriterQuestion[]);
    } else {
      // Handle other actions normally
      handleOrderAction(action, orderId, additionalData);
    }
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderConfirm = (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    // First, pick the order to assign it to the current writer
    pickOrder(orderId, writerId, user?.name || 'Unknown Writer');
    
    // Then confirm the order with the confirmation data
    confirmOrder(orderId, confirmation, questions);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get unique disciplines and paper types for filters
  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();
  const paperTypes = Array.from(new Set(orders.map(order => order.paperType))).sort();

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    const myCompletedOrders = myOrders.filter(order => 
      ['Completed', 'Approved'].includes(order.status)
    );
    const myRevisionOrders = myOrders.filter(order => order.status === 'Revision');
    
    const totalPages = myCompletedOrders.reduce((sum, order) => sum + order.pages, 0);
    const avgCompletionTime = myCompletedOrders.length > 0 ? 
      myCompletedOrders.reduce((sum, order) => {
        const start = new Date(order.createdAt);
        const end = new Date(order.updatedAt);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
      }, 0) / myCompletedOrders.length : 0;
    
    const revisionRate = myCompletedOrders.length > 0 ? 
      (myRevisionOrders.length / (myCompletedOrders.length + myRevisionOrders.length)) * 100 : 0;
    
    return {
      totalPages,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      revisionRate: Math.round(revisionRate * 10) / 10,
      qualityScore: Math.max(0, 100 - revisionRate * 10) // Higher score for fewer revisions
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all orders and assignments' : 'Browse and manage your writing assignments'}
          </p>
        </div>
        {isAdmin && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Upload New Order
          </Button>
        )}
      </div>

      {/* Writer Performance & Revision Cards */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revision Required Card */}
          <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Revisions Required</CardTitle>
              <RefreshCw className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{writerStats.revision}</div>
              <p className="text-xs text-red-600">
                {writerStats.revision > 0 ? 'Needs attention' : 'All good'}
              </p>
            </CardContent>
          </Card>

          {/* Quality Score Card */}
          <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Quality Score</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{performanceMetrics.qualityScore}%</div>
              <p className="text-xs text-green-600">
                {performanceMetrics.qualityScore >= 90 ? 'Excellent' : 
                 performanceMetrics.qualityScore >= 80 ? 'Good' : 
                 performanceMetrics.qualityScore >= 70 ? 'Fair' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          {/* Average Completion Time */}
          <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Avg. Completion</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{performanceMetrics.avgCompletionTime}d</div>
              <p className="text-xs text-blue-600">Days per order</p>
            </CardContent>
          </Card>

          {/* Total Pages Completed */}
          <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Pages Completed</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{performanceMetrics.totalPages}</div>
              <p className="text-xs text-purple-700">Total pages written</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Overview Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Orders Under Review */}
          <Card className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Under Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {submittedOrders.length + resubmittedOrders.length}
              </div>
              <p className="text-xs text-yellow-600">Awaiting admin action</p>
            </CardContent>
          </Card>

          {/* Revision Requests */}
          <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Revision Requests</CardTitle>
              <RefreshCw className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{revisionOrders.length}</div>
              <p className="text-xs text-red-600">Need writer attention</p>
            </CardContent>
          </Card>

          {/* Approved Orders */}
          <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{approvedOrders.length}</div>
              <p className="text-xs text-green-600">Ready for client</p>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">System Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {Math.round((completedOrders.length / Math.max(orders.length, 1)) * 100)}%
              </div>
              <p className="text-xs text-blue-600">Completion rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Writer-specific Statistics (for writers) */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">My Orders</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{writerStats.total}</div>
              <p className="text-xs text-blue-600">Total assigned</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{writerStats.pending}</div>
              <p className="text-xs text-yellow-600">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">In Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{writerStats.inProgress}</div>
              <p className="text-xs text-green-600">Currently working</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{writerStats.completed}</div>
              <p className="text-xs text-purple-600">Successfully done</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                KES {writerTotalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-orange-600">From completed orders</p>
            </CardContent>
          </Card>
        </div>
      )}

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
              <option value="0-200">$0 - $200</option>
              <option value="200-400">$200 - $400</option>
              <option value="400-600">$400 - $600</option>
              <option value="600-">$600+</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Available ({filterOrders(availableOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned ({filterOrders([...assignedOrders, ...inProgressOrders]).length})
          </TabsTrigger>

          {isAdmin && (
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Submitted ({filterOrders([...submittedOrders, ...resubmittedOrders]).length})
            </TabsTrigger>
          )}

          <TabsTrigger value="revisions" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Revisions ({filterOrders(revisionOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({filterOrders([...approvedOrders, ...completedOrders]).length})
          </TabsTrigger>
          
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({filterOrders(rejectedOrders).length})
          </TabsTrigger>
        </TabsList>

        {/* Available Orders Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Orders</h3>
            <div className="text-sm text-gray-600">
              <span>{availableOrders.length} orders available for pickup</span>
              {availableOrders.some(order => order.status === 'Auto-Reassigned') && (
                <span className="ml-2 text-orange-600">
                  ({availableOrders.filter(order => order.status === 'Auto-Reassigned').length} reassigned)
                </span>
              )}
            </div>
          </div>
          
          {filterOrders(availableOrders).length > 0 ? (
            <AvailableOrdersTable
              orders={filterOrders(availableOrders)}
              onView={handleViewOrder}
              onConfirm={handleOrderConfirm}
              userRole={userRole}
            />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Available Orders</h3>
              <p className="text-gray-500">All orders have been picked by writers.</p>
            </div>
          )}
        </TabsContent>

        {/* Assigned Orders Tab */}
        <TabsContent value="assigned" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assigned Orders</h3>
            <p className="text-sm text-gray-600">
              {assignedOrders.length + inProgressOrders.length} orders assigned to writers
            </p>
          </div>
          
          {filterOrders([...assignedOrders, ...inProgressOrders]).length > 0 ? (
            filterOrders([...assignedOrders, ...inProgressOrders]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={handleOrderActionLocal}
                onConfirm={handleOrderConfirm}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Assigned Orders</h3>
              <p className="text-gray-500">No orders have been assigned to writers yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Submitted Orders Tab (Admins Only) */}
        {isAdmin && (
          <TabsContent value="submitted" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Submitted Orders</h3>
              <p className="text-sm text-gray-600">
                {submittedOrders.length + resubmittedOrders.length} orders awaiting review
              </p>
            </div>
            
            {filterOrders([...submittedOrders, ...resubmittedOrders]).length > 0 ? (
              filterOrders([...submittedOrders, ...resubmittedOrders]).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onView={handleViewOrder}
                  onAction={handleOrderActionLocal}
                  onConfirm={handleOrderConfirm}
                  showActions={true}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Submitted Orders</h3>
                <p className="text-gray-500">All orders have been reviewed and processed.</p>
              </div>
            )}
          </TabsContent>
        )}

        {/* Revisions Tab */}
        <TabsContent value="revisions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Orders Requiring Revision</h3>
            <p className="text-sm text-gray-600">
              {revisionOrders.length} orders need revision
            </p>
          </div>
          
          {filterOrders(revisionOrders).length > 0 ? (
            filterOrders(revisionOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={handleOrderActionLocal}
                onConfirm={handleOrderConfirm}
                showActions={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Revisions Required</h3>
              <p className="text-gray-500">All orders are up to standard.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completed Orders</h3>
            <p className="text-sm text-gray-600">
              {approvedOrders.length + completedOrders.length} orders completed
            </p>
          </div>
          
          {filterOrders([...approvedOrders, ...completedOrders]).length > 0 ? (
            filterOrders([...approvedOrders, ...completedOrders]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={handleOrderActionLocal}
                onConfirm={handleOrderConfirm}
                showActions={false}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Completed Orders</h3>
              <p className="text-gray-500">No orders have been completed yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Rejected Orders Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rejected Orders</h3>
            <p className="text-sm text-gray-600">
              {rejectedOrders.length} orders rejected
            </p>
          </div>
          
          {filterOrders(rejectedOrders).length > 0 ? (
            filterOrders(rejectedOrders).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onView={handleViewOrder}
                onAction={handleOrderActionLocal}
                onConfirm={handleOrderConfirm}
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
      </Tabs>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          order={selectedOrder}
          userRole={userRole}
          onAction={handleOrderActionLocal}
          activeOrdersCount={myOrders.length}
        />
      )}
    </div>
  );
}
