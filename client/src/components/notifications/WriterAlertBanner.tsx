import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  X, 
  ArrowRight,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';

interface WriterAlertBannerProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

export function WriterAlertBanner({ 
  notification, 
  onDismiss,
  onAction 
}: WriterAlertBannerProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss urgent notifications after 30 seconds
    if (notification.priority === 'urgent') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.priority, onDismiss]);

  if (!isVisible) return null;

  const getAlertConfig = () => {
    switch (notification.type) {
      case 'order_rejected':
        return {
          bg: 'bg-red-50 border-red-300',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'revision':
        return {
          bg: 'bg-orange-50 border-orange-300',
          icon: <RefreshCw className="h-5 w-5 text-orange-600" />,
          titleColor: 'text-orange-900',
          messageColor: 'text-orange-800',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white'
        };
      default:
        return {
          bg: 'bg-yellow-50 border-yellow-300',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
    }
  };

  const config = getAlertConfig();
  const isUrgent = notification.priority === 'urgent' || notification.priority === 'high';

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <Card className={`${config.bg} border-l-4 shadow-lg ${isUrgent ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-bold text-sm ${config.titleColor}`}>
                {notification.title}
              </h4>
              {isUrgent && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            
            <p className={`text-sm ${config.messageColor} mb-3 line-clamp-2`}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-2">
              {notification.actionUrl && (
                <Button
                  size="sm"
                  className={config.buttonClass}
                  onClick={handleAction}
                >
                  {notification.actionLabel || 'View Details'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onDismiss(notification.id), 300);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(notification.id), 300);
            }}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

