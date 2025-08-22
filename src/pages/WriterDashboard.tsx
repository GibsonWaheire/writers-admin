import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  Star,
  TrendingUp,
  Eye,
  Calendar,
  Download,
  MessageSquare
} from "lucide-react";
import { OrderViewModal } from "../components/OrderViewModal";
import { useOrders } from "../contexts/OrderContext";
import { useState } from "react";
import type { Order } from "../types/order";

export default function WriterDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pickOrder } = useOrders();
  
  const stats = [
    {
      title: "Wallet Balance",
      value: "$1,247.50",
      icon: DollarSign,
      change: "+$127.50 this month",
      changeType: "positive" as const,
      gradient: true
    },
    {
      title: "Total Orders",
      value: "24",
      icon: FileText,
      change: "+3 new orders",
      changeType: "positive" as const
    },
    {
      title: "Pending Orders",
      value: "3",
      icon: Clock,
      change: "2 due this week",
      changeType: "neutral" as const
    },
    {
      title: "Completed Orders",
      value: "18",
      icon: CheckCircle,
      change: "+2 this week",
      changeType: "positive" as const
    },
    {
      title: "Average Rating",
      value: "4.8",
      icon: Star,
      change: "↑ 0.2 from last month",
      changeType: "positive" as const
    },
    {
      title: "This Month Earnings",
      value: "$2,340",
      icon: TrendingUp,
      change: "+15% from last month",
      changeType: "positive" as const
    }
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      title: "Research Paper on Climate Change",
      pages: 15,
      price: "$450",
      deadline: "2024-01-25",
      status: "In Progress"
    },
    {
      id: "ORD-002", 
      title: "Marketing Analysis Report",
      pages: 8,
      price: "$280",
      deadline: "2024-01-28",
      status: "Pending Review"
    },
    {
      id: "ORD-003",
      title: "Literature Review - Psychology",
      pages: 12,
      price: "$360",
      deadline: "2024-01-30",
      status: "Available"
    }
  ];

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "In Progress": "default",
      "Pending Review": "secondary", 
      "Available": "outline",
      "Completed": "default",
      "Rejected": "destructive"
    };
    return statusColors[status] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your writing assignments today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Recent Orders and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📚</span>
                      <h4 className="font-semibold text-gray-900">{order.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>📄</span>
                        {order.pages} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💰</span>
                        {order.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        Due: {order.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadge(order.status)} className="flex items-center gap-1">
                      {order.status === "In Progress" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                      {order.status === "Pending Review" && <span className="text-yellow-600">👁️</span>}
                      {order.status === "Available" && <span className="text-green-600">🔓</span>}
                      {order.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                      onClick={() => {
                        setSelectedOrder({
                          id: order.id,
                          title: order.title,
                          description: "Order description will be shown here",
                          subject: "General",
                          pages: order.pages,
                          price: parseInt(order.price.replace('$', '')),
                          deadline: order.deadline,
                          status: order.status as any,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <span className="mr-2">👁️</span>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200" variant="outline">
                <span className="mr-2">📑</span>
                Browse Available Orders
              </Button>
              <Button className="w-full justify-start hover:bg-green-50 hover:border-green-300 transition-all duration-200" variant="outline">
                <span className="mr-2">💵</span>
                Request Withdrawal
              </Button>
              <Button className="w-full justify-start hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200" variant="outline">
                <span className="mr-2">⭐</span>
                View My Reviews
              </Button>
              <Button className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" variant="outline">
                <span className="mr-2">💬</span>
                Check Messages
              </Button>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>⏰</span>
                  On-time delivery
                </span>
                <span className="text-sm font-medium text-green-600">98%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>😊</span>
                  Client satisfaction
                </span>
                <span className="text-sm font-medium text-green-600">4.8/5</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🎯</span>
                  Monthly goal
                </span>
                <span className="text-sm font-medium text-blue-600">85%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userRole="writer"
          onPickOrder={(orderId) => {
            pickOrder(orderId, 'writer-1'); // Assuming current writer ID
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}