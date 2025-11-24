import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { WriterPerformanceBadge } from './WriterPerformanceBadge';
import { MeritScoreIndicator } from './MeritScoreIndicator';
import { getTimeAgo } from '../../utils/bidHelpers';
import type { BidWithWriter } from '../../utils/bidHelpers';

interface BidCardProps {
  bidWithWriter: BidWithWriter;
  onApprove: (orderId: string, bidId: string) => void;
  onDecline: (orderId: string, bidId: string) => void;
  onViewWriter?: (writerId: string) => void;
}

export function BidCard({ 
  bidWithWriter, 
  onApprove, 
  onDecline,
  onViewWriter 
}: BidCardProps) {
  const { bid, order, writer, performance, meritScore } = bidWithWriter;

  // Default performance for new writers without history
  const defaultPerformance = {
    completionRate: 100,
    onTimeDeliveryRate: 100,
    revisionRate: 0,
    rejectionRate: 0,
    averageRating: 4.0,
    totalOrders: 0,
    completedOrders: 0,
    totalEarnings: 0
  };

  const displayPerformance = performance || defaultPerformance;
  const displayMeritScore = meritScore || 50; // Default merit score for new writers

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Writer Info & Performance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="font-semibold text-gray-900 truncate">
                {writer?.name || bid.writerName || 'Unknown Writer'}
              </span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs flex-shrink-0">
                Pending
              </Badge>
              <MeritScoreIndicator score={displayMeritScore} showLabel={false} />
            </div>

            {/* Performance Metrics */}
            <div className="mb-3">
              <WriterPerformanceBadge performance={displayPerformance} compact />
            </div>

            {/* Additional Stats */}
            <div className="text-xs text-gray-600 space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Bid placed: {getTimeAgo(bid.bidAt)}</span>
              </div>
              {displayPerformance.totalOrders > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{displayPerformance.completedOrders} completed orders</span>
                  </div>
                  {displayPerformance.totalEarnings > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">
                        KES {displayPerformance.totalEarnings.toLocaleString()} earned
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                    New Writer
                  </Badge>
                </div>
              )}
            </div>

            {/* Bid Notes */}
            {(bid.bidNotes || bid.notes) && (
              <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs">
                <span className="font-medium text-gray-700">Bid Notes:</span>
                <p className="text-gray-600 mt-1">{bid.bidNotes || bid.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {onViewWriter && writer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewWriter(writer.id)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Profile
              </Button>
            )}
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={() => onApprove(order.id, bid.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 text-xs"
              onClick={() => onDecline(order.id, bid.id)}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
