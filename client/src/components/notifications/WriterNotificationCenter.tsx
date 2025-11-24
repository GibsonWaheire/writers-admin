import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  XCircle,
  DollarSign,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Clock
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';

export function WriterNotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Filter notifications for current writer
  const writerNotifications = useMemo(() => {
    if (!user) return [];
    
    return notifications.filter(n => 
      n.userId === user.id || n.userId === user.id.toString()
    );
  }, [notifications, user]);

  // Filter and search
  const filteredNotifications = useMemo(() => {
    let filtered = [...writerNotifications];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    }

    // Sort by priority and date (unread first, then by date)
    return filtered.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [writerNotifications, filterType, filterPriority, searchTerm]);

  const unreadFiltered = filteredNotifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_assigned':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'order_approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'order_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'revision':
        return <RefreshCw className="h-5 w-5 text-orange-600" />;
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      urgent: { bg: 'bg-red-100 text-red-800 border-red-300', label: 'Urgent' },
      high: { bg: 'bg-orange-100 text-orange-800 border-orange-300', label: 'High' },
      medium: { bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium' },
      low: { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Low' }
    };
    const config = configs[priority as keyof typeof configs] || configs.medium;
    return (
      <Badge variant="outline" className={`${config.bg} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="order_assigned">Order Assigned</option>
              <option value="order_approved">Order Approved</option>
              <option value="order_rejected">Order Rejected</option>
              <option value="revision">Revision</option>
              <option value="payment_received">Payment</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value === 'unread' ? 'all' : e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                notification.isRead 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-300 border-l-4'
              } ${notification.priority === 'urgent' ? 'ring-2 ring-red-200' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {getPriorityBadge(notification.priority)}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                      {notification.actionUrl && (
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          {notification.actionLabel || 'View Details'} →
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No Notifications</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                  ? "No notifications match your filters."
                  : "You're all caught up! No new notifications."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


