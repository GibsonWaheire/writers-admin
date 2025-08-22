import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics, performance reports, and business insights
          </p>
        </div>
      </div>

      <Card className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-500">Advanced analytics and reporting functionality coming soon.</p>
      </Card>
    </div>
  );
}
