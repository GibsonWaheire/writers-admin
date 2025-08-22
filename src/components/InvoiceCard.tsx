
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
  XCircle
} from 'lucide-react';
import type { Invoice } from '../types/order';

interface InvoiceCardProps {
  invoice: Invoice;
  onDownload?: (invoiceId: string) => void;
}

export function InvoiceCard({ invoice, onDownload }: InvoiceCardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock className="h-4 w-4" /> },
      'paid': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="h-4 w-4" /> },
      'cancelled': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="h-4 w-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending'];
    return (
      <Badge variant={config.variant} className={`${config.color} ${config.bg} border-0 flex items-center gap-1`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
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
            {getStatusBadge(invoice.status)}
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
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Writer:</span>
              <span className="font-medium">{invoice.writerName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(invoice.createdAt)}</span>
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
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-green-600">KES {(invoice.order.pages * 350).toLocaleString()}</span>
            </div>
            
            {invoice.paymentMethod && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{invoice.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {invoice.status === 'paid' && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Payment completed
              </span>
            )}
            {invoice.status === 'pending' && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                Awaiting payment
              </span>
            )}
            {invoice.status === 'cancelled' && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                Invoice cancelled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
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
