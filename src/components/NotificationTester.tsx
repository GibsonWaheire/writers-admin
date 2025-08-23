import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { triggerNotificationByType } from '../utils/notificationHelpers';

export function NotificationTester() {
  const { addNotification, unreadCount, clearAllNotifications } = useNotifications();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const writerTests = [
    { type: 'new_order', label: 'New Order Available', data: { subject: 'Psychology' } },
    { type: 'order_approved', label: 'Order Approved', data: { orderTitle: 'Research Paper' } },
    { type: 'order_rejected', label: 'Order Needs Revision', data: { orderTitle: 'Essay Assignment' } },
    { type: 'payment_received', label: 'Payment Received', data: { amount: '67500' } }
  ];

  const adminTests = [
    { type: 'withdrawal_request', label: 'New Withdrawal Request', data: { writerName: 'John Doe', amount: '45000' } },
    { type: 'low_balance', label: 'Low Platform Balance', data: {} }
  ];

  const tests = user.role === 'writer' ? writerTests : adminTests;

  const handleTriggerNotification = (type: string, data: Record<string, unknown>) => {
    triggerNotificationByType(
      addNotification,
      type as any,
      user.role,
      data
    );
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          🧪 Test Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-40 shadow-xl border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-purple-700">
            🧪 Notification Tester
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          Test notifications for {user.role} role
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {tests.map((test, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleTriggerNotification(test.type, test.data)}
            className="w-full text-xs justify-start h-8"
          >
            {test.label}
          </Button>
        ))}
        
        <div className="pt-2 border-t">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="flex-1 text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
            <div className="text-xs text-gray-500 flex items-center">
              {unreadCount} unread
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
