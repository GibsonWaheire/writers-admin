import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useNotifications } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getUnreadNotifications
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? getUnreadNotifications() 
    : notifications;



  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter and Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs px-3 py-1"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="text-xs px-3 py-1"
                >
                  Unread ({unreadCount})
                </Button>
              </div>

              <div className="flex space-x-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="p-1 hover:bg-gray-100"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="p-1 hover:bg-gray-100 hover:text-red-600"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors cursor-pointer relative",
                      !notification.isRead && "bg-blue-50/30"
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    {/* Priority Indicator */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        notification.priority === 'urgent' && "bg-red-500",
                        notification.priority === 'high' && "bg-orange-500",
                        notification.priority === 'medium' && "bg-blue-500",
                        notification.priority === 'low' && "bg-gray-400"
                      )}
                    />

                    <div className="flex items-start space-x-3 pl-3">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <span className="text-xl">{notification.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-medium text-gray-900",
                              !notification.isRead && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && notification.actionLabel && (
                          <Link
                            to={notification.actionUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {notification.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-gray-600 hover:text-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
