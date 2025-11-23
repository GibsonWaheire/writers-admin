import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  TrendingUp,
  Download,
  Send,
  CreditCard,
  XCircle
} from 'lucide-react';
import type { InvoiceData } from '../contexts/InvoicesContext';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  onSubmit?: (invoiceId: string) => void;
  onRequestPayment?: (invoiceId: string) => void;
}

export function InvoiceDetailsModal({ 
  isOpen, 
  onClose, 
  invoice,
  onSubmit,
  onRequestPayment
}: InvoiceDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInvoiceStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted for Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            Invoice Details
            <span className="text-sm font-normal text-gray-500">#{invoice.id}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Complete invoice information and payment status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            {invoice.invoiceStatus && getInvoiceStatusBadge(invoice.invoiceStatus)}
            {getPaymentStatusBadge(invoice.paymentStatus)}
            <Badge className={invoice.orderType === 'pod' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
              {invoice.orderType === 'pod' ? 'POD Order' : 'Regular Order'}
            </Badge>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order Title:</span>
                <p className="font-medium text-gray-900">{invoice.orderTitle}</p>
              </div>
              <div>
                <span className="text-gray-600">Order ID:</span>
                <p className="font-medium text-gray-900 font-mono">{invoice.orderId}</p>
              </div>
              {invoice.pages && (
                <div>
                  <span className="text-gray-600">Pages:</span>
                  <p className="font-medium text-gray-900">{invoice.pages}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Writer:</span>
                <p className="font-medium text-gray-900">{invoice.writerName}</p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">Total Order Amount:</span>
                <span className="font-bold text-lg text-gray-900">KES {invoice.totalAmountKES.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">Writer Earnings:</span>
                </div>
                <span className="font-bold text-lg text-blue-600">KES {invoice.writerEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-gray-700 font-medium">Platform Fee:</span>
                <span className="font-bold text-lg text-purple-600">KES {invoice.platformFee.toLocaleString()}</span>
              </div>
              {invoice.lateFees && invoice.lateFees > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700 font-medium">Late Fees:</span>
                  <span className="font-bold text-lg text-red-600">KES {invoice.lateFees.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice Created</p>
                  <p className="text-xs text-gray-500">{formatDate(invoice.createdAt)}</p>
                </div>
              </div>
              
              {invoice.submittedAt && (
                <div className="flex items-center gap-3">
                  <Send className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted for Review</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.submittedAt)}</p>
                  </div>
                </div>
              )}
              
              {invoice.approvedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Approved by Admin</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.approvedAt)}</p>
                    {invoice.approvedBy && (
                      <p className="text-xs text-gray-400">Approved by: {invoice.approvedBy}</p>
                    )}
                  </div>
                </div>
              )}
              
              {invoice.paidAt && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Received</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.paidAt)}</p>
                    {invoice.paymentMethod && (
                      <p className="text-xs text-gray-400">Method: {invoice.paymentMethod}</p>
                    )}
                  </div>
                </div>
              )}
              
              {invoice.paymentRequestedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Requested</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.paymentRequestedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {invoice.invoiceStatus === 'rejected' && invoice.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-800">{invoice.rejectionReason}</p>
                  {invoice.rejectedAt && (
                    <p className="text-xs text-red-600 mt-2">Rejected on: {formatDate(invoice.rejectedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900 mb-1">Additional Notes</p>
              <p className="text-sm text-blue-800">{invoice.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {/* Submit Button (for draft invoices) */}
          {invoice.invoiceStatus === 'draft' && onSubmit && (
            <Button 
              onClick={() => {
                onSubmit(invoice.id);
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}
          
          {/* Request Payment Button (for approved invoices) */}
          {invoice.invoiceStatus === 'approved' && invoice.paymentStatus === 'pending' && onRequestPayment && (
            <Button 
              onClick={() => {
                onRequestPayment(invoice.id);
                onClose();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Request Payment
            </Button>
          )}
          
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

