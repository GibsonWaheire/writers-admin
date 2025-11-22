import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone,
  MessageCircle,
  Ban,
  CheckCircle,
  Eye,
  Star,
  DollarSign,
  FileText,
  Clock,
  Search,
  Filter,
  Award,
  AlertTriangle,
  Globe,
  Calendar,
  Activity,
  GraduationCap
} from "lucide-react";
import { useUsers } from "../contexts/UsersContext";
import { useFinancial } from "../contexts/FinancialContext";
import { useReviews } from "../contexts/ReviewsContext";
import { useOrders } from "../contexts/OrderContext";
import type { Writer, WriterFilter } from "../types/user";

export default function AdminWritersPage() {
  const { 
    writers, 
    writerInvites, 
    writerStats,
    updateWriter, 
    suspendWriter, 
    activateWriter, 
    inviteWriter,
    filterWriters,
    sendWhatsAppMessage,
    sendEmailMessage,
    approveWriterApplication,
    rejectWriterApplication
  } = useUsers();
  const { getWriterFinancials } = useFinancial();
  const { getWriterStats: getReviewStats } = useReviews();
  const { getWriterTotalEarnings } = useOrders();
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  // Close modals on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWriter) setSelectedWriter(null);
        if (showInviteModal) setShowInviteModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedWriter, showInviteModal]);

  const getFilteredWriters = () => {
    const filters: WriterFilter = {};
    
    if (selectedStatus) filters.status = selectedStatus as 'active' | 'suspended' | 'pending' | 'inactive';
    if (selectedSpecialization) filters.specialization = selectedSpecialization;
    if (searchTerm) filters.searchTerm = searchTerm;
    
    let filteredWriters = filterWriters(filters);
    
    // Apply tab filter
    switch (activeTab) {
      case 'active':
        return filteredWriters.filter(w => w.status === 'active');
      case 'suspended':
        return filteredWriters.filter(w => w.status === 'suspended');
      case 'pending':
        return filteredWriters.filter(w => w.status === 'pending');
      default:
        return filteredWriters;
    }
  };

  const filteredWriters = getFilteredWriters();

  const handleSuspendWriter = (writerId: string) => {
    const reason = prompt('Enter reason for suspension:');
    if (reason) {
      suspendWriter(writerId, reason, 'admin-1');
    }
  };

  const handleActivateWriter = (writerId: string) => {
    if (confirm('Are you sure you want to activate this writer?')) {
      activateWriter(writerId);
    }
  };

  const handleSendWhatsApp = (writerId: string) => {
    const message = prompt('Enter WhatsApp message:');
    if (message) {
      sendWhatsAppMessage(writerId, message);
    }
  };

  const handleSendEmail = (writerId: string) => {
    const subject = prompt('Enter email subject:');
    if (subject) {
      const message = prompt('Enter email message:');
      if (message) {
        sendEmailMessage(writerId, subject, message);
      }
    }
  };

  const handleInviteWriter = () => {
    if (inviteEmail) {
      inviteWriter(inviteEmail, invitePhone || undefined, inviteMessage || undefined);
      setInviteEmail('');
      setInvitePhone('');
      setInviteMessage('');
      setShowInviteModal(false);
    }
  };

  const handleApproveWriter = (writerId: string) => {
    const notes = prompt('Add approval notes (optional):');
    approveWriterApplication(writerId, 'admin-1', notes || undefined);
  };

  const handleRejectWriter = (writerId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      const notes = prompt('Add additional notes (optional):');
      rejectWriterApplication(writerId, reason, 'admin-1', notes || undefined);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      application_submitted: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Get unique specializations for filter
  const allSpecializations = Array.from(
    new Set(writers.flatMap(writer => writer.specializations))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Writer Management</h1>
          <p className="text-muted-foreground">
            Manage writer accounts, performance, and platform access controls
          </p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Writer
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Writers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writerStats.totalWriters}</div>
            <p className="text-xs text-muted-foreground">
              {writerStats.newWritersThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writerStats.activeWriters}</div>
            <p className="text-xs text-muted-foreground">
              {writerStats.monthlyActiveWriters} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writerStats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">
              Rating 4.5+ stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writerStats.writerRetentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly retention
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
                placeholder="Search writers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="application_submitted">Applications</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              {allSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedStatus('');
              setSelectedSpecialization('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Writer Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Writers ({writers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({writerStats.activeWriters})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({writerStats.pendingWriters})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({writerStats.suspendedWriters})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredWriters.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWriters.map((writer) => {
                const financials = getWriterFinancials(writer.id);
                const reviewStats = getReviewStats(writer.id);
                const totalEarnings = getWriterTotalEarnings(writer.id);
                
                return (
                  <Card key={writer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {writer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{writer.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadge(writer.status)}>
                              {writer.status}
                            </Badge>
                            {writer.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs font-medium">{writer.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{writer.email}</span>
                          {getVerificationIcon(writer.isEmailVerified)}
                        </div>
                        {writer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{writer.phone}</span>
                            {getVerificationIcon(writer.isPhoneVerified)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{writer.country}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {writer.specializations.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {writer.specializations.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{writer.specializations.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-blue-500" />
                          <span>{writer.completedOrders} orders</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span>{formatCurrency(totalEarnings)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{reviewStats.totalReviews} reviews</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-500" />
                          <span>{new Date(writer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedWriter(writer)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        
                        {writer.status === 'application_submitted' ? (
                          <div className="flex gap-1 flex-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveWriter(writer.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              title="Approve"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectWriter(writer.id)}
                              className="text-red-600 hover:bg-red-50 flex-1"
                              title="Reject"
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : writer.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSuspendWriter(writer.id)}
                            className="text-red-600 hover:bg-red-50"
                            title="Suspend"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        ) : writer.status === 'suspended' ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleActivateWriter(writer.id)}
                            className="bg-green-600 hover:bg-green-700"
                            title="Activate"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>

                      {writer.suspensionReason && (
                        <div className="bg-red-50 border border-red-200 p-2 rounded text-xs">
                          <div className="flex items-center gap-1 text-red-800 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            Suspended
                          </div>
                          <p className="text-red-700 mt-1">{writer.suspensionReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Writers Found</h3>
                <p className="text-gray-500">No writers match your current filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Writer Invitations */}
      {writerInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recent Invitations ({writerInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {writerInvites.slice(0, 5).map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    <div className="text-sm text-gray-600">
                      Invited {new Date(invite.invitedAt).toLocaleDateString()} • 
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={getStatusBadge(invite.status)}>
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Writer Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowInviteModal(false)}
        >
          <Card 
            className="w-full max-w-md bg-white shadow-2xl border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Invite New Writer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <Input
                  type="email"
                  placeholder="writer@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                <Input
                  type="tel"
                  placeholder="+254712345678"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Personal Message (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Welcome to our writing platform..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteWriter}
                  disabled={!inviteEmail}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Writer Detail Modal */}
      {selectedWriter && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedWriter(null)}
        >
          <Card 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {selectedWriter.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  {selectedWriter.name}
                  <Badge className={getStatusBadge(selectedWriter.status)}>
                    {selectedWriter.status}
                  </Badge>
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedWriter(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Writer ID:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedWriter.id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedWriter.email}
                      {getVerificationIcon(selectedWriter.isEmailVerified)}
                    </div>
                    {selectedWriter.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedWriter.phone}
                        {getVerificationIcon(selectedWriter.isPhoneVerified)}
                      </div>
                    )}
                    {selectedWriter.nationalId && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">National ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedWriter.nationalId}</code>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {selectedWriter.country} • {selectedWriter.timezone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(selectedWriter.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Orders Completed:</span>
                      <span className="font-medium">{selectedWriter.completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{selectedWriter.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="font-medium">{selectedWriter.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings:</span>
                      <span className="font-medium">{formatCurrency(getWriterTotalEarnings(selectedWriter.id))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h4 className="font-semibold mb-3">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWriter.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selectedWriter.bio && (
                <div>
                  <h4 className="font-semibold mb-3">Bio & Writing Philosophy</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedWriter.bio}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleSendEmail(selectedWriter.id)}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                {selectedWriter.phone && (
                  <Button 
                    onClick={() => handleSendWhatsApp(selectedWriter.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {selectedWriter.status === 'active' ? (
                  <Button 
                    onClick={() => {
                      handleSuspendWriter(selectedWriter.id);
                      setSelectedWriter(null);
                    }}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      handleActivateWriter(selectedWriter.id);
                      setSelectedWriter(null);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}