import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus,
  Eye,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { OrderAssignmentModal } from '../../components/OrderAssignmentModal';
import { UploadNewOrderModal } from '../../components/UploadNewOrderModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../contexts/UsersContext';
import type { Order } from '../../types/order';

export default function AllOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'deadline'>('newest');

  const { 
    orders, 
    handleOrderAction, 
    createOrder,
    refreshOrders
  } = useOrders();
  const { user } = useAuth();
  const { writers } = useUsers();

  // Auto-expand Order Management menu on load
  useEffect(() => {
    // This will be handled by the sidebar component
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    console.log('🎯 AllOrdersPage: Performing order action:', { action, orderId, additionalData });
    
    if (action === 'assign') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setOrderToAssign(order);
        setShowAssignmentModal(true);
      }
      return;
    }
    
    try {
      await handleOrderAction(action, orderId, additionalData);
      console.log('✅ AllOrdersPage: Order action completed:', action);
      
      // Force refresh for certain critical actions
      if (['make_available', 'approve', 'reject'].includes(action)) {
        setTimeout(() => {
          console.log('🔄 AllOrdersPage: Forcing refresh after critical action:', action);
          refreshOrders();
        }, 100);
      }
    } catch (error) {
      console.error('❌ AllOrdersPage: Error performing action:', error);
    }
    
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleAssignToWriter = async (writerId: string, options: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    requireConfirmation?: boolean;
  }) => {
    if (orderToAssign) {
      const writer = writers.find(w => w.id === writerId);
      const writerName = writer?.name || 'Unknown Writer';
      
      console.log('🔄 AllOrdersPage: Assigning order to writer:', {
        orderId: orderToAssign.id,
        writerId,
        writerName,
        currentStatus: orderToAssign.status
      });
      
      try {
        await handleOrderAction('assign', orderToAssign.id, { 
          writerId, 
          writerName,
          ...options
        });
        
        console.log('✅ AllOrdersPage: Order assignment completed');
        
        // Force a refresh to ensure UI updates
        setTimeout(() => {
          refreshOrders();
        }, 100);
        
      } catch (error) {
        console.error('❌ AllOrdersPage: Error assigning order:', error);
      }
      
      setShowAssignmentModal(false);
      setOrderToAssign(null);
    }
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    try {
      await createOrder(orderData);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority':
          const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return (priorityOrder[a.urgencyLevel as keyof typeof priorityOrder] || 2) - 
                 (priorityOrder[b.urgencyLevel as keyof typeof priorityOrder] || 2);
        default:
          return 0;
      }
    });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Revision': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <FileText className="h-4 w-4" />;
      case 'Assigned': return <UserCheck className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Submitted': return <CheckCircle className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      case 'Revision': return <RefreshCw className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    total: orders.length,
    available: orders.filter(o => o.status === 'Available').length,
    assigned: orders.filter(o => o.status === 'Assigned').length,
    inProgress: orders.filter(o => o.status === 'In Progress').length,
    submitted: orders.filter(o => o.status === 'Submitted').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    rejected: orders.filter(o => o.status === 'Rejected').length,
    revision: orders.filter(o => o.status === 'Revision').length
  };

  // Debug logging for status counts
  useEffect(() => {
    console.log('📊 AllOrdersPage: Status counts updated:', statusCounts);
  }, [statusCounts.available, statusCounts.assigned, statusCounts.total]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Orders</h1>
          <p className="text-muted-foreground">
            Complete overview of all orders in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshOrders}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-gray-700">{statusCounts.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-700">{statusCounts.available}</div>
            <div className="text-xs text-green-600">Available</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-700">{statusCounts.assigned}</div>
            <div className="text-xs text-blue-600">Assigned</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-yellow-700">{statusCounts.inProgress}</div>
            <div className="text-xs text-yellow-600">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-purple-700">{statusCounts.submitted}</div>
            <div className="text-xs text-purple-600">Submitted</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-emerald-700">{statusCounts.completed}</div>
            <div className="text-xs text-emerald-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-red-700">{statusCounts.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-700">{statusCounts.revision}</div>
            <div className="text-xs text-orange-600">Revision</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Revision">Revision</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline">By Deadline</option>
              <option value="priority">By Priority</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.title}</h3>
                      <Badge className={`${getStatusBadgeColor(order.status)} border`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                      {order.urgencyLevel === 'urgent' && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Discipline:</span> {order.discipline}
                      </div>
                      <div>
                        <span className="font-medium">Pages:</span> {order.pages}
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span> {new Date(order.deadline).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> KES {(order.pages * 350).toLocaleString()}
                      </div>
                    </div>
                    
                    {order.assignedWriter && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-blue-600">Assigned to:</span> {order.assignedWriter}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {order.status === 'Available' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setOrderToAssign(order);
                          setShowAssignmentModal(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userRole="admin"
          onAction={handleOrderActionLocal}
        />
      )}

      {orderToAssign && (
        <OrderAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setOrderToAssign(null);
          }}
          order={orderToAssign}
          onAssign={handleAssignToWriter}
          onMakeAvailable={(notes) => {
            if (orderToAssign) {
              handleOrderAction('make_available', orderToAssign.id, { 
                notes,
                source: 'admin'
              });
              setShowAssignmentModal(false);
              setOrderToAssign(null);
            }
          }}
        />
      )}

      <UploadNewOrderModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}
