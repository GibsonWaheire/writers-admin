import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

export default function WalletPage() {
  const { wallet, getMonthlyEarnings } = useWallet();
  
  const thisMonthEarnings = getMonthlyEarnings();
  const lastMonthEarnings = getMonthlyEarnings(new Date().getMonth() - 1);
  const earningsChange = lastMonthEarnings > 0 ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) : 0;

  const walletStats = [
    { 
      label: "Available Balance", 
      value: `$${wallet.availableBalance.toLocaleString()}`, 
      change: `+$${thisMonthEarnings.toLocaleString()} this month`,
      changeType: thisMonthEarnings > 0 ? "positive" : "neutral"
    },
    { 
      label: "Pending Earnings", 
      value: `$${wallet.pendingEarnings.toLocaleString()}`, 
      change: "3 orders",
      changeType: "neutral"
    },
    { 
      label: "Total Earned", 
      value: `$${wallet.totalEarned.toLocaleString()}`, 
      change: `${earningsChange > 0 ? '+' : ''}${earningsChange}% this month`,
      changeType: earningsChange > 0 ? "positive" : earningsChange < 0 ? "negative" : "neutral"
    },
    { 
      label: "Total Withdrawn", 
      value: `$${wallet.totalWithdrawn.toLocaleString()}`, 
      change: "Last: Dec 15",
      changeType: "neutral"
    }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {walletStats.map((stat, index) => (
          <Card key={index} className={index === 0 ? "bg-gradient-primary text-white" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${index === 0 ? "text-white/80" : "text-muted-foreground"}`}>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${index === 0 ? "text-white" : "text-foreground"}`}>
                {stat.value}
              </div>
              <p className={`text-xs mt-1 ${index === 0 ? "text-white/70" : getChangeColor(stat.changeType)}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Download className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Request Withdrawal</h3>
                <p className="text-sm text-muted-foreground">Withdraw your earnings</p>
              </div>
              <Button>Withdraw</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Earnings Report</h3>
                <p className="text-sm text-muted-foreground">Download monthly report</p>
              </div>
              <Button variant="outline">Download</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Manage payment options</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wallet.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === "earning" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {transaction.type === "earning" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
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
                <div className={`font-medium ${
                  transaction.type === "earning" ? "text-success" : "text-foreground"
                }`}>
                  ${transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
