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
  AlertTriangle
} from "lucide-react";
import { OrderCard } from "../components/OrderCard";
import { OrderViewModal } from "../components/OrderViewModal";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import type { Order } from "../types/order";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");
  const [filterPaperType, setFilterPaperType] = useState<string>("");
  const [filterPriceRange, setFilterPriceRange] = useState<string>("");

  const { orders, handleOrderAction, getOrdersByStatus, getWriterActiveOrders } = useOrders();
  const { user } = useAuth();
  
  const userRole = user?.role || 'writer';
  const isAdmin = userRole === 'admin';
  const writerId = user?.id || '';

  // Get orders by status
  const availableOrders = getOrdersByStatus('Available');
  const pendingApprovalOrders = getOrdersByStatus('Pending Approval');
  const inProgressOrders = getOrdersByStatus('In Progress');
  const completedOrders = getOrdersByStatus('Completed');
  const rejectedOrders = getOrdersByStatus('Rejected');

  // Get writer-specific orders
  const myOrders = getWriterActiveOrders(writerId);

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
          matchesPrice = order.price >= min && order.price <= max;
        } else {
          matchesPrice = order.price >= min;
        }
      }
      
      return matchesSearch && matchesDiscipline && matchesPaperType && matchesPrice;
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = (action: string, orderId: string, notes?: string) => {
    handleOrderAction(action, orderId, notes);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get unique disciplines and paper types for filters
  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();
  const paperTypes = Array.from(new Set(orders.map(order => order.paperType))).sort();

  // Calculate statistics
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.price, 0);
  const overdueOrders = orders.filter(order => new Date(order.deadline) < new Date()).length;

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueOrders}</div>
            <p className="text-xs text-muted-foreground">
              Past deadline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId))).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Available ({filterOrders(availableOrders).length})
          </TabsTrigger>
          
          {!isAdmin && (
            <TabsTrigger value="my-orders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Orders ({filterOrders(myOrders).length})
            </TabsTrigger>
          )}
          
          {isAdmin && (
            <TabsTrigger value="pending-approval" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending Approval ({filterOrders(pendingApprovalOrders).length})
            </TabsTrigger>
          )}
          
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned ({filterOrders(inProgressOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({filterOrders(completedOrders).length})
          </TabsTrigger>
          
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({filterOrders(rejectedOrders).length})
          </TabsTrigger>
        </TabsList>

        {/* Available Orders Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4">
            {filterOrders(availableOrders).length > 0 ? (
              filterOrders(availableOrders).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onView={handleViewOrder}
                  onAction={handleOrderAction}
                  showActions={true}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Orders</h3>
                <p className="text-gray-500">There are currently no orders available for pickup.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* My Orders Tab (Writers Only) */}
        {!isAdmin && (
          <TabsContent value="my-orders" className="space-y-4">
            <div className="grid gap-4">
              {filterOrders(myOrders).length > 0 ? (
                filterOrders(myOrders).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userRole={userRole}
                    onView={handleViewOrder}
                    onAction={handleOrderActionLocal}
                    showActions={true}
                  />
                ))
              ) : (
                <Card className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
                  <p className="text-gray-500">You don't have any active orders at the moment.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        {/* Pending Approval Tab (Admins Only) */}
        {isAdmin && (
          <TabsContent value="pending-approval" className="space-y-4">
            <div className="grid gap-4">
              {filterOrders(pendingApprovalOrders).length > 0 ? (
                filterOrders(pendingApprovalOrders).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userRole={userRole}
                    onView={handleViewOrder}
                    onAction={handleOrderActionLocal}
                    showActions={true}
                  />
                ))
              ) : (
                <Card className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                  <p className="text-gray-500">All orders have been reviewed and processed.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        {/* Assigned Orders Tab */}
        <TabsContent value="assigned" className="space-y-4">
          <div className="grid gap-4">
            {filterOrders(inProgressOrders).length > 0 ? (
              filterOrders(inProgressOrders).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onView={handleViewOrder}
                  onAction={handleOrderActionLocal}
                  showActions={true}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Orders</h3>
                <p className="text-gray-500">No orders are currently in progress.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Completed Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {filterOrders(completedOrders).length > 0 ? (
              filterOrders(completedOrders).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onView={handleViewOrder}
                  onAction={handleOrderActionLocal}
                  showActions={false}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Orders</h3>
                <p className="text-gray-500">No orders have been completed yet.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Rejected Orders Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-4">
            {filterOrders(rejectedOrders).length > 0 ? (
              filterOrders(rejectedOrders).map((order) => (
                                  <OrderCard
                    key={order.id}
                    order={order}
                    userRole={userRole}
                    onView={handleViewOrder}
                    onAction={handleOrderActionLocal}
                    showActions={false}
                  />
              ))
            ) : (
              <Card className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Orders</h3>
                <p className="text-gray-500">No orders have been rejected.</p>
              </Card>
            )}
          </div>
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
