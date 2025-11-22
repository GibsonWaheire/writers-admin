import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  CreditCard,
  ArrowDownRight,
  FileText,
  Package,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { WithdrawalModal } from "../components/WithdrawalModal";
import { PaymentMethodsModal } from "../components/PaymentMethodsModal";

export default function WalletPage() {
  const { 
    wallet, 
    getMonthlyEarnings, 
    getPendingEarnings, 
    getEarningsBreakdown, 
    getTotalWithdrawn,
    getPendingWithdrawals,
    syncWithOrders, 
    getPendingOrdersCount 
  } = useWallet();
  const navigate = useNavigate();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  
  const thisMonthEarnings = getMonthlyEarnings();
  const lastMonthEarnings = getMonthlyEarnings(new Date().getMonth() - 1);
  const earningsChange = lastMonthEarnings > 0 ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) : 0;
  
  const pendingEarnings = getPendingEarnings();
  const earningsBreakdown = getEarningsBreakdown();

  const totalWithdrawn = getTotalWithdrawn();
  const pendingWithdrawals = getPendingWithdrawals();
  const lastWithdrawal = pendingWithdrawals.length > 0 ? 
    `Last: ${new Date(pendingWithdrawals[0].date).toLocaleDateString()}` : 
    "No withdrawals yet";

  const walletStats = [
    { 
      label: "Available Balance", 
      value: `KES ${wallet.availableBalance.toLocaleString()}`, 
      change: `+KES ${thisMonthEarnings.toLocaleString()} this month`,
      changeType: thisMonthEarnings > 0 ? "positive" : "neutral",
      icon: DollarSign,
      color: "bg-gradient-to-r from-green-500 to-emerald-600"
    },
    { 
      label: "Pending Earnings", 
      value: `KES ${pendingEarnings.toLocaleString()}`, 
      change: `${getPendingOrdersCount()} orders pending payment`,
      changeType: "neutral",
      icon: Clock,
      color: "bg-gradient-to-r from-orange-500 to-amber-600"
    },
    { 
      label: "Total Earned", 
      value: `KES ${wallet.totalEarned.toLocaleString()}`, 
      change: `${earningsChange > 0 ? '+' : ''}${earningsChange}% this month`,
      changeType: earningsChange > 0 ? "positive" : earningsChange < 0 ? "negative" : "neutral",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-blue-500 to-indigo-600"
    },
    { 
      label: "Total Withdrawn", 
      value: `KES ${totalWithdrawn.toLocaleString()}`, 
      change: lastWithdrawal,
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-gradient-to-r from-purple-500 to-pink-600"
    }
  ];



  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncWithOrders();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleWithdraw = () => {
    setShowWithdrawalModal(true);
  };

  const handleDownloadReport = () => {
    // Create a simple CSV report
    const reportData = [
      ['Date', 'Type', 'Description', 'Amount (KES)', 'Status'],
      ...wallet.transactions.map(tx => [
        tx.date,
        tx.type === 'earning' ? 'Regular Order' : tx.type === 'pod_earning' ? 'POD Order' : 'Withdrawal',
        tx.description,
        tx.amount.toString(),
        tx.status
      ])
    ];
    
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleManagePaymentMethods = () => {
    setShowPaymentMethodsModal(true);
  };

  const handleViewOrder = (orderId: string) => {
    navigate('/orders', { state: { selectedOrder: orderId } });
  };

  const handleViewPODOrder = (podOrderId: string) => {
    navigate('/pod-orders', { state: { selectedOrder: podOrderId } });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <FileText className="h-4 w-4" />;
      case 'pod_earning':
        return <Package className="h-4 w-4" />;
      case 'withdrawal':
        return <ArrowDownRight className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
      case 'pod_earning':
        return 'bg-green-100 text-green-700';
      case 'withdrawal':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {walletStats.map((stat, index) => (
          <Card key={index} className={`${stat.color} text-white shadow-lg`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/80">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-white/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
              <p className="text-xs mt-1 text-white/70">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Earnings Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Regular Orders</span>
                <span className="font-medium">KES {earningsBreakdown.regular.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">POD Orders</span>
                <span className="font-medium">KES {earningsBreakdown.pod.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">KES {earningsBreakdown.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
                          <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Regular Orders</span>
                  <span className="font-medium">
                    {getPendingOrdersCount() > 0 ? `${getPendingOrdersCount()} orders` : '0 orders'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">POD Orders</span>
                  <span className="font-medium">
                    {getPendingOrdersCount() > 0 ? `${getPendingOrdersCount()} orders` : '0 orders'}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Pending</span>
                    <span className="font-bold text-lg text-orange-600">
                      KES {pendingEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleWithdraw}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Request Withdrawal</h3>
                <p className="text-sm text-muted-foreground">Withdraw your earnings</p>
              </div>
              <Button size="sm">Withdraw</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleDownloadReport}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Earnings Report</h3>
                <p className="text-sm text-muted-foreground">Download monthly report</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleManagePaymentMethods}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Manage payment options</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="pod">POD</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {wallet.transactions.length > 0 ? (
                wallet.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{transaction.description}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                          {transaction.orderId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleViewOrder(transaction.orderId!)}
                            >
                              View Order
                            </Button>
                          )}
                          {transaction.podOrderId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleViewPODOrder(transaction.podOrderId!)}
                            >
                              View POD Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === 'earning' || transaction.type === 'pod_earning' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}KES {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                  <p className="text-gray-500">Complete your first order to see earnings here.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="earnings" className="space-y-4">
              {wallet.transactions.filter(tx => tx.type === 'earning').map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100 text-green-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{transaction.description}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {transaction.date}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                        {transaction.orderId && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => handleViewOrder(transaction.orderId!)}
                          >
                            View Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-green-600">
                    +KES {transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="pod" className="space-y-4">
              {wallet.transactions.filter(tx => tx.type === 'pod_earning').map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{transaction.description}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {transaction.date}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                        {transaction.podOrderId && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => handleViewPODOrder(transaction.podOrderId!)}
                          >
                            View POD Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-green-600">
                    +KES {transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="withdrawals" className="space-y-4">
              {wallet.transactions.filter(tx => tx.type === 'withdrawal').map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-red-100 text-red-700">
                      <ArrowDownRight className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{transaction.description}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {transaction.date}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-red-600">
                    -KES {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Modal */}
      <WithdrawalModal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)} 
      />

      {/* Payment Methods Modal */}
      <PaymentMethodsModal 
        isOpen={showPaymentMethodsModal} 
        onClose={() => setShowPaymentMethodsModal(false)} 
      />
    </div>
  );
}
