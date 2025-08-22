import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage writer accounts, permissions, and platform access controls
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Add New User
        </Button>
      </div>

      <Card className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">User Management</h3>
        <p className="text-gray-500">User account management and permission controls coming soon.</p>
      </Card>
    </div>
  );
}
