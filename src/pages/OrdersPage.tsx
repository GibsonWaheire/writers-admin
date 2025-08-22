import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  DollarSign,
  FileText,
  Calendar
} from "lucide-react";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "ORD-001",
      title: "Research Paper on Climate Change Impact",
      description: "Comprehensive analysis of climate change effects on coastal regions",
      pages: 15,
      price: "$450",
      deadline: "2024-01-25",
      status: "Available",
      category: "Research",
      difficulty: "Advanced",
      requirements: ["APA Format", "15+ References", "Graphs Required"]
    },
    {
      id: "ORD-002", 
      title: "Marketing Analysis for Tech Startup",
      description: "Market research and competitive analysis for emerging tech company",
      pages: 8,
      price: "$280",
      deadline: "2024-01-28",
      status: "In Progress",
      category: "Business",
      difficulty: "Intermediate",
      requirements: ["Harvard Style", "Case Studies", "SWOT Analysis"]
    },
    {
      id: "ORD-003",
      title: "Literature Review - Psychology",
      description: "Systematic review of cognitive behavioral therapy effectiveness",
      pages: 12,
      price: "$360",
      deadline: "2024-01-30",
      status: "Available",
      category: "Psychology",
      difficulty: "Advanced",
      requirements: ["APA Format", "20+ Sources", "Meta-analysis"]
    },
    {
      id: "ORD-004",
      title: "Technical Documentation",
      description: "API documentation for mobile application development",
      pages: 10,
      price: "$320",
      deadline: "2024-02-02",
      status: "Available",
      category: "Technology",
      difficulty: "Intermediate",
      requirements: ["Technical Writing", "Code Examples", "Diagrams"]
    }
  ];

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "Available": "outline",
      "In Progress": "default",
      "Pending Review": "secondary",
      "Completed": "default",
      "Rejected": "destructive"
    };
    return statusColors[status] || "default";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      "Beginner": "text-success",
      "Intermediate": "text-warning",
      "Advanced": "text-destructive"
    };
    return colors[difficulty] || "text-muted-foreground";
  };

  const filteredOrders = orders.filter(order =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableOrders = filteredOrders.filter(order => order.status === "Available");
  const myOrders = filteredOrders.filter(order => order.status !== "Available");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Browse and manage your writing assignments</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs for Available vs My Orders */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Orders ({availableOrders.length})</TabsTrigger>
          <TabsTrigger value="my-orders">My Orders ({myOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4">
            {availableOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.description}</p>
                    </div>
                    <Badge variant={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{order.pages} pages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-success">{order.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{order.deadline}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full">
                          {order.category}
                        </span>
                        <span className={`font-medium ${getDifficultyColor(order.difficulty)}`}>
                          {order.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.requirements.map((req, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-muted rounded-full">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1">
                          Apply for Order
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          <div className="grid gap-4">
            {myOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.description}</p>
                    </div>
                    <Badge variant={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{order.pages} pages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-success">{order.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {order.deadline}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === "In Progress" && (
                        <Button size="sm">
                          Submit Work
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
