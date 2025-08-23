import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import type { AssignmentHistory } from '../types/notification';

interface AssignmentAnalyticsProps {
  assignments: AssignmentHistory[];
  className?: string;
}

interface AssignmentMetrics {
  totalAssignments: number;
  confirmationRate: number;
  averageConfirmationTime: number; // in minutes
  reassignmentRate: number;
  completionRate: number;
  writerSatisfactionScore: number;
  autoConfirmRate: number;
  declineRate: number;
  urgentAssignments: number;
  averageResponseTime: number;
}

export function AssignmentAnalytics({ assignments, className = '' }: AssignmentAnalyticsProps) {
  
  const calculateMetrics = (): AssignmentMetrics => {
    if (assignments.length === 0) {
      return {
        totalAssignments: 0,
        confirmationRate: 0,
        averageConfirmationTime: 0,
        reassignmentRate: 0,
        completionRate: 0,
        writerSatisfactionScore: 0,
        autoConfirmRate: 0,
        declineRate: 0,
        urgentAssignments: 0,
        averageResponseTime: 0
      };
    }

    const confirmedAssignments = assignments.filter(a => a.status === 'confirmed');
    const declinedAssignments = assignments.filter(a => a.status === 'declined');
    const autoConfirmedAssignments = assignments.filter(a => a.status === 'auto_confirmed');
    const reassignedAssignments = assignments.filter(a => a.status === 'reassigned');
    const urgentAssignments = assignments.filter(a => a.priority === 'urgent');

    // Calculate confirmation time for confirmed assignments
    const confirmationTimes = confirmedAssignments
      .filter(a => a.confirmedAt)
      .map(a => {
        const assigned = new Date(a.assignedAt);
        const confirmed = new Date(a.confirmedAt!);
        return (confirmed.getTime() - assigned.getTime()) / (1000 * 60); // minutes
      });

    const averageConfirmationTime = confirmationTimes.length > 0 
      ? confirmationTimes.reduce((sum, time) => sum + time, 0) / confirmationTimes.length
      : 0;

    // Calculate response time (time to any action)
    const responseTimes = assignments
      .filter(a => a.confirmedAt || a.declinedAt)
      .map(a => {
        const assigned = new Date(a.assignedAt);
        const responded = new Date((a.confirmedAt || a.declinedAt)!);
        return (responded.getTime() - assigned.getTime()) / (1000 * 60); // minutes
      });

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      totalAssignments: assignments.length,
      confirmationRate: (confirmedAssignments.length / assignments.length) * 100,
      averageConfirmationTime,
      reassignmentRate: (reassignedAssignments.length / assignments.length) * 100,
      completionRate: 85, // This would be calculated from actual order completions
      writerSatisfactionScore: 4.2, // This would come from writer feedback
      autoConfirmRate: (autoConfirmedAssignments.length / assignments.length) * 100,
      declineRate: (declinedAssignments.length / assignments.length) * 100,
      urgentAssignments: urgentAssignments.length,
      averageResponseTime
    };
  };

  const metrics = calculateMetrics();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getChangeIndicator = (current: number, target: number) => {
    const diff = current - target;
    const isPositive = diff > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">{Math.abs(diff).toFixed(1)}%</span>
      </div>
    );
  };

  const metricCards = [
    {
      title: 'Total Assignments',
      value: metrics.totalAssignments.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: getChangeIndicator(metrics.totalAssignments, 45) // vs target of 45
    },
    {
      title: 'Confirmation Rate',
      value: `${metrics.confirmationRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: getChangeIndicator(metrics.confirmationRate, 85) // vs target of 85%
    },
    {
      title: 'Avg Confirmation Time',
      value: formatTime(metrics.averageConfirmationTime),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: getChangeIndicator(120 - metrics.averageConfirmationTime, 120) // vs target of 2 hours
    },
    {
      title: 'Decline Rate',
      value: `${metrics.declineRate.toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: getChangeIndicator(10 - metrics.declineRate, 10) // vs target of <10%
    },
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: getChangeIndicator(metrics.completionRate, 90) // vs target of 90%
    },
    {
      title: 'Writer Satisfaction',
      value: `${metrics.writerSatisfactionScore.toFixed(1)}/5`,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: getChangeIndicator(metrics.writerSatisfactionScore * 20, 80) // vs target of 4.0/5
    }
  ];

  const recentTrends = [
    {
      label: 'Urgent Assignments',
      value: metrics.urgentAssignments,
      total: metrics.totalAssignments,
      color: 'bg-red-500'
    },
    {
      label: 'Auto-Confirmed',
      value: Math.round(metrics.totalAssignments * (metrics.autoConfirmRate / 100)),
      total: metrics.totalAssignments,
      color: 'bg-orange-500'
    },
    {
      label: 'Manual Confirmed',
      value: Math.round(metrics.totalAssignments * (metrics.confirmationRate / 100)),
      total: metrics.totalAssignments,
      color: 'bg-green-500'
    },
    {
      label: 'Declined',
      value: Math.round(metrics.totalAssignments * (metrics.declineRate / 100)),
      total: metrics.totalAssignments,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Analytics</h2>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Last 30 days
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <div className="mt-2">
                      {metric.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assignment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assignment Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrends.map((trend, index) => {
              const percentage = metrics.totalAssignments > 0 
                ? (trend.value / trend.total) * 100 
                : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${trend.color}`} />
                    <span className="text-sm font-medium">{trend.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${trend.color}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {trend.value}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {metrics.confirmationRate < 80 && (
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Confirmation rate is below target (80%). Consider improving assignment clarity or writer communication.
                </span>
              </div>
            )}
            
            {metrics.averageConfirmationTime > 120 && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>
                  Average confirmation time is high ({formatTime(metrics.averageConfirmationTime)}). Consider reducing auto-confirm deadline or improving notifications.
                </span>
              </div>
            )}
            
            {metrics.declineRate > 15 && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                <TrendingDown className="h-4 w-4" />
                <span>
                  High decline rate ({metrics.declineRate.toFixed(1)}%). Review assignment criteria and writer matching algorithm.
                </span>
              </div>
            )}
            
            {metrics.confirmationRate >= 85 && metrics.averageConfirmationTime <= 90 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Excellent assignment performance! High confirmation rate with quick response times.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
