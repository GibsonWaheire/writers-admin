import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { usePOD } from '../contexts/PODContext';
import { PODConfirmationModal } from './PODConfirmationModal';
import type { PODOrder, PODStatus } from '../types/pod';
import { 
  FileText, 
  DollarSign, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Truck,
  CreditCard
} from 'lucide-react';

interface PODOrderCardProps {
  order: PODOrder;
}

const getStatusConfig = (status: PODStatus) => {
  const configs = {
    'Available': { variant: 'outline' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' },
    'Assigned': { variant: 'secondary' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👤' },
    'In Progress': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '⚡' },
    'Ready for Delivery': { variant: 'outline' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '📦' },
    'Delivered': { variant: 'default' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🚚' },
    'Payment Received': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '💵' },
    'Cancelled': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
    'On Hold': { variant: 'outline' as const, color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏸️' },
    'Disputed': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '⚠️' },
    'Refunded': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '↩️' }
  };
  return configs[status] || configs['Available'];
};

export function PODOrderCard({ order }: PODOrderCardProps) {
  const { user } = useAuth();
  const { handlePODOrderAction, recordDelivery, recordPayment, pickPODOrder } = usePOD();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer' | 'other'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const statusConfig = getStatusConfig(order.status);
  const isOverdue = new Date(order.deadline) < new Date();
  const canPick = order.status === 'Available' && !order.writerId;
  const canWork = order.status === 'Assigned' && order.writerId === user?.id;
  const canDeliver = order.status === 'In Progress' && order.writerId === user?.id;
  const canRecordPayment = order.status === 'Delivered' && order.writerId === user?.id;



  const handlePickOrder = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmPickOrder = () => {
    if (user) {
      // Use the pickPODOrder function to assign the order to the writer
      pickPODOrder(order.id, user.id, user.name || 'Unknown Writer');
    }
  };

  const handleStartWorking = () => {
    handlePODOrderAction('start_working', order.id);
  };

  const handleReadyForDelivery = () => {
    handlePODOrderAction('ready_for_delivery', order.id);
  };

  const handleSubmitDelivery = () => {
    if (clientName.trim()) {
      recordDelivery(order.id, {
        podOrderId: order.id,
        deliveredAt: new Date().toISOString(),
        deliveredBy: user?.id || '',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        status: 'delivered'
      });
      setIsDeliveryModalOpen(false);
      setDeliveryNotes('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
    }
  };

  const handleSubmitPayment = () => {
    recordPayment(order.id, {
      podOrderId: order.id,
      amount: order.podAmount,
      receivedAt: new Date().toISOString(),
      paymentMethod,
      notes: paymentNotes.trim() || undefined,
      collectedBy: user?.id || ''
    });
    setIsPaymentModalOpen(false);
    setPaymentNotes('');
    setPaymentMethod('cash');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {order.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusConfig.variant} className={`${statusConfig.color} ${statusConfig.bg}`}>
                <span className="mr-1">{statusConfig.icon}</span>
                {order.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              KES {order.podAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">POD Amount</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{order.paperType}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{order.subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{order.pages} pages</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{new Date(order.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm">{order.description}</p>

        {/* Additional Instructions */}
        {order.additionalInstructions && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> {order.additionalInstructions}
            </p>
          </div>
        )}

        {/* POD Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Pay on Delivery (POD) Order
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Payment will be collected upon delivery. No advance payment required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {canPick && (
            <Button onClick={handlePickOrder} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Pick Order
            </Button>
          )}
          
          {canWork && (
            <Button onClick={handleStartWorking} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Start Working
            </Button>
          )}

          {order.status === 'In Progress' && order.writerId === user?.id && (
            <Button onClick={handleReadyForDelivery} className="bg-yellow-600 hover:bg-yellow-700">
              <Truck className="w-4 h-4 mr-2" />
              Ready for Delivery
            </Button>
          )}

          {canDeliver && (
            <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Truck className="w-4 h-4 mr-2" />
                  Record Delivery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Delivery</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Enter client phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Enter client email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                    <Textarea
                      id="deliveryNotes"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Any notes about the delivery"
                    />
                  </div>
                  <Button onClick={handleSubmitDelivery} disabled={!clientName.trim()}>
                    Confirm Delivery
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {canRecordPayment && (
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment Received</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                         <Select value={paymentMethod} onValueChange={(value: 'cash' | 'mobile_money' | 'bank_transfer' | 'other') => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentNotes">Payment Notes</Label>
                    <Textarea
                      id="paymentNotes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Any notes about the payment"
                    />
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Amount to collect:</strong> KES {order.podAmount.toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={handleSubmitPayment}>
                    Confirm Payment Received
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Order Info Footer */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Order ID: {order.id}</span>
            <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>

      {/* POD Confirmation Modal */}
      <PODConfirmationModal
        order={order}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmPickOrder}
      />
    </Card>
  );
}
