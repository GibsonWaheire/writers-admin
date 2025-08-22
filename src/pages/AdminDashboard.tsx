import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  UserCheck,
  AlertCircle,
  Eye,
  UserPlus,
  Star
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Orders",
      value: "156",
      icon: FileText,
      change: "+12 this month",
      changeType: "positive" as const,
      gradient: true
    },
    {
      title: "Active Writers",
      value: "28",
      icon: Users,
      change: "+3 new writers",
      changeType: "positive" as const
    },
    {
      title: "Pending Reviews",
      value: "7",
      icon: Clock,
      change: "2 urgent",
      changeType: "neutral" as const
    },
    {
      title: "Completed Orders",
      value: "134",
      icon: CheckCircle,
      change: "+18 this week",
      changeType: "positive" as const
    },
    {
      title: "Total Revenue",
      value: "$45,230",
      icon: DollarSign,
      change: "+23% vs last month",
      changeType: "positive" as const
    },
    {
      title: "Writer Satisfaction",
      value: "4.7",
      icon: TrendingUp,
      change: "↑ 0.3 improvement",
      changeType: "positive" as const
    }
  ];

  const pendingOrders = [
    {
      id: "ORD-104",
      title: "Business Strategy Analysis",
      writer: "John Smith",
      pages: 20,
      price: "$600",
      deadline: "2024-01-24",
      status: "Pending Review",
      priority: "High"
    },
    {
      id: "ORD-105", 
      title: "Literature Review - Medicine",
      writer: "Sarah Johnson",
      pages: 15,
      price: "$450",
      deadline: "2024-01-26",
      status: "In Progress",
      priority: "Medium"
    },
    {
      id: "ORD-106",
      title: "Technical Documentation",
      writer: "Unassigned",
      pages: 12,
      price: "$360",
      deadline: "2024-01-28",
      status: "Available",
      priority: "Low"
    }
  ];

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "Pending Review": "secondary",
      "In Progress": "default", 
      "Available": "outline",
      "Completed": "default",
      "Rejected": "destructive"
    };
    return statusColors[status] || "default";
  };

  const getPriorityBadge = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    const priorityColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "High": "destructive",
      "Medium": "secondary",
      "Low": "outline"
    };
    return priorityColors[priority] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the administrative control panel. Manage your writing platform from here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Main Navigation Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Writer Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Manage and monitor writer performance, assignments, and productivity metrics
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📂</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Orders Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              View, assign, and track all writing orders and their current status
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Reviews & Ratings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Monitor client feedback, ratings, and quality metrics for all writers
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Financial Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Track payments, earnings, and financial reports for the platform
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">👥</span>
              </div>
              <CardTitle className="text-lg text-gray-800">User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Manage writer accounts, permissions, and platform access controls
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-lg text-gray-800">Analytics & Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Comprehensive analytics, performance reports, and business insights
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Orders Requiring Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{order.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Writer: {order.writer}</span>
                    <span>{order.pages} pages</span>
                    <span>{order.price}</span>
                    <span>Due: {order.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityBadge(order.priority)}>
                    {order.priority}
                  </Badge>
                  <Badge variant={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="default">
              <FileText className="mr-2 h-4 w-4" />
              Create New Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Orders
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Writers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Process Payments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-green-50 transition-colors duration-200">
              <span className="text-green-600">✅</span>
              <span>Order ORD-103 completed by Sarah Johnson</span>
              <span className="text-muted-foreground text-xs ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <span className="text-blue-600">👤</span>
              <span>New writer Michael Brown joined the platform</span>
              <span className="text-muted-foreground text-xs ml-auto">4 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-yellow-50 transition-colors duration-200">
              <span className="text-yellow-600">📄</span>
              <span>Order ORD-106 submitted for review</span>
              <span className="text-muted-foreground text-xs ml-auto">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}