import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  Receipt,
  Wallet,
  PieChart
} from "lucide-react";
import { useFinancial } from "../contexts/FinancialContext";
import { useOrders } from "../contexts/OrderContext";
import { useUsers } from "../contexts/UsersContext";
import type { Invoice, Payment, Fine } from "../types/financial";

export default function AdminFinancialPage() {
  const { 
    invoices, 
    payments, 
    fines, 
    clientPayments,
    financialSummary, 
    approveInvoice, 
    processPayment, 
    waiveFine,
    getWriterFinancials 
  } = useFinancial();
  const { orders } = useOrders();
  const { writers } = useUsers();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWriter, setSelectedWriter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleApproveInvoice = (invoiceId: string) => {
    approveInvoice(invoiceId, 'admin-1');
  };

  const handleProcessPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      processPayment({
        ...payment,
        status: 'completed',
        completedAt: new Date().toISOString(),
        processedBy: 'admin-1'
      });
    }
  };

  const handleWaiveFine = (fineId: string) => {
    const reason = prompt('Enter reason for waiving this fine:');
    if (reason) {
      waiveFine(fineId, 'admin-1', reason);
    }
  };

  const getStatusBadge = (status: string, type: 'invoice' | 'payment' | 'fine' = 'invoice') => {
    const variants = {
      invoice: {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-blue-100 text-blue-800",
        paid: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800"
      },
      fine: {
        pending: "bg-yellow-100 text-yellow-800",
        applied: "bg-red-100 text-red-800",
        waived: "bg-green-100 text-green-800"
      }
    };
    return variants[type][status as keyof typeof variants[typeof type]] || "bg-gray-100 text-gray-800";
  };

  const filterItems = (items: any[], type: string) => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.writerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedWriter) {
      filtered = filtered.filter(item => item.writerId === selectedWriter);
    }

    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">
            Track payments, earnings, and comprehensive financial reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {financialSummary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{((financialSummary.monthlyRevenue / financialSummary.totalRevenue) * 100).toFixed(1)}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writer Payments</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {financialSummary.totalWriterPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.pendingPayments.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {financialSummary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Invoices awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client vs Writer vs Profit Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                KES {financialSummary.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 font-medium">Client Payments</div>
              <div className="text-xs text-green-600 mt-1">Amount paid by clients</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                KES {financialSummary.totalWriterPayments.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 font-medium">Writer Payments</div>
              <div className="text-xs text-blue-600 mt-1">Amount paid to writers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                KES {financialSummary.totalProfit.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 font-medium">Platform Profit</div>
              <div className="text-xs text-purple-600 mt-1">{financialSummary.profitMargin.toFixed(1)}% margin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedWriter}
              onChange={(e) => setSelectedWriter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Writers</option>
              {writers.map(writer => (
                <option key={writer.id} value={writer.id}>{writer.name}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedWriter('');
              setSelectedStatus('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="fines">Fines ({fines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialSummary.recentInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{invoice.orderTitle}</div>
                        <div className="text-xs text-gray-600">
                          {invoice.writerName} • {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">KES {invoice.amount.toLocaleString()}</div>
                        <Badge className={getStatusBadge(invoice.status, 'invoice')}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialSummary.recentPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{payment.writerName}</div>
                        <div className="text-xs text-gray-600">
                          {payment.method} • {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">KES {payment.amount.toLocaleString()}</div>
                        <Badge className={getStatusBadge(payment.status, 'payment')}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="space-y-4">
            {filterItems(invoices, 'invoice').map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{invoice.orderTitle}</div>
                        <Badge className={getStatusBadge(invoice.status, 'invoice')}>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Writer:</strong> {invoice.writerName}</div>
                        <div><strong>Amount:</strong> KES {invoice.amount.toLocaleString()}</div>
                        <div><strong>Pages:</strong> {invoice.orderPages}</div>
                        <div><strong>Created:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</div>
                      </div>

                      {invoice.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {invoice.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {invoice.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveInvoice(invoice.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="space-y-4">
            {filterItems(payments, 'payment').map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{payment.writerName}</div>
                        <Badge className={getStatusBadge(payment.status, 'payment')}>
                          {payment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Amount:</strong> KES {payment.amount.toLocaleString()}</div>
                        <div><strong>Method:</strong> {payment.method.replace('_', ' ')}</div>
                        <div><strong>Type:</strong> {payment.type.replace('_', ' ')}</div>
                        <div><strong>Created:</strong> {new Date(payment.createdAt).toLocaleDateString()}</div>
                      </div>

                      {payment.reference && (
                        <div className="text-sm text-gray-600">
                          <strong>Reference:</strong> {payment.reference}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {payment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleProcessPayment(payment.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fines" className="space-y-4">
          <div className="space-y-4">
            {filterItems(fines, 'fine').map((fine) => (
              <Card key={fine.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{fine.writerName}</div>
                        <Badge className={getStatusBadge(fine.status, 'fine')}>
                          {fine.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Amount:</strong> KES {fine.amount.toLocaleString()}</div>
                        <div><strong>Type:</strong> {fine.type.replace('_', ' ')}</div>
                        <div><strong>Applied:</strong> {new Date(fine.appliedAt).toLocaleDateString()}</div>
                      </div>

                      <div className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg mb-2">
                        <strong>Reason:</strong> {fine.reason}
                      </div>

                      {fine.orderTitle && (
                        <div className="text-sm text-gray-600">
                          <strong>Related Order:</strong> {fine.orderTitle}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {fine.status === 'applied' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWaiveFine(fine.id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          Waive Fine
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
