import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Users,
  FileText
} from "lucide-react";
import type { Order } from '../types/order';

interface AdminOrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onAction: (action: string, orderId: string, additionalData?: Record<string, unknown>) => void;
  onAssign: (order: Order) => void;
}

export function AdminOrdersTable({ 
  orders, 
  onView, 
  onAction,
  onAssign 
}: AdminOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedWriter && order.assignedWriter.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesDiscipline = !filterDiscipline || order.discipline === filterDiscipline;
    
    return matchesSearch && matchesStatus && matchesDiscipline;
  });

  // Get unique disciplines and statuses for filters
  const disciplines = Array.from(new Set(orders.map(order => order.discipline))).sort();
  const statuses = Array.from(new Set(orders.map(order => order.status))).sort();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Available': { color: 'bg-green-100 text-green-800 border-green-200', icon: BookOpen },
      'Assigned': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck },
      'In Progress': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'Submitted': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: FileText },
      'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      'Revision': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: RefreshCw },
      'Overdue': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Available'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs font-medium`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', urgent: true };
    } else if (diffDays <= 2) {
      return { text: `${diffDays}d left`, color: 'text-yellow-600', urgent: false };
    } else {
      return { text: `${diffDays}d left`, color: 'text-green-600', urgent: false };
    }
  };

  const renderActionButtons = (order: Order) => {
    const actions = [];

    switch (order.status) {
      case 'Available':
        actions.push(
          <Button
            key="assign"
            size="sm"
            variant="outline"
            onClick={() => onAssign(order)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Assign
          </Button>
        );
        break;

      case 'Submitted':
        actions.push(
          <Button
            key="approve"
            size="sm"
            onClick={() => onAction('approve', order.id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>,
          <Button
            key="revision"
            size="sm"
            variant="outline"
            onClick={() => onAction('request_revision', order.id)}
            className="text-yellow-600 hover:bg-yellow-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Revision
          </Button>,
          <Button
            key="reject"
            size="sm"
            variant="outline"
            onClick={() => onAction('reject', order.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        );
        break;

      case 'Assigned':
        actions.push(
          <Button
            key="make-available"
            size="sm"
            variant="outline"
            onClick={() => onAction('make_available', order.id)}
            className="text-orange-600 hover:bg-orange-50"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Make Available
          </Button>
        );
        break;
    }

    actions.push(
      <Button
        key="view"
        size="sm"
        variant="ghost"
        onClick={() => onView(order)}
        className="text-gray-600 hover:bg-gray-50"
      >
        <Eye className="h-3 w-3 mr-1" />
        View
      </Button>
    );

    return <div className="flex items-center gap-1">{actions}</div>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Orders Management
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, writers, disciplines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">All Disciplines</option>
            {disciplines.map(discipline => (
              <option key={discipline} value={discipline}>{discipline}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Title & Details</TableHead>
                <TableHead className="font-semibold">Writer</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Deadline</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const deadlineStatus = getDeadlineStatus(order.deadline);
                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {order.id}
                      </TableCell>
                      
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 line-clamp-2">
                            {order.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.discipline} • {order.paperType} • {order.pages} pages
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {order.assignedWriter ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {order.assignedWriter.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{order.assignedWriter}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(order.deadline).toLocaleDateString()}
                          </div>
                          <div className={`text-xs font-medium ${deadlineStatus.color}`}>
                            {deadlineStatus.text}
                            {deadlineStatus.urgent && (
                              <AlertTriangle className="h-3 w-3 inline ml-1" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm font-semibold text-green-600">
                          KES {(order.pages * 350).toLocaleString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {renderActionButtons(order)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                      <p className="text-gray-500">No orders match your current filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
