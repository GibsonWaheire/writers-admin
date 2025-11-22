import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Award,
  Target
} from "lucide-react";

export default function ReviewsPage() {
  const overallStats = [
    {
      title: "Overall Rating",
      value: "4.8",
      icon: Star,
      change: "↑ 0.2 from last month",
      changeType: "positive" as const,
      gradient: true
    },
    {
      title: "Total Reviews",
      value: "47",
      icon: Award,
      change: "+5 this month",
      changeType: "positive" as const
    },
    {
      title: "Grammar Score",
      value: "9.2/10",
      icon: CheckCircle,
      change: "Excellent",
      changeType: "positive" as const
    },
    {
      title: "Deadline Score",
      value: "94%",
      icon: Clock,
      change: "On-time delivery",
      changeType: "positive" as const
    }
  ];

  const detailedScores = [
    { category: "Grammar & Language", score: 92, color: "bg-emerald-500" },
    { category: "Instruction Compliance", score: 89, color: "bg-blue-500" },
    { category: "Deadline Adherence", score: 94, color: "bg-violet-500" },
    { category: "Content Quality", score: 87, color: "bg-orange-500" },
    { category: "Communication", score: 91, color: "bg-teal-500" }
  ];

  const recentReviews = [
    {
      id: "REV-001",
      orderTitle: "Research Paper on Climate Change",
      rating: 5,
      grammarScore: 9.5,
      deadlineScore: 10,
      complianceScore: 9.0,
      feedback: "Excellent work! The research was thorough and well-structured. Perfect adherence to guidelines.",
      date: "2024-01-20",
      reviewer: "Admin Sarah"
    },
    {
      id: "REV-002", 
      orderTitle: "Marketing Analysis Report",
      rating: 4,
      grammarScore: 8.5,
      deadlineScore: 9.0,
      complianceScore: 8.5,
      feedback: "Good quality work with minor improvements needed in data analysis section.",
      date: "2024-01-18",
      reviewer: "Admin Mike"
    },
    {
      id: "REV-003",
      orderTitle: "Literature Review - Psychology",
      rating: 5,
      grammarScore: 9.8,
      deadlineScore: 9.5,
      complianceScore: 9.2,
      feedback: "Outstanding literature review with comprehensive coverage and excellent citations.",
      date: "2024-01-15",
      reviewer: "Admin Jennifer"
    }
  ];

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Reviews & Ratings</h1>
        <p className="text-muted-foreground">Track your performance and feedback from completed orders</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Detailed Scores & Recent Reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {detailedScores.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">{item.score}%</span>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stars === 5 ? 32 : stars === 4 ? 12 : stars === 3 ? 3 : 0;
              const percentage = (count / 47) * 100;
              
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">{review.orderTitle}</h4>
                  <div className="flex items-center gap-2">
                    {getRatingStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      by {review.reviewer} • {review.date}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">{review.rating}.0</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="text-center">
                  <div className="text-sm font-medium text-emerald-600">{review.grammarScore}</div>
                  <div className="text-xs text-muted-foreground">Grammar</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600">{review.deadlineScore}</div>
                  <div className="text-xs text-muted-foreground">Deadline</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-violet-600">{review.complianceScore}</div>
                  <div className="text-xs text-muted-foreground">Compliance</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                "{review.feedback}"
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

