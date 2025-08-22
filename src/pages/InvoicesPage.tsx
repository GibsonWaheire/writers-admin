import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { InvoiceCard } from "../components/InvoiceCard";
import type { Invoice } from "../types/order";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");

  // Sample invoices data - in a real app, this would come from an invoices context
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      orderId: 'ORD-005',
      orderTitle: 'Business Plan for Sustainable Energy Startup',
      writerId: 'writer-3',
      writerName: 'Mike Johnson',
      amount: 600,
      status: 'paid',
      createdAt: '2024-01-25T16:00:00Z',
      paidAt: '2024-01-26T10:30:00Z',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'INV-002',
      orderId: 'ORD-002',
      orderTitle: 'Marketing Analysis Report for Tech Startup',
      writerId: 'writer-1',
      writerName: 'John Doe',
      amount: 280,
      status: 'pending',
      createdAt: '2024-01-20T14:00:00Z'
    },
    {
      id: 'INV-003',
      orderId: 'ORD-004',
      orderTitle: 'Technical Documentation for Mobile API',
      writerId: 'writer-2',
      writerName: 'Jane Smith',
      amount: 320,
      status: 'paid',
      createdAt: '2024-01-22T11:00:00Z',
      paidAt: '2024-01-23T09:15:00Z',
      paymentMethod: 'PayPal'
    },
    {
      id: 'INV-004',
      orderId: 'ORD-001',
      orderTitle: 'Research Paper on Climate Change Impact',
      writerId: 'writer-4',
      writerName: 'Sarah Wilson',
      amount: 450,
      status: 'cancelled',
      createdAt: '2024-01-18T08:00:00Z'
    }
  ]);

  // Filter invoices based on search and filters
  const filterInvoices = (invoiceList: Invoice[]) => {
    return invoiceList.filter(invoice => {
      const matchesSearch = 
        invoice.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || invoice.status === filterStatus;
      
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
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would trigger a download
    console.log(`Downloading invoice ${invoiceId}`);
  };

  // Get invoices by status
  const pendingInvoices = filterInvoices(invoices.filter(inv => inv.status === 'pending'));
  const paidInvoices = filterInvoices(invoices.filter(inv => inv.status === 'paid'));
  const cancelledInvoices = filterInvoices(invoices.filter(inv => inv.status === 'cancelled'));

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Track and manage all payment invoices</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
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
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined invoice value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All ({filterInvoices(invoices).length})
          </TabsTrigger>
          
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingInvoices.length})
          </TabsTrigger>
          
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Paid ({paidInvoices.length})
          </TabsTrigger>
          
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Cancelled ({cancelledInvoices.length})
          </TabsTrigger>
        </TabsList>

        {/* All Invoices Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filterInvoices(invoices).length > 0 ? (
              filterInvoices(invoices).map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDownload={handleDownloadInvoice}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                <p className="text-gray-500">No invoices match your current filters.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Pending Invoices Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {pendingInvoices.length > 0 ? (
              pendingInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDownload={handleDownloadInvoice}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Invoices</h3>
                <p className="text-gray-500">All invoices have been paid or processed.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Paid Invoices Tab */}
        <TabsContent value="paid" className="space-y-4">
          <div className="grid gap-4">
            {paidInvoices.length > 0 ? (
              paidInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDownload={handleDownloadInvoice}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Paid Invoices</h3>
                <p className="text-gray-500">No invoices have been paid yet.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Cancelled Invoices Tab */}
        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid gap-4">
            {cancelledInvoices.length > 0 ? (
              cancelledInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDownload={handleDownloadInvoice}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancelled Invoices</h3>
                <p className="text-gray-500">No invoices have been cancelled.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
