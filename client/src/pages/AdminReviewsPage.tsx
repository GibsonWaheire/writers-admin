import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Star, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  TrendingUp,
  Users,
  MessageSquare,
  Award
} from "lucide-react";
import { useReviews } from "../contexts/ReviewsContext";
import { useOrders } from "../contexts/OrderContext";
import type { Review, ReviewFilter } from "../types/review";

export default function AdminReviewsPage() {
  const { reviews, reviewStats, updateReview, deleteReview, assignReviewToOrder, filterReviews } = useReviews();
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter reviews based on current filters
  const getFilteredReviews = () => {
    const filters: ReviewFilter = {};
    
    if (selectedRating) filters.rating = selectedRating;
    if (selectedStatus) filters.status = selectedStatus as 'pending' | 'published' | 'hidden';
    
    let filteredReviews = filterReviews(filters);
    
    // Apply search filter
    if (searchTerm) {
      filteredReviews = filteredReviews.filter(review => 
        review.writerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'pending':
        return filteredReviews.filter(r => r.status === 'pending');
      case 'published':
        return filteredReviews.filter(r => r.status === 'published');
      case 'hidden':
        return filteredReviews.filter(r => r.status === 'hidden');
      default:
        return filteredReviews;
    }
  };

  const filteredReviews = getFilteredReviews();

  const handleStatusChange = (reviewId: string, status: 'pending' | 'published' | 'hidden') => {
    updateReview(reviewId, { status });
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800", 
      hidden: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const completedOrdersWithoutReviews = orders.filter(order => 
    order.status === 'Completed' && 
    !reviews.some(review => review.orderId === order.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews & Ratings</h1>
          <p className="text-muted-foreground">
            Monitor client feedback, ratings, and quality metrics for all writers
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Request Review
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {reviewStats.recentReviews.length} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
            <div className="flex items-center">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.topPerformers.length}</div>
            <p className="text-xs text-muted-foreground">
              Writers with 4.5+ rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need admin action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedRating || ''}
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : undefined)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedRating(undefined);
              setSelectedStatus('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({reviews.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="published">Published ({reviews.filter(r => r.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="hidden">Hidden ({reviews.filter(r => r.status === 'hidden').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                            <span className="ml-2 font-semibold">{review.rating}/5</span>
                          </div>
                          <Badge className={getStatusBadge(review.status)}>
                            {review.status}
                          </Badge>
                          {review.isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <strong>Writer:</strong> {review.writerName}
                          </div>
                          <div>
                            <strong>Client:</strong> {review.clientName}
                          </div>
                          <div>
                            <strong>Order:</strong> {review.orderTitle}
                          </div>
                        </div>

                        {review.comment && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-gray-700 italic">"{review.comment}"</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{review.orderPages} pages</span>
                          <span>KES {review.orderValue.toLocaleString()}</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {review.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(review.id, 'published')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Publish
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(review.id, 'hidden')}
                            >
                              Hide
                            </Button>
                          </>
                        )}
                        
                        {review.status === 'published' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(review.id, 'hidden')}
                          >
                            Hide
                          </Button>
                        )}
                        
                        {review.status === 'hidden' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(review.id, 'published')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Publish
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Category Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t">
                      {review.categories.map((category) => (
                        <div key={category.category} className="text-center">
                          <div className="text-xs text-gray-500 mb-1 capitalize">
                            {category.category}
                          </div>
                          <div className="flex justify-center">
                            {renderStars(category.rating)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Found</h3>
                <p className="text-gray-500">No reviews match your current filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Orders without reviews */}
      {completedOrdersWithoutReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Orders Without Reviews ({completedOrdersWithoutReviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedOrdersWithoutReviews.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{order.title}</div>
                    <div className="text-sm text-gray-600">
                      Writer: {order.assignedWriter} • Completed: {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => assignReviewToOrder(order.id, { name: 'Client', id: 'client-1' })}
                  >
                    Request Review
                  </Button>
                </div>
              ))}
              {completedOrdersWithoutReviews.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  And {completedOrdersWithoutReviews.length - 5} more orders...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
