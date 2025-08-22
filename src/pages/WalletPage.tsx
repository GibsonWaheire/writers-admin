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

export default function WalletPage() {
  const walletStats = [
    { label: "Available Balance", value: "$1,247.50", change: "+$127.50" },
    { label: "Pending Earnings", value: "$380.00", change: "3 orders" },
    { label: "Total Earned", value: "$5,890.75", change: "+15% this month" },
    { label: "Withdrawn", value: "$4,643.25", change: "Last: Dec 15" }
  ];

  const transactions = [
    {
      id: "TXN-001",
      type: "earning",
      description: "Order ORD-045 - Research Paper",
      amount: "$450.00",
      date: "2024-01-20",
      status: "Completed"
    },
    {
      id: "TXN-002",
      type: "withdrawal",
      description: "Bank Transfer to ****1234",
      amount: "-$800.00",
      date: "2024-01-18",
      status: "Processed"
    },
    {
      id: "TXN-003",
      type: "earning",
      description: "Order ORD-044 - Marketing Analysis",
      amount: "$280.00",
      date: "2024-01-15",
      status: "Completed"
    },
    {
      id: "TXN-004",
      type: "earning",
      description: "Order ORD-043 - Literature Review",
      amount: "$360.00",
      date: "2024-01-12",
      status: "Completed"
    },
    {
      id: "TXN-005",
      type: "withdrawal",
      description: "PayPal Transfer",
      amount: "-$500.00",
      date: "2024-01-10",
      status: "Processed"
    }
  ];

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
              <p className={`text-xs mt-1 ${index === 0 ? "text-white/70" : "text-success"}`}>
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
            {transactions.map((transaction) => (
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
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
