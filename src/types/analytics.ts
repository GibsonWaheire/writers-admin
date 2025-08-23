export interface WriterPerformance {
  writerId: string;
  writerName: string;
  totalOrders: number;
  completedOrders: number;
  completionRate: number; // Percentage
  averageRating: number;
  totalEarnings: number;
  averageOrderValue: number;
  
  // Time-based metrics
  averageCompletionTime: number; // Days
  onTimeDeliveryRate: number; // Percentage
  
  // Quality metrics
  revisionRate: number; // Percentage
  rejectionRate: number; // Percentage
  clientSatisfactionScore: number;
  
  // Trend data (last 6 months)
  monthlyOrders: MonthlyMetric[];
  monthlyEarnings: MonthlyMetric[];
  monthlyRatings: MonthlyMetric[];
  
  // Recent activity
  recentOrders: Array<{
    orderId: string;
    title: string;
    status: string;
    completedAt?: string;
    rating?: number;
    earnings: number;
  }>;
}

export interface MonthlyMetric {
  month: string; // YYYY-MM format
  value: number;
}

export interface PlatformAnalytics {
  // Overview metrics
  totalOrders: number;
  completedOrders: number;
  activeWriters: number;
  totalRevenue: number;
  
  // Performance metrics
  averageCompletionTime: number;
  averageOrderValue: number;
  clientSatisfactionScore: number;
  writerRetentionRate: number;
  
  // Growth metrics
  monthOverMonthGrowth: {
    orders: number; // Percentage
    revenue: number; // Percentage
    writers: number; // Percentage
  };
  
  // Distribution metrics
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  ordersByDiscipline: Array<{
    discipline: string;
    count: number;
    percentage: number;
  }>;
  
  // Time-series data
  monthlyOrdersData: MonthlyMetric[];
  monthlyRevenueData: MonthlyMetric[];
  monthlyWriterData: MonthlyMetric[];
  
  // Top performers
  topWriters: Array<{
    writerId: string;
    writerName: string;
    completedOrders: number;
    averageRating: number;
    totalEarnings: number;
  }>;
  
  // Recent trends
  recentOrderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
    completions: number;
  }>;
}

export interface AnalyticsFilter {
  dateRange: {
    start: string;
    end: string;
  };
  writerId?: string;
  discipline?: string;
  orderStatus?: string;
  clientId?: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'writer_performance' | 'financial_summary' | 'order_analytics' | 'client_report';
  filters: AnalyticsFilter;
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients: string[]; // Email addresses
  format: 'pdf' | 'excel' | 'csv';
  createdAt: string;
  lastGenerated?: string;
  isActive: boolean;
}
