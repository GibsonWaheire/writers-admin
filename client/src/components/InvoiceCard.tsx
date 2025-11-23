
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Download, 
  DollarSign, 
  Calendar, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  User,
  Send,
  CreditCard,
  Eye
} from 'lucide-react';
import type { InvoiceData } from '../contexts/InvoicesContext';

interface InvoiceCardProps {
  invoice: InvoiceData;
  onDownload?: (invoiceId: string) => void;
  onViewDetails?: (invoice: InvoiceData) => void;
  onSubmit?: (invoiceId: string) => void;
  onRequestPayment?: (invoiceId: string) => void;
  userRole?: string;
}

export function InvoiceCard({ invoice, onDownload, onViewDetails, onSubmit, onRequestPayment, userRole }: InvoiceCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  const getOrderTypeBadge = (orderType: string) => {
    return orderType === 'pod' ? 
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">POD Order</Badge> :
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Regular Order</Badge>;
  };

  const getInvoiceStatusBadge = (invoiceStatus?: string) => {
    if (!invoiceStatus) return null;
    switch (invoiceStatus) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = () => {
    if (invoice.paymentStatus === 'paid' || invoice.paymentStatus === 'cancelled') return false;
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg text-gray-900">
              Invoice #{invoice.id}
            </CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">
              {invoice.orderTitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            {invoice.invoiceStatus && getInvoiceStatusBadge(invoice.invoiceStatus)}
            {getStatusBadge(invoice.status)}
            {getPaymentStatusBadge(invoice.paymentStatus)}
            {getOrderTypeBadge(invoice.orderType)}
            <span className="text-xs text-gray-500 font-mono">
              Order: {invoice.orderId}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invoice Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Writer:</span>
              <span className="font-medium">{invoice.writerName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(invoice.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">Due Date:</span>
              <span className={`font-medium ${isOverdue() ? 'text-red-600' : ''}`}>
                {formatDate(invoice.dueDate)}
                {isOverdue() && <AlertTriangle className="h-3 w-3 ml-1 inline text-red-600" />}
              </span>
            </div>
            
            {invoice.paidAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Paid:</span>
                <span className="font-medium">{formatDate(invoice.paidAt)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-green-600">KES {invoice.totalAmountKES.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Writer Earnings:</span>
              <span className="font-medium text-blue-600">KES {invoice.writerEarnings.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600">Platform Fee:</span>
              <span className="font-medium text-purple-600">KES {invoice.platformFee.toLocaleString()}</span>
            </div>
            
            {invoice.paymentMethod && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{invoice.paymentMethod}</span>
              </div>
            )}

            {invoice.pages && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{invoice.pages}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {invoice.paymentStatus === 'paid' && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Payment completed
              </span>
            )}
            {invoice.paymentStatus === 'pending' && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                Awaiting payment
              </span>
            )}
            {invoice.paymentStatus === 'overdue' && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Payment overdue
              </span>
            )}
            {invoice.paymentStatus === 'cancelled' && (
              <span className="flex items-center gap-1 text-gray-600">
                <XCircle className="h-3 w-3" />
                Invoice cancelled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(invoice)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
            
            {/* Submit Invoice Button (for draft invoices) */}
            {userRole === 'writer' && invoice.invoiceStatus === 'draft' && onSubmit && (
              <Button 
                size="sm"
                onClick={() => onSubmit(invoice.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
            
            {/* Request Payment Button (for approved invoices) */}
            {userRole === 'writer' && invoice.invoiceStatus === 'approved' && invoice.paymentStatus === 'pending' && onRequestPayment && (
              <Button 
                size="sm"
                onClick={() => onRequestPayment(invoice.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payment
              </Button>
            )}
            
            {onDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(invoice.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
