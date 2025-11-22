import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  UserCheck,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
  XCircle
} from 'lucide-react';
import { OrderViewModal } from '../../components/OrderViewModal';
import { OrderAssignmentModal } from '../../components/OrderAssignmentModal';
import { useOrders } from '../../contexts/OrderContext';
import { useUsers } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types/order';

export default function AssignmentCenterPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');

  const { 
    orders, 
    handleOrderAction, 
    getAvailableOrders,
    getWriterActiveOrders,
    refreshOrders
  } = useOrders();
  const { writers } = useUsers();
  const { user } = useAuth();

  // Get orders available for assignment
  const availableOrders = getAvailableOrders();
  const assignedOrders = orders.filter(o => o.status === 'Assigned' && o.assignedBy === 'admin');
  // Recently picked orders by writers (these go directly to 'Assigned' status)
  const recentlyPickedOrders = orders.filter(o => 
    o.pickedBy === 'writer' && 
    o.writerId && 
    ['Assigned', 'In Progress', 'Submitted'].includes(o.status as string)
  ).sort((a, b) => {
    // Sort by assignedAt or updatedAt, most recent first
    const dateA = new Date(a.assignedAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.assignedAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAssignOrder = (order: Order) => {
    setOrderToAssign(order);
    setShowAssignmentModal(true);
  };

  const handleAssignToWriter = (writerId: string, options: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    requireConfirmation?: boolean;
  }) => {
    if (orderToAssign) {
      const writer = writers.find(w => w.id === writerId);
      const writerName = writer?.name || 'Unknown Writer';
      
      handleOrderAction('assign', orderToAssign.id, { 
        writerId, 
        writerName,
        ...options
      });
      
      setShowAssignmentModal(false);
      setOrderToAssign(null);
    }
  };

  const handleMakeAvailable = (notes?: string) => {
    if (orderToAssign) {
      handleOrderAction('make_available', orderToAssign.id, { notes });
      setShowAssignmentModal(false);
      setOrderToAssign(null);
    }
  };

  const handleOrderActionLocal = (action: string, orderId: string, additionalData?: Record<string, unknown>) => {
    handleOrderAction(action, orderId, additionalData);
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Filter available orders
  const filteredAvailableOrders = availableOrders.filter(order => {
    const matchesSearch = 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDiscipline = !disciplineFilter || order.discipline === disciplineFilter;
    
    return matchesSearch && matchesDiscipline;
  });

  // Get writer statistics
  const writerStats = writers.map(writer => {
    const activeOrders = getWriterActiveOrders(writer.id);
    const assignedCount = activeOrders.filter(o => o.status === 'Assigned').length;
    const inProgressCount = activeOrders.filter(o => o.status === 'In Progress').length;
    const submittedCount = activeOrders.filter(o => o.status === 'Submitted').length;
    
    return {
      ...writer,
      activeOrders: activeOrders.length,
      assignedCount,
      inProgressCount,
      submittedCount,
      capacity: Math.max(0, (writer.maxConcurrentOrders || 5) - activeOrders.length),
      isAvailable: activeOrders.length < (writer.maxConcurrentOrders || 5)
    };
  });

  const availableWriters = writerStats.filter(w => w.isAvailable);
  const busyWriters = writerStats.filter(w => !w.isAvailable);

  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();

  const getUrgencyLevel = (order: Order) => {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 12) return 'urgent';
    if (hoursUntilDeadline < 24) return 'high';
    if (hoursUntilDeadline < 48) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">
            Manage order assignments and monitor writer workloads
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={refreshOrders}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Recently Picked Orders Count */}
        {recentlyPickedOrders.length > 0 && (
          <Card className="bg-blue-100 border-blue-400 border-2 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-blue-900">Recently Picked</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{recentlyPickedOrders.length}</div>
              <p className="text-xs font-semibold text-blue-800 mt-1">By Writers</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Available Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{availableOrders.length}</div>
            <p className="text-xs text-blue-600">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Available Writers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{availableWriters.length}</div>
            <p className="text-xs text-green-600">With capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Assigned Orders</CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{assignedOrders.length}</div>
            <p className="text-xs text-yellow-600">Currently assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Urgent Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {availableOrders.filter(o => getUrgencyLevel(o) === 'urgent').length}
            </div>
            <p className="text-xs text-red-600">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Orders ({filteredAvailableOrders.length})
            </CardTitle>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Disciplines</option>
                {disciplines.map(discipline => (
                  <option key={discipline} value={discipline}>{discipline}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAvailableOrders.map((order) => {
                const urgency = getUrgencyLevel(order);
                
                return (
                  <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{order.title}</h4>
                          <Badge className={`${getUrgencyColor(urgency)} border text-xs`}>
                            {urgency}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div><span className="font-medium">Discipline:</span> {order.discipline}</div>
                          <div><span className="font-medium">Pages:</span> {order.pages}</div>
                          <div><span className="font-medium">Deadline:</span> {new Date(order.deadline).toLocaleDateString()}</div>
                          <div><span className="font-medium">Value:</span> KES {(order.pages * 350).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="text-xs px-2 py-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAssignOrder(order)}
                          className="text-xs px-2 py-1"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredAvailableOrders.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No available orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Writer Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Writer Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Available Writers */}
              <div>
                <h4 className="font-medium text-sm text-green-700 mb-2">Available Writers ({availableWriters.length})</h4>
                <div className="space-y-2">
                  {availableWriters.map((writer) => (
                    <div key={writer.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{writer.name}</h5>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Capacity: {writer.capacity} slots</span>
                            <span>Active: {writer.activeOrders}</span>
                            <span>Rating: {writer.rating || 'N/A'}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Busy Writers */}
              {busyWriters.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-red-700 mb-2">Busy Writers ({busyWriters.length})</h4>
                  <div className="space-y-2">
                    {busyWriters.map((writer) => (
                      <div key={writer.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{writer.name}</h5>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>Full Capacity: {writer.activeOrders}/{writer.maxConcurrentOrders || 5}</span>
                              <span>In Progress: {writer.inProgressCount}</span>
                              <span>Submitted: {writer.submittedCount}</span>
                            </div>
                          </div>
                          <Badge variant="destructive">
                            Full
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Recently Assigned Orders (by Admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Assigned Orders ({assignedOrders.filter(o => o.assignedBy === 'admin' || !o.pickedBy).length})
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Orders assigned directly by admin
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedOrders
              .filter(o => o.assignedBy === 'admin' || !o.pickedBy)
              .slice(0, 10)
              .map((order) => (
              <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{order.title}</h4>
                      <Badge variant="secondary">Assigned</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">Writer:</span> {order.assignedWriter || 'Unassigned'}</div>
                      <div><span className="font-medium">Assigned:</span> {new Date(order.assignedAt || order.updatedAt).toLocaleDateString()}</div>
                      <div><span className="font-medium">Deadline:</span> {new Date(order.deadline).toLocaleDateString()}</div>
                      <div><span className="font-medium">Value:</span> KES {(order.pages * 350).toLocaleString()}</div>
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          Assigned by Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            
            {assignedOrders.filter(o => o.assignedBy === 'admin' || !o.pickedBy).length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recently assigned orders</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recently Picked Orders (by Writers) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recently Picked Orders ({recentlyPickedOrders.length})
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Orders picked by writers - these go directly to "Assigned" status and can be approved when work is submitted
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentlyPickedOrders.slice(0, 10).map((order) => {
              const writer = writers.find(w => w.id === order.writerId);
              return (
                <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{order.title}</h4>
                        <Badge variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Writer:</span>{' '}
                          <span className="font-semibold text-blue-700">
                            {order.assignedWriter || writer?.name || 'Unknown'}
                          </span>
                          {writer && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({writer.email})
                            </span>
                          )}
                        </div>
                        <div><span className="font-medium">Picked:</span> {new Date(order.assignedAt || order.updatedAt).toLocaleDateString()}</div>
                        <div><span className="font-medium">Deadline:</span> {new Date(order.deadline).toLocaleDateString()}</div>
                        <div><span className="font-medium">Value:</span> KES {(order.pages * 350).toLocaleString()}</div>
                        <div>
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            Picked by Writer
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recentlyPickedOrders.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recently picked orders</p>
              </div>
            )}
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
          activeOrdersCount={0}
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
          onMakeAvailable={handleMakeAvailable}
        />
      )}
    </div>
  );
}
