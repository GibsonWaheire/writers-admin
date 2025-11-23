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
import { PODReassignmentModal } from './PODReassignmentModal';
import { PODSubmitModal } from './PODSubmitModal';
import { RequestPODRevisionModal } from './RequestPODRevisionModal';
import type { PODOrder, PODStatus, PODWriterConfirmation } from '../types/pod';
import { getWriterIdForUser } from '../utils/writer';
import { 
  FileText, 
  DollarSign, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Truck,
  CreditCard,
  RotateCcw,
  RefreshCw,
  XCircle
} from 'lucide-react';

interface PODOrderCardProps {
  order: PODOrder;
}

const getStatusConfig = (status: PODStatus) => {
  const configs = {
    'Available': { variant: 'outline' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' },
    'Assigned': { variant: 'secondary' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👤' },
    'In Progress': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-50', icon: '⚡' },
    'Submitted to Admin': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50', icon: '📋' },
    'Admin Approved': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
    'Revision Required': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: '🔄' },
    'Ready for Delivery': { variant: 'outline' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '📦' },
    'Delivered': { variant: 'default' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🚚' },
    'Payment Received': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '💵' },
    'Completed': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: '🎉' },
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
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRequestRevisionModal, setShowRequestRevisionModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer' | 'other'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const statusConfig = getStatusConfig(order.status);
  const isOverdue = new Date(order.deadline) < new Date();
  const canPick = order.status === 'Available' && !order.writerId;
  const writerId = getWriterIdForUser(user?.id);
  const canWork = order.status === 'Assigned' && order.writerId === writerId;
  const canDeliver = order.status === 'In Progress' && order.writerId === writerId;
  const canRecordPayment = order.status === 'Delivered' && order.writerId === writerId;
  const isAdmin = user?.role === 'admin';
  const canApprovePOD = isAdmin && (order.status === 'Submitted to Admin' || (order.status === 'Submitted to Admin' && order.revisionCount && order.revisionCount > 0));
  const canRequestPODRevision = isAdmin && order.status === 'Submitted to Admin';

  // Calculate remaining time in hours
  const getRemainingTime = () => {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return { text: `Overdue by ${Math.abs(diffHours)} hours`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffHours === 0) {
      return { text: 'Due within the hour', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (diffHours <= 6) {
      return { text: `Due in ${diffHours} hours`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffHours} hours`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const remainingTime = getRemainingTime();


  const handlePickOrder = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmPickOrder = (confirmation: PODWriterConfirmation) => {
    if (user) {
      // Store the confirmation data (you might want to save this to a database)
      console.log('POD Order Confirmation:', confirmation);
      
      // Use the pickPODOrder function to assign the order to the writer
      pickPODOrder(order.id, writerId, user.name || 'Unknown Writer');
      // Close the confirmation modal
      setIsConfirmationModalOpen(false);
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

  const handleReassignOrder = async (reason: string) => {
    if (user) {
      // Reassign the order back to available status
      handlePODOrderAction('reassign', order.id);
      // You could also add a note about the reassignment reason
      console.log(`POD Order ${order.id} reassigned by ${user.name} for reason: ${reason}`);
    }
  };

  const handleSubmitPODOrder = async (submission: {
    files: File[];
    notes: string;
  }) => {
    if (user) {
      // Mark the order as submitted to admin for review
      handlePODOrderAction('submit_to_admin', order.id);
      // You could also store the submission details
      console.log(`POD Order ${order.id} submitted to admin by ${user.name}`, submission);
    }
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
              KES {(order.pages * 350).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">POD Amount ({order.pages} pages × KES 350)</div>
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
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Deadline:</span>
            <span className={`font-medium ${remainingTime.color}`}>
              {remainingTime.text}
            </span>
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

          {order.status === 'In Progress' && order.writerId === writerId && (
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
                      <strong>Amount to collect:</strong> KES {(order.pages * 350).toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={handleSubmitPayment}>
                    Confirm Payment Received
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Additional Actions for Picked Orders */}
          {(order.status === 'Assigned' || order.status === 'In Progress') && order.writerId === writerId && (
            <>
              <Button 
                onClick={() => setShowReassignModal(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reassign Order
              </Button>
              
              <Button 
                onClick={() => setShowSubmitModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit to Admin
              </Button>
            </>
          )}

          {/* Action for Admin Approved Orders */}
          {order.status === 'Admin Approved' && order.writerId === writerId && (
            <Button 
              onClick={handleReadyForDelivery}
              className="bg-green-600 hover:bg-green-700"
            >
              <Truck className="w-4 h-4 mr-2" />
              Mark Ready for Delivery
            </Button>
          )}

          {/* Action for Ready for Delivery Orders */}
          {order.status === 'Ready for Delivery' && order.writerId === writerId && (
            <Button 
              onClick={() => setIsDeliveryModalOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Truck className="w-4 h-4 mr-2" />
              Record Delivery
            </Button>
          )}

          {/* Show admin review status for submitted orders */}
          {order.status === 'Submitted to Admin' && order.writerId === writerId && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-800">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Submitted to Admin for Review</span>
              </div>
              <p className="text-sm text-purple-600 mt-1">
                Your work has been submitted and is awaiting admin review. 
                You will be notified once it's approved and ready for delivery.
              </p>
            </div>
          )}

          {/* Show admin approved status */}
          {order.status === 'Admin Approved' && order.writerId === writerId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Admin Approved - Ready for Delivery</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your work has been approved by admin. You can now proceed with delivery to the client.
              </p>
              {order.adminReviewNotes && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600 font-medium">Admin Notes:</p>
                  <p className="text-sm text-gray-800">{order.adminReviewNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Show revision required status */}
          {order.status === 'Revision Required' && order.writerId === writerId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Revision Required</span>
                {order.revisionCount && order.revisionCount > 1 && (
                  <Badge variant="destructive" className="text-xs">
                    Revision #{order.revisionCount}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-red-600 mt-1">
                Admin has requested revisions to your work. Please review the feedback and resubmit.
              </p>
              {order.revisionNotes && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600 font-medium">Revision Notes:</p>
                  <p className="text-sm text-gray-800">{order.revisionNotes}</p>
                </div>
              )}
              <div className="mt-3">
                <Button 
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Resubmit After Revision
                </Button>
              </div>
            </div>
          )}

          {/* Admin Actions for Submitted POD Orders */}
          {isAdmin && order.status === 'Submitted to Admin' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-800 mb-3">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Admin Review Required</span>
                {order.revisionCount && order.revisionCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    POD Revision #{order.revisionCount}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    if (!confirm('Approve this POD order? It will be marked as ready for delivery.')) return;
                    setIsApproving(true);
                    try {
                      await handlePODOrderAction('admin_approve', order.id, {
                        adminId: user?.id,
                        notes: 'POD order approved by admin'
                      });
                    } catch (error) {
                      console.error('Failed to approve POD order:', error);
                      alert('Failed to approve POD order. Please try again.');
                    } finally {
                      setIsApproving(false);
                    }
                  }}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isApproving ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {order.revisionCount && order.revisionCount > 0 ? 'Approve POD Revision' : 'Approve POD Order'}
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setShowRequestRevisionModal(true)}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {order.revisionCount && order.revisionCount > 0 ? `Request Revision #${(order.revisionCount || 0) + 1}` : 'Request Revision'}
                </Button>
              </div>
            </div>
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

      {/* POD Reassignment Modal */}
      <PODReassignmentModal
        order={order}
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onConfirm={handleReassignOrder}
      />

      {/* POD Submit Modal */}
      <PODSubmitModal
        order={order}
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitPODOrder}
      />

      {/* Request POD Revision Modal */}
      {isAdmin && (
        <RequestPODRevisionModal
          isOpen={showRequestRevisionModal}
          onClose={() => setShowRequestRevisionModal(false)}
          order={order}
          onRequestRevision={async (orderId, explanation, notes) => {
            try {
              await handlePODOrderAction('admin_reject', orderId, {
                adminId: user?.id,
                notes: explanation,
                explanation: explanation
              });
              setShowRequestRevisionModal(false);
            } catch (error) {
              console.error('Failed to request POD revision:', error);
              alert('Failed to request revision. Please try again.');
            }
          }}
        />
      )}
    </Card>
  );
}
