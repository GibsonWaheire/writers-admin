import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PODOrderCard } from '../../components/PODOrderCard';
import { PODUploadModal } from '../../components/PODUploadModal';
import { usePOD } from '../../contexts/PODContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  Plus,
  BarChart3,
  Users,
  TrendingUp
} from 'lucide-react';
import type { PODStatus } from '../../types/pod';

export default function AdminPODOrdersPage() {
  const { user } = useAuth();
  const { 
    podOrders, 
    getAvailablePODOrders, 
    getWriterPODOrders,
    addPODOrder,
    updatePODOrderStatus
  } = usePOD();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PODStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isPODUploadOpen, setIsPODUploadOpen] = useState(false);

  // Filter orders for specific tabs
  const filterOrders = (orders: typeof podOrders) => {
    let filtered = orders;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.title.toLowerCase().includes(term) ||
        order.description.toLowerCase().includes(term) ||
        order.subject.toLowerCase().includes(term) ||
        order.discipline.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // Get orders for specific tabs with proper filtering
  const getAvailableOrdersForTab = () => {
    const availableOrders = podOrders.filter(order => order.status === 'Available');
    return filterOrders(availableOrders);
  };

  const getPendingReviewOrdersForTab = () => {
    const pendingOrders = podOrders.filter(order => 
      ['Submitted to Admin', 'Admin Reviewed'].includes(order.status)
    );
    return filterOrders(pendingOrders);
  };

  const getReadyForDeliveryOrdersForTab = () => {
    const readyOrders = podOrders.filter(order => order.status === 'Ready for Delivery');
    return filterOrders(readyOrders);
  };

  const getCompletedOrdersForTab = () => {
    const completedOrders = podOrders.filter(order => order.status === 'Payment Received');
    return filterOrders(completedOrders);
  };

  const getStatusCount = (status: PODStatus) => {
    return podOrders.filter(order => order.status === status).length;
  };

  // Get total POD value using new CPP calculation
  const getTotalPODValue = () => {
    return podOrders.reduce((total, order) => total + (order.pages * 350), 0);
  };

  // Get available POD orders total value
  const getAvailablePODValue = () => {
    return getAvailableOrdersForTab()
      .reduce((total, order) => total + (order.pages * 350), 0);
  };

  const getCompletedPODValue = () => {
    return getCompletedOrdersForTab()
      .reduce((total, order) => total + order.podAmount, 0);
  };

  // Get pending review value
  const getPendingReviewValue = () => {
    return getPendingReviewOrdersForTab()
      .reduce((total, order) => total + (order.pages * 350), 0);
  };

  // Get ready for delivery value
  const getReadyForDeliveryValue = () => {
    return getReadyForDeliveryOrdersForTab()
      .reduce((total, order) => total + (order.pages * 350), 0);
  };

  // Calculate POD analytics
  const getPODAnalytics = () => {
    const totalOrders = podOrders.length;
    const completedOrders = podOrders.filter(order => order.status === 'Payment Received').length;
    const inProgressOrders = podOrders.filter(order => 
      ['Assigned', 'In Progress', 'Submitted to Admin', 'Admin Reviewed'].includes(order.status)
    ).length;
    const availableOrders = getStatusCount('Available');
    
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const avgOrderValue = totalOrders > 0 ? getTotalPODValue() / totalOrders : 0;
    
    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      availableOrders,
      completionRate,
      avgOrderValue
    };
  };

  const analytics = getPODAnalytics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POD Orders Management</h1>
          <p className="text-gray-600 mt-1">
            Admin dashboard for managing Pay on Delivery orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsPODUploadOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create POD Order
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <DollarSign className="w-5 h-5 mr-2" />
            Total POD Value: KES {getTotalPODValue().toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              All POD orders created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.availableOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to be picked by writers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.inProgressOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl ring-1 ring-blue-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BarChart3 className="h-5 w-5" />
            POD Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-blue-100/50">
              <div className="font-bold text-2xl text-blue-600 mb-1">
                {analytics.completionRate.toFixed(1)}%
              </div>
              <div className="text-gray-600 font-medium">Completion Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {analytics.completedOrders} of {analytics.totalOrders} orders
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-green-100/50">
              <div className="font-bold text-2xl text-green-600 mb-1">
                KES {analytics.avgOrderValue.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Average Order Value</div>
              <div className="text-xs text-gray-500 mt-1">
                Per POD order
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-purple-100/50">
              <div className="font-bold text-2xl text-purple-600 mb-1">
                KES {getCompletedPODValue().toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Total Revenue</div>
              <div className="text-xs text-gray-500 mt-1">
                From completed orders
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search POD orders by title, description, subject, or discipline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PODStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Submitted to Admin">Submitted to Admin</SelectItem>
              <SelectItem value="Admin Reviewed">Admin Reviewed</SelectItem>
              <SelectItem value="Ready for Delivery">Ready for Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Payment Received">Payment Received</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="ready">Ready for Delivery</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* All POD Orders Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All POD Orders</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Orders: {podOrders.length}</p>
              <p className="text-sm text-gray-500">Total Value: KES {getTotalPODValue().toLocaleString()}</p>
            </div>
          </div>
          
          {filterOrders(podOrders).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterOrders(podOrders).map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No POD Orders Found</h3>
              <p className="text-gray-500">No POD orders match your current search criteria.</p>
            </div>
          )}
        </TabsContent>

        {/* Available POD Orders Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Available POD Orders</h3>
            <p className="text-sm text-gray-500">
              Total Value: KES {getAvailablePODValue().toLocaleString()}
            </p>
          </div>
          
          {getAvailableOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getAvailableOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available POD Orders</h3>
              <p className="text-gray-500">There are currently no Pay on Delivery orders available for pickup.</p>
            </div>
          )}
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pending Review</h3>
            <p className="text-sm text-gray-500">
              Total Value: KES {getPendingReviewValue().toLocaleString()}
            </p>
          </div>
          
          {getPendingReviewOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getPendingReviewOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Pending Review</h3>
              <p className="text-gray-500">All POD orders have been reviewed or are not yet submitted.</p>
            </div>
          )}
        </TabsContent>

        {/* Ready for Delivery Tab */}
        <TabsContent value="ready" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Ready for Delivery</h3>
            <p className="text-sm text-gray-500">
              Total Value: KES {getReadyForDeliveryValue().toLocaleString()}
            </p>
          </div>
          
          {getReadyForDeliveryOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getReadyForDeliveryOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Ready for Delivery</h3>
              <p className="text-gray-500">No POD orders are currently ready for delivery to clients.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed POD Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Completed POD Orders</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Completed: {getCompletedOrdersForTab().length}</p>
              <p className="text-sm text-gray-500">Total Revenue: KES {getCompletedPODValue().toLocaleString()}</p>
            </div>
          </div>
          
          {getCompletedOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getCompletedOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed POD Orders</h3>
              <p className="text-gray-500">No POD orders have been completed yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* POD Upload Modal */}
      <PODUploadModal
        isOpen={isPODUploadOpen}
        onClose={() => setIsPODUploadOpen(false)}
        onSubmit={addPODOrder}
      />
    </div>
  );
}
