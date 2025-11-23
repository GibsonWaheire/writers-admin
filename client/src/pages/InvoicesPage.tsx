import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
// import { Badge } from "../components/ui/badge"; // Will be used for future badge components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  // Filter, 
  Download,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  // XCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { InvoiceCard } from "../components/InvoiceCard";
import { useInvoices } from "../contexts/InvoicesContext";
import { useAuth } from "../contexts/AuthContext";
import { getWriterIdForUser } from "../utils/writer";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [filterOrderType, setFilterOrderType] = useState<string>("");
  
  const { 
    invoices, 
    totalInvoices, 
    totalAmount, 
    paidAmount, 
    pendingAmount, 
    overdueAmount,
    getInvoicesByStatus,
    exportInvoices
  } = useInvoices();
  
  const { user } = useAuth();
  const currentUserRole = user?.role || 'writer';
  const writerId = getWriterIdForUser(user?.id);

  // Filter invoices based on search and filters
  const filterInvoices = (invoiceList: typeof invoices) => {
    return invoiceList.filter(invoice => {
      const matchesSearch = 
        invoice.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || invoice.paymentStatus === filterStatus;
      const matchesOrderType = !filterOrderType || invoice.orderType === filterOrderType;
      
      let matchesDate = true;
      if (filterDateRange) {
        const invoiceDate = new Date(invoice.createdAt);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDateRange) {
          case 'today':
            matchesDate = diffDays === 0;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'quarter':
            matchesDate = diffDays <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesOrderType;
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would trigger a download
    console.log(`Downloading invoice ${invoiceId}`);
  };

  const handleExportInvoices = (format: 'csv' | 'pdf' | 'excel') => {
    exportInvoices(format);
  };

  // Get invoices by status
  const pendingInvoices = filterInvoices(getInvoicesByStatus('pending'));
  const paidInvoices = filterInvoices(getInvoicesByStatus('paid'));
  const overdueInvoices = filterInvoices(getInvoicesByStatus('overdue'));
  const cancelledInvoices = filterInvoices(getInvoicesByStatus('cancelled'));

  // Filter invoices based on user role
  const getRelevantInvoices = () => {
    if (currentUserRole === 'admin') {
      return invoices; // Admins see all invoices
    } else if (currentUserRole === 'writer') {
      return invoices.filter(inv => inv.writerId === writerId); // Writers see their own invoices
    } else {
      return invoices; // Clients see all invoices (or could be filtered by their orders)
    }
  };

  const relevantInvoices = getRelevantInvoices();
  const filteredInvoices = filterInvoices(relevantInvoices);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Track and manage all payment invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportInvoices('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportInvoices('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">KES {pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Admins */}
      {currentUserRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">KES {overdueAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Past due invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices, orders, or writers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterOrderType}
            onChange={(e) => setFilterOrderType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="regular">Regular Orders</option>
            <option value="pod">POD Orders</option>
          </select>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Invoices Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredInvoices.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingInvoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueInvoices.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledInvoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <InvoicesList 
            invoices={filteredInvoices} 
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <InvoicesList 
            invoices={pendingInvoices} 
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <InvoicesList 
            invoices={paidInvoices} 
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <InvoicesList 
            invoices={overdueInvoices} 
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <InvoicesList 
            invoices={cancelledInvoices} 
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InvoicesListProps {
  invoices: any[];
  onDownload: (invoiceId: string) => void;
}

function InvoicesList({ invoices, onDownload }: InvoicesListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No invoices found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <InvoiceCard 
          key={invoice.id} 
          invoice={invoice} 
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
