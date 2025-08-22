import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useOrders } from "../contexts/OrderContext";

export default function AdminWritersPage() {
  const { orders, getWriterTotalEarnings } = useOrders();

  // Get writer statistics
  const allWriters = Array.from(new Set(orders.filter(o => o.writerId).map(o => o.writerId!)));
  const writerStats = allWriters.map(writerId => {
    const writerOrders = orders.filter(o => o.writerId === writerId);
    const stats = {
      writerId,
      writerName: writerOrders[0]?.assignedWriter || 'Unknown',
      total: writerOrders.length,
      inProgress: writerOrders.filter(o => o.status === 'In Progress').length,
      submitted: writerOrders.filter(o => o.status === 'Submitted').length,
      completed: writerOrders.filter(o => ['Completed', 'Approved'].includes(o.status)).length,
      rejected: writerOrders.filter(o => o.status === 'Rejected').length,
      earnings: getWriterTotalEarnings(writerId)
    };
    return stats;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Writer Management</h1>
          <p className="text-muted-foreground">
            Monitor writer performance, manage accounts, and track productivity metrics
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          Invite New Writer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {writerStats.map((writer) => (
          <Card key={writer.writerId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{writer.writerName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="ml-2 font-medium">{writer.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">In Progress:</span>
                  <span className="ml-2 font-medium">{writer.inProgress}</span>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <span className="ml-2 font-medium">{writer.submitted}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 font-medium">{writer.completed}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings:</span>
                  <span className="font-semibold text-green-600">
                    KES {writer.earnings.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {writerStats.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Writers Found</h3>
          <p className="text-gray-500">No writers have been assigned to orders yet.</p>
        </Card>
      )}
    </div>
  );
}
