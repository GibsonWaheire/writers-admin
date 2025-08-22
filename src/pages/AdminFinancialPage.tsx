import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function AdminFinancialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground">
            Track payments, earnings, and financial reports for the platform
          </p>
        </div>
      </div>

      <Card className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">💰</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Financial Management</h3>
        <p className="text-gray-500">Financial overview and payment processing functionality coming soon.</p>
      </Card>
    </div>
  );
}
