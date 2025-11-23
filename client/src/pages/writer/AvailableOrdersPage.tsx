import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Filter, 
  Clock,
  DollarSign,
  FileText,
  BookOpen,

} from 'lucide-react';
import { AvailableOrdersTable } from '../../components/AvailableOrdersTable';
import { OrderViewModal } from '../../components/OrderViewModal';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Order, WriterConfirmation, WriterQuestion } from '../../types/order';
import { getWriterIdForUser } from '../../utils/writer';

export default function AvailableOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");
  const [filterPaperType, setFilterPaperType] = useState<string>("");
  const [filterPriceRange, setFilterPriceRange] = useState<string>("");

  const { 
    getAvailableOrders,
    handleOrderAction,
    orders
  } = useOrders();
  
  const { user } = useAuth();
  const availableOrders = getAvailableOrders();
  const currentWriterId = getWriterIdForUser(user?.id);


  // Filter orders based on search and filters
  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.discipline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDiscipline = !filterDiscipline || order.discipline === filterDiscipline;
      const matchesPaperType = !filterPaperType || order.paperType === filterPaperType;
      
      let matchesPriceRange = true;
      if (filterPriceRange) {
        const price = order.totalPriceKES || (order.pages * 350);
        switch (filterPriceRange) {
          case 'low':
            matchesPriceRange = price < 5000;
            break;
          case 'medium':
            matchesPriceRange = price >= 5000 && price < 15000;
            break;
          case 'high':
            matchesPriceRange = price >= 15000;
            break;
        }
      }
      
      return matchesSearch && matchesDiscipline && matchesPaperType && matchesPriceRange;
    });
  };

  const filteredOrders = filterOrders(availableOrders);

  const handleConfirmOrder = async (orderId: string, confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    try {
      await handleOrderAction('bid', orderId, { 
        confirmation, 
        questions,
        writerId: currentWriterId,
        writerName: user?.name || 'Writer'
      });
    } catch (error) {
      console.error('Failed to confirm order:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderActionLocal = async (action: string, orderId: string, data?: Record<string, unknown>) => {
    try {
      await handleOrderAction(action, orderId, data);
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to perform order action:', error);
    }
  };

  // Get unique values for filters
  const disciplines = [...new Set(availableOrders.map(order => order.discipline))];
  const paperTypes = [...new Set(availableOrders.map(order => order.paperType))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>
          <p className="text-gray-600 mt-1">Browse and bid on orders that match your expertise</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredOrders.length} Orders Available
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {(() => {
                    const writerId = getWriterIdForUser(user?.id);
                    const completedOrders = orders.filter(order => 
                      order.writerId === writerId && 
                      ['Completed', 'Approved'].includes(order.status)
                    );
                    return completedOrders.length > 0 
                      ? Math.round(completedOrders.reduce((sum, order) => 
                          sum + (order.totalPriceKES || order.pages * 350), 0) / completedOrders.length
                        ).toLocaleString()
                      : '0';
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableOrders.filter(order => {
                    const deadline = new Date(order.deadline);
                    const now = new Date();
                    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                    return hoursLeft <= 24;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">High Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableOrders.filter(order => 
                    (order.totalPriceKES || order.pages * 350) >= 15000
                  ).length}
                </p>
              </div>
            </div>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Disciplines</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>

            <select
              value={filterPaperType}
              onChange={(e) => setFilterPaperType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Paper Types</option>
              {paperTypes.map(paperType => (
                <option key={paperType} value={paperType}>{paperType}</option>
              ))}
            </select>

            <select
              value={filterPriceRange}
              onChange={(e) => setFilterPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Price Ranges</option>
              <option value="low">Low (&lt; KES 5,000)</option>
              <option value="medium">Medium (KES 5,000 - 15,000)</option>
              <option value="high">High (&gt; KES 15,000)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Orders ({filteredOrders.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <AvailableOrdersTable
              orders={filteredOrders}
              onView={handleViewOrder}
              onConfirm={handleConfirmOrder}
              userRole={user?.role || 'writer'}
            />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Available Orders</h3>
              <p className="text-gray-500">
                {searchTerm || filterDiscipline || filterPaperType || filterPriceRange
                  ? "No orders match your current filters. Try adjusting your search criteria."
                  : "There are currently no available orders. Check back later for new opportunities."
                }
              </p>
              {(searchTerm || filterDiscipline || filterPaperType || filterPriceRange) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDiscipline("");
                    setFilterPaperType("");
                    setFilterPriceRange("");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onAction={handleOrderActionLocal}
          userRole={user?.role || 'writer'}
        />
      )}
    </div>
  );
}
