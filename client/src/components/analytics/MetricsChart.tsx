/**
 * Metrics Chart Component
 * Reusable chart component for displaying analytics data
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricData {
  label: string;
  value: number;
  previousValue?: number;
  format?: (value: number) => string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface MetricsChartProps {
  title: string;
  metrics: MetricData[];
  columns?: 2 | 3 | 4;
}

export function MetricsChart({ title, metrics, columns = 3 }: MetricsChartProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  const formatValue = (metric: MetricData): string => {
    if (metric.format) {
      return metric.format(metric.value);
    }
    return metric.value.toLocaleString();
  };

  const calculateTrend = (metric: MetricData): 'up' | 'down' | 'neutral' => {
    if (metric.trend) return metric.trend;
    if (metric.previousValue === undefined) return 'neutral';
    if (metric.value > metric.previousValue) return 'up';
    if (metric.value < metric.previousValue) return 'down';
    return 'neutral';
  };

  const getTrendPercentage = (metric: MetricData): number | null => {
    if (metric.previousValue === undefined || metric.previousValue === 0) return null;
    return Math.round(((metric.value - metric.previousValue) / metric.previousValue) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {metrics.map((metric, index) => {
            const trend = calculateTrend(metric);
            const trendPercent = getTrendPercentage(metric);
            
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  {trend !== 'neutral' && trendPercent !== null && (
                    <div className={`flex items-center gap-1 text-xs ${
                      trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{Math.abs(trendPercent)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatValue(metric)}
                </div>
                {metric.previousValue !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    Previous: {metric.format ? metric.format(metric.previousValue) : metric.previousValue.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

