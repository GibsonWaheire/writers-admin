import { useState, useEffect } from 'react';
import { FileText, Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useOrders } from '../contexts/OrderContext';

interface RealTimeOrderIndicatorProps {
  userRole: 'writer' | 'admin';
  className?: string;
}

export function RealTimeOrderIndicator({ userRole, className = '' }: RealTimeOrderIndicatorProps) {
  const { isConnected, lastUpdate, availableOrdersCount, refreshOrders } = useOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAvailableCount, setLastAvailableCount] = useState(availableOrdersCount);
  const [showNewOrdersAlert, setShowNewOrdersAlert] = useState(false);

  // Track new available orders
  useEffect(() => {
    if (availableOrdersCount > lastAvailableCount && userRole === 'writer') {
      setShowNewOrdersAlert(true);
      // Auto-hide alert after 15 seconds
      setTimeout(() => setShowNewOrdersAlert(false), 15000);
    }
    setLastAvailableCount(availableOrdersCount);
  }, [availableOrdersCount, lastAvailableCount, userRole]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Connection Status */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isConnected ? 'Live Updates' : 'Offline'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {formatTimeAgo(lastUpdate)}
          </div>
        </CardContent>
      </Card>

      {/* New Orders Alert */}
      {showNewOrdersAlert && userRole === 'writer' && (
        <Card className="border-green-200 bg-green-50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-800 text-sm">New Orders Available!</div>
                <div className="text-xs text-green-600">
                  {availableOrdersCount} orders are now available for you to pick up.
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewOrdersAlert(false)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Orders Count for Writers */}
      {userRole === 'writer' && (
        <Card className="border-blue-200 bg-blue-50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-800 text-sm">Available Orders</div>
                <div className="text-xs text-blue-600">
                  {availableOrdersCount} orders waiting to be picked up
                </div>
              </div>
              <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                {availableOrdersCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Warning */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <div className="font-medium text-yellow-800 text-sm">Connection Lost</div>
                <div className="text-xs text-yellow-600">
                  Trying to reconnect... Orders may not be up to date.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        <span>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span>
          Sync: {formatTimeAgo(lastUpdate)}
        </span>
        {userRole === 'writer' && (
          <span>
            Orders: {availableOrdersCount} available
          </span>
        )}
      </div>
    </div>
  );
}
