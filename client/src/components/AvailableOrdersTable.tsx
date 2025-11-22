import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  BookOpen
} from "lucide-react";
import { OrderConfirmationModal } from './OrderConfirmationModal';
import type { Order, WriterConfirmation, WriterQuestion } from '../types/order';

interface AvailableOrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onConfirm: (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => void;
  userRole: 'writer' | 'admin';
}

export function AvailableOrdersTable({ 
  orders, 
  onView, 
  onConfirm, 
  userRole 
}: AvailableOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");
  const [filterPaperType, setFilterPaperType] = useState<string>("");
  const [filterPriceRange, setFilterPriceRange] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
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

  // Get unique disciplines and paper types for filters
  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();
  const paperTypes = Array.from(new Set(orders.map(order => order.paperType))).sort();

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const handlePickOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = (confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    if (selectedOrder) {
      onConfirm(selectedOrder.id, confirmation, questions);
      setShowConfirmationModal(false);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by title, description, discipline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterDiscipline}
          onChange={(e) => setFilterDiscipline(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px]"
        >
          <option value="">All Disciplines</option>
          {disciplines.map(discipline => (
            <option key={discipline} value={discipline}>{discipline}</option>
          ))}
        </select>
        
        <select
          value={filterPaperType}
          onChange={(e) => setFilterPaperType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px]"
        >
          <option value="">All Paper Types</option>
          {paperTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={filterPriceRange}
          onChange={(e) => setFilterPriceRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px]"
        >
          <option value="">All Prices</option>
          <option value="0-20000">KES 0 - 20,000</option>
          <option value="20000-50000">KES 20,000 - 50,000</option>
          <option value="50000-100000">KES 50,000 - 100,000</option>
          <option value="100000-">KES 100,000+</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Order Details</TableHead>
              <TableHead className="font-semibold">Requirements</TableHead>
              <TableHead className="font-semibold">Pricing</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Deadline</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const deadlineStatus = getDeadlineStatus(order.deadline);
                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900 line-clamp-2">
                          {order.title}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {order.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono">{order.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {order.discipline}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{order.paperType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">{order.format}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Pages:</span>
                          <span className="font-medium">{order.pages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <span className="text-gray-600">Words:</span>
                          <span className="font-medium">{order.words.toLocaleString()}</span>
                        </div>
                        {order.urgencyLevel && order.urgencyLevel !== 'normal' && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-600" />
                            <span className="text-gray-600">Priority:</span>
                            <Badge 
                              variant="outline" 
                              className={
                                order.urgencyLevel === 'urgent' 
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {order.urgencyLevel === 'urgent' ? 'Urgent' : 'Very Urgent'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-green-600">
                          KES {order.totalPriceKES ? order.totalPriceKES.toLocaleString() : (order.pages * 350).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.pages} pages × KES {order.cpp || 350}
                          {order.urgencyLevel && order.urgencyLevel !== 'normal' && (
                            <span className="ml-1 text-orange-600">
                              ({order.urgencyLevel === 'urgent' ? '+20%' : '+50%'})
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        {(order.status === 'Available' || order.status === 'Auto-Reassigned') && !order.writerId ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {order.status === 'Auto-Reassigned' ? 'Reassigned' : 'Available'}
                            </Badge>
                            {order.status === 'Auto-Reassigned' && (
                              <div className="text-xs text-orange-600">
                                Previously assigned to another writer
                              </div>
                            )}
                          </div>
                        ) : order.writerId ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Assigned to You
                            </Badge>
                            <div className="text-xs text-gray-500">
                              Status: {order.status}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {order.status}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {new Date(order.deadline).toLocaleDateString()}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${deadlineStatus.bg} ${deadlineStatus.color} border-0`}
                        >
                          {deadlineStatus.text}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {userRole === 'writer' && order.status === 'Available' && !order.writerId && (
                          <Button 
                            onClick={() => handlePickOrder(order)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Pick Order
                          </Button>
                        )}
                        
                        {userRole === 'writer' && order.writerId && order.status !== 'Available' && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 border-blue-200 text-blue-700"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            My Order
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onView(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                    <p className="text-gray-500">There are currently no orders matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmationModal && selectedOrder && (
        <OrderConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  );
}
