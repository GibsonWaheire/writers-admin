import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, FileText, Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useOrders } from '../contexts/OrderContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import type { Notification } from '../types/notification';

interface NotificationDropdownProps {
  userRole: 'writer' | 'admin';
}

export function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Get context values - these will throw errors if contexts are not available
  const notificationContext = useNotifications();
  const orderContext = useOrders();
  
  // Extract values with safe defaults
  const allNotifications = notificationContext?.notifications || [];
  
  // Filter notifications by userId - only show notifications for the current user
  const notifications = user 
    ? allNotifications.filter(n => n.userId === user.id || n.userId === user.id.toString())
    : [];
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markAsRead = notificationContext?.markAsRead || (async () => {});
  const isConnected = orderContext?.isConnected ?? true;
  const lastUpdate = orderContext?.lastUpdate || new Date().toISOString();
  const availableOrdersCount = orderContext?.availableOrdersCount || 0;

  const [lastAvailableCount, setLastAvailableCount] = useState(availableOrdersCount);
  const [newOrdersAlert, setNewOrdersAlert] = useState(false);

  // Track new available orders
  useEffect(() => {
    if (availableOrdersCount > lastAvailableCount && userRole === 'writer') {
      setNewOrdersAlert(true);
      // Auto-hide alert after 10 seconds
      setTimeout(() => setNewOrdersAlert(false), 10000);
    }
    setLastAvailableCount(availableOrdersCount);
  }, [availableOrdersCount, lastAvailableCount, userRole]);

  const hasNewOrders = newOrdersAlert && userRole === 'writer';

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Unknown time';
    }
  };

  // Safely get notification timestamp
  const getNotificationTimestamp = (notification: Notification) => {
    return notification.createdAt || new Date().toISOString();
  };

  return (
    <div className="relative">
      {/* Connection Status Badge */}
      <div className="absolute -top-1 -right-1">
        <Badge 
          variant={isConnected ? "default" : "destructive"}
          className="h-5 w-5 p-0 flex items-center justify-center"
        >
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
        </Badge>
      </div>

      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="relative h-10 w-10 rounded-full hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Notifications</span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Wifi className="h-3 w-3" />
                      <span>Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <WifiOff className="h-3 w-3" />
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </CardTitle>
              <div className="text-xs text-gray-500">
                Last updated: {formatTimeAgo(lastUpdate)}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">

              {/* Connection Status */}
              {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">Connection Lost</div>
                      <div className="text-sm text-yellow-600">
                        Trying to reconnect... Orders may not be up to date.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.type === 'order_assigned' && <FileText className="h-4 w-4 text-blue-600" />}
                        {notification.type === 'order_completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {notification.type === 'order_approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {notification.type === 'payment_received' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {notification.type === 'system_update' && <Bell className="h-4 w-4 text-gray-600" />}
                        {notification.type === 'assignment_confirmed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {notification.type === 'assignment_declined' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {notification.type === 'order_rejected' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">
                          {notification.title || 'Notification'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {notification.message || 'No message content'}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(getNotificationTimestamp(notification))}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <div>No notifications yet</div>
                  <div className="text-xs">We'll notify you when something important happens</div>
                </div>
              )}

              {/* View All Link */}
              {notifications && notifications.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View all notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}