import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MeritScoreIndicatorProps {
  score: number;
  showLabel?: boolean;
}

export function MeritScoreIndicator({ score, showLabel = true }: MeritScoreIndicatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="h-3 w-3" />;
    if (score >= 75) return <Minus className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getScoreColor(score)} font-semibold flex items-center gap-1`}
    >
      {getScoreIcon(score)}
      {score.toFixed(0)}/100
      {showLabel && <span className="ml-1 text-xs">Merit</span>}
    </Badge>
  );
}



