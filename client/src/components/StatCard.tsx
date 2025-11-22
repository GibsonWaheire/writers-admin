import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "./ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  gradient?: boolean;
  onClick?: () => void;
  details?: {
    description: string;
    items?: Array<{
      label: string;
      value: string;
      icon?: ComponentType<{ className?: string }>;
    }>;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "neutral",
  gradient = false,
  onClick,
  details
}: StatCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getCardColors = () => {
    if (gradient) return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200';
    
    switch (title) {
      case 'Wallet Balance':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-blue-200';
      case 'Total Orders':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200';
      case 'Pending Orders':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-200';
      case 'Completed Orders':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200';
      case 'Average Rating':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200';
      case 'This Month Earnings':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const getIconColors = () => {
    if (gradient) return 'bg-blue-500 text-white shadow-lg';
    
    switch (title) {
      case 'Wallet Balance':
        return 'bg-emerald-500 text-white shadow-lg';
      case 'Total Orders':
        return 'bg-blue-500 text-white shadow-lg';
      case 'Pending Orders':
        return 'bg-amber-500 text-white shadow-lg';
      case 'Completed Orders':
        return 'bg-green-500 text-white shadow-lg';
      case 'Average Rating':
        return 'bg-yellow-500 text-white shadow-lg';
      case 'This Month Earnings':
        return 'bg-purple-500 text-white shadow-lg';
      default:
        return 'bg-gray-500 text-white shadow-lg';
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-emerald-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-4 w-4" />;
      case "negative":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const handleCardClick = () => {
    if (details) {
      setIsDialogOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  const isClickable = details || onClick;

  return (
    <>
      <Card 
        className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 ${getCardColors()} ${
          isClickable ? 'cursor-pointer hover:scale-105' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2 opacity-80">{title}</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${getIconColors()} transition-transform duration-300 hover:scale-110`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          {change && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${getChangeColor()} flex items-center gap-1`}>
                {getChangeIcon()} {change}
              </span>
            </div>
          )}
          {isClickable && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                Click to view details
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {details && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title} Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600">{details.description}</p>
              
              {details.items && (
                <div className="space-y-3">
                  {details.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4 text-gray-500" />}
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {details.action && (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    details.action!.onClick();
                    setIsDialogOpen(false);
                  }}
                >
                  {details.action.label}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
