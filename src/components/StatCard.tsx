import { Card, CardContent } from "./ui/card";
import type { ComponentType } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  gradient?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "neutral",
  gradient = false 
}: StatCardProps) {
  const getCardColors = () => {
    if (gradient) return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200';
    
    switch (title) {
      case 'Wallet Balance':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200';
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
        return "↗";
      case "negative":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 ${getCardColors()}`}>
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
            <span className={`text-sm font-semibold ${getChangeColor()}`}>
              {getChangeIcon()} {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
