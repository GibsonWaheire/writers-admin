import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PODOrderCard } from '../components/PODOrderCard';
import { PODUploadModal } from '../components/PODUploadModal';
import { usePOD } from '../contexts/PODContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  Plus
} from 'lucide-react';
import type { PODStatus } from '../types/pod';

export default function PODOrdersPage() {
  const { user } = useAuth();
  const { 
    podOrders, 
    getAvailablePODOrders, 
    getWriterPODOrders,
    addPODOrder
  } = usePOD();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PODStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('available');
  const [isPODUploadOpen, setIsPODUploadOpen] = useState(false);

  // Get writer-specific data
  const writerId = user?.id || 'writer-1';
  const writerPODOrders = getWriterPODOrders(writerId);
  const availablePODOrders = getAvailablePODOrders();

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
    return filterOrders(availablePODOrders);
  };

  const getMyPODOrdersForTab = () => {
    return filterOrders(writerPODOrders);
  };

  const getAllPODOrdersForTab = () => {
    return filterOrders(podOrders);
  };

  const getCompletedPODOrdersForTab = () => {
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
    return availablePODOrders
      .reduce((total, order) => total + (order.pages * 350), 0);
  };

  const getCompletedPODValue = () => {
    return podOrders
      .filter(order => order.status === 'Payment Received')
      .reduce((total, order) => total + order.podAmount, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POD Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage Pay on Delivery orders and track payments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsPODUploadOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload POD Order
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
            <CardTitle className="text-sm font-medium">Available Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getStatusCount('Available')}
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
            <div className="text-2xl font-bold text-blue-600">
              {getStatusCount('In Progress')}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getStatusCount('Ready for Delivery')}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery to clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Received</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getStatusCount('Payment Received')}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed and paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search POD orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: PODStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Ready for Delivery">Ready for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Payment Received">Payment Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Disputed">Disputed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Available ({getAvailableOrdersForTab().length})
          </TabsTrigger>
          <TabsTrigger value="my-pod" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            My POD Orders ({getMyPODOrdersForTab().length})
          </TabsTrigger>
          <TabsTrigger value="all-pod" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            All POD Orders ({getAllPODOrdersForTab().length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Completed ({getCompletedPODOrdersForTab().length})
          </TabsTrigger>
        </TabsList>

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

        {/* My POD Orders Tab */}
        <TabsContent value="my-pod" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">My POD Orders</h3>
            <p className="text-sm text-gray-500">
              Total Value: KES {writerPODOrders.reduce((sum, order) => sum + (order.pages * 350), 0).toLocaleString()}
            </p>
          </div>
          
          {getMyPODOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getMyPODOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No POD Orders Assigned</h3>
              <p className="text-gray-500">You haven't been assigned any POD orders yet.</p>
            </div>
          )}
        </TabsContent>

        {/* All POD Orders Tab */}
        <TabsContent value="all-pod" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All POD Orders</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Orders: {podOrders.length}</p>
              <p className="text-sm text-gray-500">Total Value: KES {getTotalPODValue().toLocaleString()}</p>
            </div>
          </div>
          
          {getAllPODOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getAllPODOrdersForTab().map((order) => (
                <PODOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No POD Orders Found</h3>
              <p className="text-gray-500">No POD orders match your current search criteria.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed POD Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Completed POD Orders</h3>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Completed: {getCompletedPODOrdersForTab().length}</p>
              <p className="text-sm text-gray-500">Total Revenue: KES {getCompletedPODValue().toLocaleString()}</p>
            </div>
          </div>
          
          {getCompletedPODOrdersForTab().length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getCompletedPODOrdersForTab().map((order) => (
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
