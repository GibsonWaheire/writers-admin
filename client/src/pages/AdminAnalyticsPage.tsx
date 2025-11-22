import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText,
  Star,
  Clock,
  Target,
  Download,
  Filter,
  Calendar,
  Award,
  DollarSign,
  Activity
} from "lucide-react";
import { useAnalytics } from "../contexts/AnalyticsContext";
import { useUsers } from "../contexts/UsersContext";

export default function AdminAnalyticsPage() {
  const { platformAnalytics, getWriterPerformance, exportAnalytics } = useAnalytics();
  const { writers } = useUsers();
  
  const [activeTab, setActiveTab] = useState("platform");
  const [selectedWriter, setSelectedWriter] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    exportAnalytics(format);
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const selectedWriterPerformance = selectedWriter ? getWriterPerformance(selectedWriter) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics, performance reports, and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformAnalytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{platformAnalytics.monthOverMonthGrowth.orders.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformAnalytics.activeWriters}</div>
            <p className="text-xs text-muted-foreground">
              {platformAnalytics.writerRetentionRate.toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformAnalytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{platformAnalytics.monthOverMonthGrowth.revenue.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformAnalytics.averageCompletionTime.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">
              Average days to complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
          <TabsTrigger value="writers">Writer Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          {/* Order Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Orders by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformAnalytics.ordersByStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{status.count}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(status.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Orders by Discipline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformAnalytics.ordersByDiscipline.slice(0, 6).map((discipline) => (
                    <div key={discipline.discipline} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">{discipline.discipline}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{discipline.count}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(discipline.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Writers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformAnalytics.topWriters.slice(0, 10).map((writer, index) => (
                  <div key={writer.writerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{writer.writerName}</div>
                        <div className="text-sm text-gray-600">
                          {writer.completedOrders} orders completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{writer.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(writer.totalEarnings)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformAnalytics.monthlyOrdersData.map((data) => (
                    <div key={data.month} className="flex justify-between text-sm">
                      <span>{data.month}</span>
                      <span className="font-semibold">{data.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformAnalytics.monthlyRevenueData.map((data) => (
                    <div key={data.month} className="flex justify-between text-sm">
                      <span>{data.month}</span>
                      <span className="font-semibold">{formatCurrency(data.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Writers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformAnalytics.monthlyWriterData.map((data) => (
                    <div key={data.month} className="flex justify-between text-sm">
                      <span>{data.month}</span>
                      <span className="font-semibold">{data.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="writers" className="space-y-4">
          {/* Writer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Writer Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedWriter}
                  onChange={(e) => setSelectedWriter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select a writer to analyze</option>
                  {writers.map(writer => (
                    <option key={writer.id} value={writer.id}>{writer.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {selectedWriterPerformance ? (
            <>
              {/* Writer Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <FileText className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedWriterPerformance.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedWriterPerformance.completedOrders} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <Target className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(selectedWriterPerformance.completionRate)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(selectedWriterPerformance.onTimeDeliveryRate)} on-time delivery
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedWriterPerformance.averageRating.toFixed(1)}</div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.round(selectedWriterPerformance.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedWriterPerformance.totalEarnings)}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(selectedWriterPerformance.averageOrderValue)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quality & Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(100 - selectedWriterPerformance.revisionRate)}
                      </div>
                      <div className="text-sm text-green-700 font-medium">First-Time Approval</div>
                      <div className="text-xs text-green-600 mt-1">
                        {formatPercentage(selectedWriterPerformance.revisionRate)} revision rate
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedWriterPerformance.averageCompletionTime.toFixed(1)}d
                      </div>
                      <div className="text-sm text-blue-700 font-medium">Avg Completion Time</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {formatPercentage(selectedWriterPerformance.onTimeDeliveryRate)} on-time
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedWriterPerformance.clientSatisfactionScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-purple-700 font-medium">Client Satisfaction</div>
                      <div className="text-xs text-purple-600 mt-1">
                        Out of 5.0 stars
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedWriterPerformance.recentOrders.slice(0, 8).map((order) => (
                      <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{order.title}</div>
                          <div className="text-xs text-gray-600">
                            {order.status} • {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'In Progress'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{formatCurrency(order.earnings)}</div>
                          {order.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs">{order.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Writer</h3>
                <p className="text-gray-500">Choose a writer from the dropdown above to view their detailed performance analytics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">Order Growth</div>
                      <div className="text-sm text-green-600">Month over month</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +{platformAnalytics.monthOverMonthGrowth.orders.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-800">Revenue Growth</div>
                      <div className="text-sm text-blue-600">Month over month</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      +{platformAnalytics.monthOverMonthGrowth.revenue.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-purple-800">Writer Growth</div>
                      <div className="text-sm text-purple-600">Month over month</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      +{platformAnalytics.monthOverMonthGrowth.writers.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="font-semibold">{formatCurrency(platformAnalytics.averageOrderValue)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Client Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{platformAnalytics.clientSatisfactionScore.toFixed(1)}/5.0</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.round(platformAnalytics.clientSatisfactionScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Writer Retention Rate</span>
                    <span className="font-semibold">{formatPercentage(platformAnalytics.writerRetentionRate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Completion Rate</span>
                    <span className="font-semibold">
                      {formatPercentage((platformAnalytics.completedOrders / platformAnalytics.totalOrders) * 100)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Completion Time</span>
                    <span className="font-semibold">{platformAnalytics.averageCompletionTime.toFixed(1)} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
