import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  onCreateInvoice: (order: any, orderType: 'regular' | 'pod') => void;
}

export function CreateInvoiceModal({ 
  isOpen, 
  onClose, 
  orders,
  onCreateInvoice 
}: CreateInvoiceModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleCreate = () => {
    if (!selectedOrder) return;
    
    // Determine order type
    const orderType = selectedOrder.podAmount ? 'pod' : 'regular';
    onCreateInvoice(selectedOrder, orderType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-full">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            Create Invoice from Order
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Select a completed order to create an invoice for payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">All Orders Have Invoices</h3>
              <p className="text-gray-500">All your completed orders already have invoices.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Select an order to create an invoice</li>
                      <li>Invoice will be created as "Draft" status</li>
                      <li>You can submit it for admin review after creation</li>
                      <li>Payment will be processed after admin approval</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.map((order) => {
                  const isPOD = order.podAmount !== undefined;
                  const totalAmount = isPOD ? (order.podAmount || order.pages * 350) : (order.totalPriceKES || order.pages * 350);
                  const writerEarnings = isPOD ? totalAmount * 0.8 : order.pages * 350;
                  
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{order.title}</h4>
                            {isPOD ? (
                              <Badge className="bg-purple-100 text-purple-800">POD</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">Regular</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                            <div>
                              <span className="font-medium">Pages:</span> {order.pages}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {order.status}
                            </div>
                            <div>
                              <span className="font-medium">Completed:</span> {formatDate(order.updatedAt || order.completedAt || order.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium">Value:</span> KES {totalAmount.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Writer Earnings:</span>
                              <span className="font-bold text-green-600">KES {writerEarnings.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedOrder?.id === order.id && (
                          <CheckCircle className="h-6 w-6 text-blue-600 ml-4 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!selectedOrder || orders.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

