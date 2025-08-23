import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { 
  DollarSign, 
  TrendingUp, 
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
// useOrders removed - not needed
import { useUsers } from "../contexts/UsersContext";
// Types are imported in contexts

export default function AdminFinancialPage() {
  const { 
    invoices, 
    payments, 
    fines, 
    withdrawalRequests,
    transactionLogs,
    platformBalance,
    financialSummary, 
    createManualInvoice,
    approveInvoice, 
    processPayment, 
    waiveFine,
    addPlatformFunds,
    approveWithdrawal,
    rejectWithdrawal,
    markWithdrawalPaid 
  } = useFinancial();
  const { writers } = useUsers();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  // Removed unused filter state variables
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);

  const handleApproveInvoice = (invoiceId: string) => {
    approveInvoice(invoiceId, 'admin-1');
  };

  const handleProcessPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const reference = prompt('Enter payment reference (optional):') || `PAY-${Date.now()}`;
      processPayment({
        ...payment,
        status: 'processing',
        processedAt: new Date().toISOString(),
        processedBy: 'admin-1',
        reference
      });
      
      // Auto-complete after 2 seconds (simulating payment processing)
      setTimeout(() => {
        processPayment({
          ...payment,
          status: 'completed',
          completedAt: new Date().toISOString(),
          processedBy: 'admin-1',
          reference
        });
      }, 2000);
    }
  };

  const handleBulkApproveInvoices = () => {
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    if (pendingInvoices.length === 0) {
      alert('No pending invoices to approve');
      return;
    }
    
    if (confirm(`Approve ${pendingInvoices.length} pending invoices?`)) {
      pendingInvoices.forEach(invoice => {
        approveInvoice(invoice.id, 'admin-1');
      });
    }
  };

  const handleCreateManualInvoice = () => {
    const writerId = prompt('Enter Writer ID (e.g., writer-1):');
    if (!writerId) return;
    
    const writer = writers.find(w => w.id === writerId);
    if (!writer) {
      alert('Writer not found');
      return;
    }
    
    const amount = prompt('Enter Amount (KES):');
    if (!amount || isNaN(Number(amount))) {
      alert('Invalid amount');
      return;
    }
    
    const description = prompt('Enter Description:');
    if (!description) return;
    
    const type = prompt('Enter Type (bonus/correction/order_completion):') as 'bonus' | 'correction' | 'order_completion';
    
    try {
      createManualInvoice({
        writerId: writer.id,
        writerName: writer.name,
        amount: Number(amount),
        description,
        type: type || 'bonus'
      });
      alert('Manual invoice created successfully!');
    } catch {
      alert('Failed to create invoice');
    }
  };

  const handleExportFinancials = (type: 'invoices' | 'payments' | 'summary') => {
    // Simulate export functionality
    const data = type === 'invoices' ? invoices : 
                 type === 'payments' ? payments : 
                 { summary: financialSummary };
    
    console.log(`Exporting ${type}:`, data);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);
  };

  const handleAddFunds = () => {
    const amount = prompt('Enter amount to add (KES):');
    if (!amount || isNaN(Number(amount))) {
      alert('Invalid amount');
      return;
    }

    const source = prompt('Enter source (bank_transfer/mpesa/paypal/stripe/manual):') || 'manual';
    const reference = prompt('Enter reference (optional):');
    const notes = prompt('Enter notes (optional):');

    try {
      addPlatformFunds({
        amount: Number(amount),
        source,
        reference: reference || undefined,
        notes: notes || undefined
      });
      alert('Funds added successfully!');
    } catch {
      alert('Failed to add funds');
    }
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    try {
      approveWithdrawal(withdrawalId, 'admin-1');
      alert('Withdrawal approved successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve withdrawal';
      alert(errorMessage);
    }
  };

  const handleRejectWithdrawal = (withdrawalId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectWithdrawal(withdrawalId, 'admin-1', reason);
      alert('Withdrawal rejected');
    }
  };

  const handleMarkWithdrawalPaid = (withdrawalId: string) => {
    const reference = prompt('Enter payment reference:');
    if (reference) {
      markWithdrawalPaid(withdrawalId, 'admin-1', reference);
      alert('Withdrawal marked as paid!');
    }
  };

  // Bulk operations handlers
  const handleSelectWithdrawal = (withdrawalId: string, checked: boolean) => {
    if (checked) {
      setSelectedWithdrawals(prev => [...prev, withdrawalId]);
    } else {
      setSelectedWithdrawals(prev => prev.filter(id => id !== withdrawalId));
    }
  };

  const handleSelectAllWithdrawals = (checked: boolean) => {
    if (checked) {
      setSelectedWithdrawals(withdrawalRequests.map(w => w.id));
    } else {
      setSelectedWithdrawals([]);
    }
  };

  const handleBulkApproveWithdrawals = () => {
    const withdrawalsToApprove = selectedWithdrawals.filter(id => {
      const withdrawal = withdrawalRequests.find(w => w.id === id);
      return withdrawal && withdrawal.status === 'pending';
    });

    if (withdrawalsToApprove.length === 0) {
      alert('No pending withdrawals selected');
      return;
    }

    if (confirm(`Approve ${withdrawalsToApprove.length} selected withdrawals?`)) {
      withdrawalsToApprove.forEach(id => handleApproveWithdrawal(id));
      setSelectedWithdrawals([]);
    }
  };

  const handleBulkPayWithdrawals = () => {
    const withdrawalsToPay = selectedWithdrawals.filter(id => {
      const withdrawal = withdrawalRequests.find(w => w.id === id);
      return withdrawal && withdrawal.status === 'approved';
    });

    if (withdrawalsToPay.length === 0) {
      alert('No approved withdrawals selected');
      return;
    }

    if (confirm(`Mark ${withdrawalsToPay.length} selected withdrawals as paid?`)) {
      withdrawalsToPay.forEach(id => {
        const reference = `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        markWithdrawalPaid(id, 'admin-1', reference);
      });
      setSelectedWithdrawals([]);
      alert(`${withdrawalsToPay.length} withdrawals marked as paid!`);
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

  const filterItems = <T extends { writerName?: string; orderTitle?: string; reason?: string }>(items: T[]): T[] => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.writerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          <Button 
            variant="outline"
            onClick={() => handleExportFinancials('summary')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button 
            onClick={handleAddFunds}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
          <Button 
            onClick={handleCreateManualInvoice}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manual Invoice
          </Button>
        </div>
      </div>

      {/* Quick Actions Floating Panel */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        <Card className="w-64 shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
              <div className="p-1 bg-blue-100 rounded-full">
                <Plus className="h-4 w-4" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleAddFunds}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              size="sm"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            
            <Button 
              onClick={handleBulkApproveInvoices}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            
            <Button 
              onClick={() => {
                const approvedWithdrawals = withdrawalRequests.filter(w => w.status === 'approved');
                if (approvedWithdrawals.length === 0) {
                  alert('No approved withdrawals to pay');
                  return;
                }
                approvedWithdrawals.forEach(w => {
                  const reference = `BULK-PAY-${Date.now()}`;
                  markWithdrawalPaid(w.id, 'admin-1', reference);
                });
                alert(`${approvedWithdrawals.length} withdrawals paid!`);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md"
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Approved
            </Button>
            
            <Button 
              onClick={() => handleExportFinancials('summary')}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            
            <div className="pt-2 border-t border-blue-100">
              <Button 
                onClick={() => {
                  // Auto-approval settings modal would open here
                  alert('Auto-approval settings coming soon!');
                }}
                variant="ghost"
                className="w-full text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                size="sm"
              >
                ⚙️ Auto-Pay Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Balance Alert */}
      <Card className="border-l-4 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Wallet className="h-5 w-5" />
            Platform Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              className="text-center p-4 rounded-lg bg-blue-100 hover:bg-blue-200 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={handleAddFunds}
              title="Click to add more funds"
            >
              <div className="text-2xl font-bold text-blue-600">
                KES {platformBalance.availableFunds.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Available Funds</div>
              <div className="text-xs text-blue-500 mt-1">Click to add funds</div>
            </div>
            <div 
              className="text-center p-4 rounded-lg bg-yellow-100 hover:bg-yellow-200 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => setActiveTab('withdrawals')}
              title="Click to view pending withdrawals"
            >
              <div className="text-xl font-semibold text-yellow-600">
                KES {platformBalance.pendingWithdrawals.toLocaleString()}
              </div>
              <div className="text-sm text-yellow-700">Pending Withdrawals</div>
              <div className="text-xs text-yellow-500 mt-1">Click to manage</div>
            </div>
            <div 
              className="text-center p-4 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => {
                setActiveTab('transactions');
                setSearchTerm('withdrawal_paid');
              }}
              title="Click to view withdrawal history"
            >
              <div className="text-xl font-semibold text-gray-600">
                KES {platformBalance.totalWithdrawn.toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">Total Withdrawn</div>
              <div className="text-xs text-gray-500 mt-1">Click for history</div>
            </div>
            <div 
              className="text-center p-4 rounded-lg bg-green-100 hover:bg-green-200 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => {
                setActiveTab('transactions');
                setSearchTerm('fund_added');
              }}
              title="Click to view fund history"
            >
              <div className="text-xl font-semibold text-green-600">
                KES {platformBalance.totalFunds.toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Total Platform Funds</div>
              <div className="text-xs text-green-500 mt-1">Click for details</div>
            </div>
          </div>
          {platformBalance.availableFunds < platformBalance.pendingWithdrawals && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <strong>Warning:</strong> Insufficient funds to cover pending withdrawals!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">System Status</span>
                </div>
                <div className="text-xs text-green-600">All systems operational</div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          platformBalance.availableFunds < platformBalance.pendingWithdrawals 
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
            : platformBalance.availableFunds < (platformBalance.totalFunds * 0.1)
            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    platformBalance.availableFunds < platformBalance.pendingWithdrawals 
                      ? 'bg-red-500 animate-pulse' 
                      : platformBalance.availableFunds < (platformBalance.totalFunds * 0.1)
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-blue-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    platformBalance.availableFunds < platformBalance.pendingWithdrawals 
                      ? 'text-red-800' 
                      : platformBalance.availableFunds < (platformBalance.totalFunds * 0.1)
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}>
                    Fund Status
                  </span>
                </div>
                <div className={`text-xs ${
                  platformBalance.availableFunds < platformBalance.pendingWithdrawals 
                    ? 'text-red-600' 
                    : platformBalance.availableFunds < (platformBalance.totalFunds * 0.1)
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}>
                  {platformBalance.availableFunds < platformBalance.pendingWithdrawals 
                    ? 'Critical: Insufficient funds' 
                    : platformBalance.availableFunds < (platformBalance.totalFunds * 0.1)
                    ? 'Warning: Low funds'
                    : 'Healthy fund levels'
                  }
                </div>
              </div>
              {platformBalance.availableFunds < platformBalance.pendingWithdrawals ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Wallet className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          withdrawalRequests.filter(w => w.status === 'pending').length > 0
            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    withdrawalRequests.filter(w => w.status === 'pending').length > 0
                      ? 'bg-orange-500 animate-pulse'
                      : 'bg-gray-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    withdrawalRequests.filter(w => w.status === 'pending').length > 0
                      ? 'text-orange-800'
                      : 'text-gray-800'
                  }`}>
                    Pending Approvals
                  </span>
                </div>
                <div className={`text-xs ${
                  withdrawalRequests.filter(w => w.status === 'pending').length > 0
                    ? 'text-orange-600'
                    : 'text-gray-600'
                }`}>
                  {withdrawalRequests.filter(w => w.status === 'pending').length > 0
                    ? `${withdrawalRequests.filter(w => w.status === 'pending').length} awaiting approval`
                    : 'All caught up!'
                  }
                </div>
              </div>
              <Clock className={`h-5 w-5 ${
                withdrawalRequests.filter(w => w.status === 'pending').length > 0
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-800">Live Transactions</span>
                </div>
                <div className="text-xs text-purple-600">{transactionLogs.length} recorded today</div>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-green-300"
          onClick={() => {
            setActiveTab('overview');
            // Could open revenue breakdown modal
          }}
        >
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
            <p className="text-xs text-green-600 mt-1">Click for breakdown</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300"
          onClick={() => {
            setActiveTab('payments');
            // Filter to completed payments
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writer Payments</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {financialSummary.totalWriterPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.pendingPayments.toLocaleString()} pending
            </p>
            <p className="text-xs text-blue-600 mt-1">Click to view payments</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-purple-300"
          onClick={() => {
            setActiveTab('overview');
            // Could show profit analysis
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {financialSummary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.profitMargin.toFixed(1)}% margin
            </p>
            <p className="text-xs text-purple-600 mt-1">Click for analysis</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-orange-300"
          onClick={() => {
            setActiveTab('invoices');
            // Filter to pending invoices
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Invoices awaiting approval
            </p>
            <p className="text-xs text-orange-600 mt-1">Click to approve</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-800">Total Client Payments</div>
                  <div className="text-sm text-green-600">Revenue from all orders</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    KES {financialSummary.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-500">100%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-800">Writer Payments</div>
                  <div className="text-sm text-blue-600">Paid to writers</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    KES {financialSummary.totalWriterPayments.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-500">
                    {((financialSummary.totalWriterPayments / financialSummary.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-800">Platform Profit</div>
                  <div className="text-sm text-purple-600">Net profit margin</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600">
                    KES {financialSummary.totalProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-500">
                    {financialSummary.profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">This Month Revenue</div>
                  <div className="text-sm text-gray-600">Current month earnings</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    KES {financialSummary.monthlyRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">Monthly Writer Payments</div>
                  <div className="text-sm text-gray-600">Payments this month</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    KES {financialSummary.monthlyWriterPayments.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-semibold text-yellow-800">Pending Amounts</div>
                  <div className="text-sm text-yellow-600">Awaiting processing</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-700">
                    KES {(financialSummary.pendingInvoices + financialSummary.pendingPayments).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-semibold text-red-800">Outstanding Fines</div>
                  <div className="text-sm text-red-600">Fines applied</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-700">
                    KES {financialSummary.pendingFines.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
            }}>
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawalRequests.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="fines">Fines ({fines.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {selectedWithdrawals.length > 0 ? (
                <>
                  <Button 
                    size="sm"
                    onClick={handleBulkApproveWithdrawals}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected ({selectedWithdrawals.length})
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleBulkPayWithdrawals}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Selected ({selectedWithdrawals.length})
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setSelectedWithdrawals([])}
                    variant="outline"
                  >
                    Clear Selection
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');
                      if (pendingWithdrawals.length === 0) {
                        alert('No pending withdrawals to approve');
                        return;
                      }
                      if (confirm(`Approve ${pendingWithdrawals.length} pending withdrawals?`)) {
                        pendingWithdrawals.forEach(w => handleApproveWithdrawal(w.id));
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All Pending
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const approvedWithdrawals = withdrawalRequests.filter(w => w.status === 'approved');
                      if (approvedWithdrawals.length === 0) {
                        alert('No approved withdrawals to pay');
                        return;
                      }
                      approvedWithdrawals.forEach(w => {
                        const reference = `AUTO-PAY-${Date.now()}`;
                        markWithdrawalPaid(w.id, 'admin-1', reference);
                      });
                      alert(`${approvedWithdrawals.length} withdrawals marked as paid!`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay All Approved
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {withdrawalRequests.length} requests • Total: KES {withdrawalRequests.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
              {selectedWithdrawals.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedWithdrawals.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Bulk Selection Header */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <Checkbox
              id="select-all-withdrawals"
              checked={selectedWithdrawals.length === withdrawalRequests.length && withdrawalRequests.length > 0}
              onCheckedChange={handleSelectAllWithdrawals}
            />
            <label htmlFor="select-all-withdrawals" className="text-sm font-medium text-gray-700 cursor-pointer">
              Select All ({withdrawalRequests.length} withdrawals)
            </label>
            {selectedWithdrawals.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedWithdrawals.length} selected
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {withdrawalRequests.map((withdrawal) => (
              <Card key={withdrawal.id} className={`hover:shadow-md transition-shadow ${
                selectedWithdrawals.includes(withdrawal.id) ? 'ring-2 ring-blue-200 bg-blue-50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="pt-1">
                        <Checkbox
                          id={`withdrawal-${withdrawal.id}`}
                          checked={selectedWithdrawals.includes(withdrawal.id)}
                          onCheckedChange={(checked) => handleSelectWithdrawal(withdrawal.id, !!checked)}
                        />
                      </div>
                      <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{withdrawal.writerName}</div>
                        <Badge className={getStatusBadge(withdrawal.status, 'payment')}>
                          {withdrawal.status}
                        </Badge>
                        {withdrawal.status === 'approved' && platformBalance.availableFunds >= withdrawal.amount && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Ready to Pay
                          </Badge>
                        )}
                        {withdrawal.status === 'approved' && platformBalance.availableFunds < withdrawal.amount && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Insufficient Funds
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Amount:</strong> KES {withdrawal.amount.toLocaleString()}</div>
                        <div><strong>Method:</strong> {withdrawal.method.replace('_', ' ')}</div>
                        <div><strong>Requested:</strong> {new Date(withdrawal.requestedAt).toLocaleDateString()}</div>
                        <div><strong>Writer ID:</strong> {withdrawal.writerId}</div>
                      </div>

                      {/* Account Details */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="text-sm font-medium mb-2">Payment Details:</div>
                        {withdrawal.method === 'mobile_money' && withdrawal.accountDetails.mobileNumber && (
                          <div className="text-sm">Mobile: {withdrawal.accountDetails.mobileNumber}</div>
                        )}
                        {withdrawal.method === 'bank_transfer' && (
                          <div className="text-sm">
                            {withdrawal.accountDetails.bankName && <div>Bank: {withdrawal.accountDetails.bankName}</div>}
                            {withdrawal.accountDetails.accountNumber && <div>Account: {withdrawal.accountDetails.accountNumber}</div>}
                          </div>
                        )}
                        {withdrawal.method === 'paypal' && withdrawal.accountDetails.paypalEmail && (
                          <div className="text-sm">PayPal: {withdrawal.accountDetails.paypalEmail}</div>
                        )}
                      </div>

                      {/* Status-specific information */}
                      {withdrawal.approvedAt && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded mb-2">
                          <strong>Approved:</strong> {new Date(withdrawal.approvedAt).toLocaleDateString()} by {withdrawal.approvedBy}
                        </div>
                      )}

                      {withdrawal.rejectedAt && withdrawal.rejectionReason && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
                          <strong>Rejected:</strong> {withdrawal.rejectionReason}
                          <div className="text-xs mt-1">
                            By {withdrawal.rejectedBy} on {new Date(withdrawal.rejectedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {withdrawal.paidAt && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mb-2">
                          <strong>Paid:</strong> {new Date(withdrawal.paidAt).toLocaleDateString()} by {withdrawal.paidBy}
                          {withdrawal.paymentReference && <div>Reference: {withdrawal.paymentReference}</div>}
                        </div>
                      )}

                      {withdrawal.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {withdrawal.notes}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Request ID: {withdrawal.id} • {withdrawal.invoiceId && `Invoice: ${withdrawal.invoiceId}`}
                      </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {withdrawal.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={platformBalance.availableFunds < withdrawal.amount}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {withdrawal.status === 'approved' && (
                        <Button 
                          size="sm"
                          onClick={() => handleMarkWithdrawalPaid(withdrawal.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={platformBalance.availableFunds < withdrawal.amount}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}

                      {withdrawal.status === 'paid' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => handleExportFinancials('invoices')}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Invoices
              </Button>
              {invoices.filter(inv => inv.status === 'pending').length > 0 && (
                <Button 
                  size="sm"
                  onClick={handleBulkApproveInvoices}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All Pending
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {filterItems(invoices).length} invoices found
            </div>
          </div>
          
          <div className="space-y-4">
            {filterItems(invoices).map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{invoice.orderTitle}</div>
                        <Badge className={getStatusBadge(invoice.status, 'invoice')}>
                          {invoice.status}
                        </Badge>
                        {invoice.status === 'approved' && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Ready for Payment
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Writer:</strong> {invoice.writerName}</div>
                        <div><strong>Amount:</strong> KES {invoice.amount.toLocaleString()}</div>
                        <div><strong>Pages:</strong> {invoice.orderPages}</div>
                        <div><strong>Created:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</div>
                      </div>

                      {invoice.approvedAt && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded mb-2">
                          <strong>Approved:</strong> {new Date(invoice.approvedAt).toLocaleDateString()} by {invoice.approvedBy}
                        </div>
                      )}

                      {invoice.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {invoice.notes}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Invoice ID: {invoice.id} • Order completed: {new Date(invoice.orderCompletedAt).toLocaleDateString()}
                      </div>
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
                      
                      {invoice.status === 'approved' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Find related payment and process it
                            const relatedPayment = payments.find(p => p.relatedInvoiceId === invoice.id);
                            if (relatedPayment) {
                              handleProcessPayment(relatedPayment.id);
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => handleExportFinancials('payments')}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Payments
              </Button>
              {payments.filter(p => p.status === 'pending').length > 0 && (
                <Button 
                  size="sm"
                  onClick={() => {
                    const pendingPayments = payments.filter(p => p.status === 'pending');
                    if (confirm(`Process ${pendingPayments.length} pending payments?`)) {
                      pendingPayments.forEach(payment => handleProcessPayment(payment.id));
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process All Pending
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {filterItems(payments).length} payments • Total: KES {filterItems(payments).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-4">
            {filterItems(payments).map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{payment.writerName}</div>
                        <Badge className={getStatusBadge(payment.status, 'payment')}>
                          {payment.status}
                        </Badge>
                        {payment.status === 'processing' && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                            <span className="text-xs">Processing...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Amount:</strong> KES {payment.amount.toLocaleString()}</div>
                        <div><strong>Method:</strong> {payment.method.replace('_', ' ')}</div>
                        <div><strong>Type:</strong> {payment.type.replace('_', ' ')}</div>
                        <div><strong>Created:</strong> {new Date(payment.createdAt).toLocaleDateString()}</div>
                      </div>

                      {payment.processedAt && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mb-2">
                          <strong>Processed:</strong> {new Date(payment.processedAt).toLocaleDateString()} by {payment.processedBy}
                        </div>
                      )}

                      {payment.completedAt && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded mb-2">
                          <strong>Completed:</strong> {new Date(payment.completedAt).toLocaleDateString()}
                        </div>
                      )}

                      {payment.reference && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                          <strong>Reference:</strong> {payment.reference}
                        </div>
                      )}

                      {payment.relatedOrderId && (
                        <div className="text-xs text-gray-500">
                          Payment ID: {payment.id} • Related Order: {payment.relatedOrderId}
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

                      {payment.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => {
                  const appliedFines = fines.filter(f => f.status === 'applied');
                  if (appliedFines.length === 0) {
                    alert('No applied fines to waive');
                    return;
                  }
                  const reason = prompt(`Enter reason for waiving ${appliedFines.length} fines:`);
                  if (reason) {
                    appliedFines.forEach(fine => waiveFine(fine.id, 'admin-1', reason));
                  }
                }}
                variant="outline"
                className="text-green-600 hover:bg-green-50"
              >
                Waive All Applied
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  const writerId = prompt('Enter Writer ID:');
                  const amount = prompt('Enter Fine Amount (KES):');
                  const reason = prompt('Enter Fine Reason:');
                  if (writerId && amount && reason) {
                    alert('Fine application functionality would be implemented here');
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Apply Fine
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {filterItems(fines).length} fines • Total: KES {filterItems(fines).reduce((sum, f) => f.status === 'applied' ? sum + f.amount : sum, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-4">
            {filterItems(fines).map((fine) => (
              <Card key={fine.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">{fine.writerName}</div>
                        <Badge className={getStatusBadge(fine.status, 'fine')}>
                          {fine.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {fine.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Amount:</strong> KES {fine.amount.toLocaleString()}</div>
                        <div><strong>Applied:</strong> {new Date(fine.appliedAt).toLocaleDateString()}</div>
                        <div><strong>Applied by:</strong> {fine.appliedBy}</div>
                      </div>

                      <div className="text-sm text-gray-700 bg-red-50 border-l-4 border-red-400 p-3 rounded mb-2">
                        <strong>Reason:</strong> {fine.reason}
                      </div>

                      {fine.status === 'waived' && fine.waivedReason && (
                        <div className="text-sm text-green-700 bg-green-50 border-l-4 border-green-400 p-3 rounded mb-2">
                          <strong>Waived:</strong> {fine.waivedReason}
                          <div className="text-xs mt-1">
                            By {fine.waivedBy} on {fine.waivedAt ? new Date(fine.waivedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      )}

                      {fine.orderTitle && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Related Order:</strong> {fine.orderTitle}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Fine ID: {fine.id} • {fine.orderId ? `Order: ${fine.orderId}` : 'Manual fine'}
                      </div>
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

                      {fine.status === 'waived' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Waived
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => {
                  console.log('Transaction logs:', transactionLogs);
                  alert('Transaction logs exported to console');
                }}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Transactions
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {transactionLogs.length} transactions recorded
            </div>
          </div>

          <div className="space-y-4">
            {transactionLogs.length > 0 ? (
              transactionLogs.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold">{transaction.description}</div>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div><strong>Amount:</strong> KES {transaction.amount.toLocaleString()}</div>
                          <div><strong>Performed by:</strong> {transaction.performedBy}</div>
                          <div><strong>Date:</strong> {new Date(transaction.performedAt).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {new Date(transaction.performedAt).toLocaleTimeString()}</div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="bg-red-50 px-3 py-1 rounded">
                            <strong>Before:</strong> KES {transaction.balanceBefore.toLocaleString()}
                          </div>
                          <div className="text-gray-400">→</div>
                          <div className="bg-green-50 px-3 py-1 rounded">
                            <strong>After:</strong> KES {transaction.balanceAfter.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          Transaction ID: {transaction.id}
                          {transaction.relatedEntityId && ` • Related: ${transaction.relatedEntityId}`}
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className={`text-lg font-bold ${
                          transaction.type === 'fund_added' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'fund_added' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
                  <p className="text-gray-500">Transaction logs will appear here as you manage funds and payments.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
