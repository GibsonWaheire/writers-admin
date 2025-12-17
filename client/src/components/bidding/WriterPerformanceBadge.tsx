import { Badge } from '../ui/badge';
import { Star, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import type { WriterPerformance } from '../../utils/bidHelpers';

interface WriterPerformanceBadgeProps {
  performance: WriterPerformance;
  compact?: boolean;
}

export function WriterPerformanceBadge({ performance, compact = false }: WriterPerformanceBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
          <Star className="h-3 w-3 mr-1" />
          {performance.averageRating.toFixed(1)}
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {Math.round(performance.completionRate)}%
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {Math.round(performance.onTimeDeliveryRate)}%
        </Badge>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-600" />
        <span className="font-medium">{performance.averageRating.toFixed(1)}</span>
        <span className="text-gray-500">Rating</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span className="font-medium">{Math.round(performance.completionRate)}%</span>
        <span className="text-gray-500">Complete</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-blue-600" />
        <span className="font-medium">{Math.round(performance.onTimeDeliveryRate)}%</span>
        <span className="text-gray-500">On-Time</span>
      </div>
      <div className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3 text-orange-600" />
        <span className="font-medium">{Math.round(performance.revisionRate)}%</span>
        <span className="text-gray-500">Revision</span>
      </div>
    </div>
  );
}



