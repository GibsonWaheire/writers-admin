/**
 * Enhanced Order Stat Card Component
 * Modern, interactive stat cards for dashboards
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface OrderStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
    label?: string;
  };
  gradient?: boolean;
  onClick?: () => void;
  actionUrl?: string;
  details?: {
    description: string;
    items: Array<{
      label: string;
      value: string | number;
      icon?: LucideIcon;
    }>;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

export function OrderStatCard({
  title,
  value,
  icon: Icon,
  change,
  gradient = false,
  onClick,
  actionUrl,
  details,
  badge
}: OrderStatCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
        gradient ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {badge && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              gradient 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gray-100'
            }`}>
              <Icon className={`h-6 w-6 ${
                gradient ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                gradient ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {change && (
                <div className={`flex items-center gap-1 text-sm mt-1 ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span>{change.label || change.value}</span>
                </div>
              )}
            </div>
          </div>
          {(onClick || actionUrl) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {details && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">{details.description}</p>
            <div className="space-y-2">
              {details.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                </div>
              ))}
            </div>
            {details.action && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  details.action!.onClick();
                }}
              >
                {details.action.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

