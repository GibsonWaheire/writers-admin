import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { RequestRevisionModal } from './RequestRevisionModal';
import { SubmitToAdminModal } from './SubmitToAdminModal';
import { SubmitRevisionModal } from './SubmitRevisionModal';
import { UploadOrderFilesModal } from './UploadOrderFilesModal';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  FileText, 
  Download, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  FileType,
  Upload
} from 'lucide-react';
import type { Order, OrderStatus, WriterConfirmation, WriterQuestion } from '../types/order';
import { getWriterIdForUser } from '../utils/writer';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  userRole: 'writer' | 'admin';
  onAction: (action: string, orderId: string, additionalData?: Record<string, unknown>) => void;
  activeOrdersCount?: number;
}

export function OrderViewModal({ 
  isOpen, 
  onClose, 
  order, 
  userRole, 
  onAction, 
  activeOrdersCount = 0 
}: OrderViewModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionSubmitModal, setShowRevisionSubmitModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      'Draft': { variant: 'outline' as const, color: 'text-gray-600', bg: 'bg-gray-50' },
      'Available': { variant: 'outline' as const, color: 'text-blue-600', bg: 'bg-blue-50' },
      'Awaiting Approval': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50' },
      'Assigned': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50' },
      'In Progress': { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-50' },
      'Submitted': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50' },
      'Approved': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50' },
      'Rejected': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' },
      'Revision': { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-50' },
      'Resubmitted': { variant: 'secondary' as const, color: 'text-purple-600', bg: 'bg-purple-50' },
      'Completed': { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-50' },
      'Late': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' },
      'Auto-Reassigned': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' },
      'Cancelled': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' },
      'On Hold': { variant: 'secondary' as const, color: 'text-gray-600', bg: 'bg-gray-50' },
      'Disputed': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' },
      'Refunded': { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-50' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <Badge variant={config.variant} className={`${config.color} ${config.bg} border-0`}>
        {status}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDeadlineStatus = () => {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const renderWriterActions = () => {
    if (order.status === 'Available') {
      if (activeOrdersCount < 3) {
        return (
          <Button 
            onClick={() => setShowConfirmationModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Bid on Order
          </Button>
        );
      } else {
        return (
          <Button 
            onClick={() => onAction('request_approval', order.id, { notes })}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Approval
          </Button>
        );
      }
    }

    if (order.status === 'In Progress') {
      // Check if files have been uploaded
      const hasUploadedFiles = order.uploadedFiles && order.uploadedFiles.length > 0;
      
      if (!hasUploadedFiles) {
        // Step 1: Upload files first
        return (
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Order Files
          </Button>
        );
      } else {
        // Step 2: Submit work after files are uploaded
        return (
          <Button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Work
          </Button>
        );
      }
    }

    if (order.status === 'Assigned') {
      return (
        <Button 
            onClick={() => onAction('confirm', order.id, { notes })}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Confirm Order
          </Button>
      );
    }

    if (order.status === 'Revision') {
      // Check if revision files have been uploaded (files uploaded after revision was requested)
      const revisionRequestedAt = order.adminReviewedAt || order.updatedAt;
      const hasRevisionFiles = order.uploadedFiles && order.uploadedFiles.length > 0 && 
        order.uploadedFiles.some(f => new Date(f.uploadedAt) > new Date(revisionRequestedAt || 0));
      
      if (!hasRevisionFiles) {
        // Step 1: Upload revision files first
        return (
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Revision Files
          </Button>
        );
      } else {
        // Step 2: Submit revision after files are uploaded
        return (
          <Button 
            onClick={() => setShowRevisionSubmitModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Revision
          </Button>
        );
      }
    }

    if (order.status === 'Approved') {
      return (
        <Button 
          onClick={() => onAction('complete', order.id, { notes })}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Mark Complete
        </Button>
      );
    }

    return null;
  };

  const handleOrderConfirm = (confirmation: WriterConfirmation, questions: WriterQuestion[]) => {
    const writerId = getWriterIdForUser(user?.id) || confirmation.writerId || 'writer-1';
    
    // Use 'bid' action to submit a bid for admin approval
    onAction('bid', order.id, { 
      confirmation, 
      questions,
      writerId: writerId,
      writerName: user?.name || 'Writer'
    });
    // Close the confirmation modal
    setShowConfirmationModal(false);
  };

  const renderAdminActions = () => {
    if (order.status === 'Awaiting Approval') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => onAction('approve_bid', order.id, { adminId: user?.id, notes })}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Bid
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onAction('decline_bid', order.id, { notes })}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline Bid
          </Button>
        </div>
      );
    }

    if (order.status === 'Available') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => onAction('assign', order.id, { notes })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <User className="h-4 w-4 mr-2" />
            Assign Order
          </Button>
        </div>
      );
    }

    // Orders picked by writers go directly to "Assigned" status
    // Admin can approve them when work is submitted, or make them available if needed
    if (order.pickedBy === 'writer' && order.status === 'Assigned') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => onAction('make_available', order.id, { reason: 'Admin made order available', notes })}
            variant="outline"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Make Available
          </Button>
        </div>
      );
    }

    if (order.status === 'Submitted') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => onAction('approve', order.id, { notes })}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button 
            onClick={() => setShowRevisionModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Revision
          </Button>
          <Button 
            onClick={() => onAction('reject', order.id, { notes })}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      );
    }

    if (order.status === 'In Progress') {
      // Check if order has less than 12 hours remaining
      const deadline = new Date(order.deadline);
      const now = new Date();
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      const canReassign = hoursRemaining >= 12;
      
      return (
        <div className="flex gap-2">
          {canReassign ? (
          <Button 
            onClick={() => onAction('reassign', order.id, { notes })}
            variant="outline"
          >
            <User className="h-4 w-4 mr-2" />
            Reassign
          </Button>
          ) : (
            <Button 
              variant="outline"
              disabled
              title="Orders with less than 12 hours remaining cannot be reassigned"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Cannot Reassign ({hoursRemaining.toFixed(1)}h remaining)
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order: ${order.title}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            {userRole === 'writer' && (
              <textarea
                placeholder="Add notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
            )}
            {userRole === 'admin' && (
              <textarea
                placeholder="Add admin notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
            )}
          </div>
          <div className="flex gap-2 ml-4">
            {userRole === 'writer' ? renderWriterActions() : renderAdminActions()}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{order.title}</h3>
            <p className="text-gray-600">{order.description}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(order.status)}
            <div className="mt-2 text-sm text-gray-500">
              Order ID: {order.id}
            </div>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 bg-blue-50/30 p-4 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discipline:</span>
                    <span className="font-medium">{order.discipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paper Type:</span>
                    <span className="font-medium">{order.paperType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Citation Format:</span>
                    <span className="font-medium">{order.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">{order.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Words:</span>
                    <span className="font-medium">{order.words.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Total Price:</span>
                    <span className="font-bold text-green-600">KES {(order.pages * 350).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">CPP:</span>
                    <span className="font-medium text-blue-600">KES 350</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDeadlineStatus().bg} ${getDeadlineStatus().color}`}>
                      {getDeadlineStatus().text}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {order.additionalInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.additionalInstructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Revision Explanation - Show when order is in Revision status */}
            {order.status === 'Revision' && order.revisionExplanation && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <AlertTriangle className="h-5 w-5" />
                    Revision Required
                    {order.revisionCount && order.revisionCount > 0 && (
                      <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
                        Revision #{order.revisionCount} • Score: {order.revisionScore || 10}/10
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">What Needs to be Revised:</h4>
                      <p className="text-gray-800 whitespace-pre-wrap">{order.revisionExplanation}</p>
                    </div>
                    {order.adminReviewNotes && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">Additional Notes:</h4>
                        <p className="text-gray-700">{order.adminReviewNotes}</p>
                      </div>
                    )}
                    {order.revisionRequests && order.revisionRequests.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">Revision History:</h4>
                        <div className="space-y-2">
                          {order.revisionRequests.map((req) => (
                            <div key={req.id} className="bg-white p-3 rounded border border-orange-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {new Date(req.requestedAt).toLocaleDateString()}
                                </span>
                                <Badge variant={req.status === 'resolved' ? 'default' : 'destructive'} className="text-xs">
                                  {req.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{req.explanation || req.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4 bg-green-50/30 p-4 rounded-lg">
            <Card>
              <CardHeader>
                <CardTitle>Order Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Academic Requirements</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <FileType className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{order.format || 'Not specified'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Pages:</span>
                        <span className="font-medium">{order.pages} pages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Words:</span>
                        <span className="font-medium">{order.words.toLocaleString()} words</span>
                      </li>
                      {order.subject && (
                        <li className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{order.subject}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Subject Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Discipline:</span>
                        <span className="font-medium">{order.discipline}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{order.paperType || 'Not specified'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {order.requirements && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Detailed Requirements</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                      {order.requirements}
                    </p>
                  </div>
                )}
                
                {order.additionalInstructions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Additional Instructions</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                      {order.additionalInstructions}
                    </p>
                  </div>
                )}
                
                {order.attachments && order.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Requirement Attachments</h4>
                    <div className="space-y-2">
                      {order.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{attachment.originalName}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="ml-auto"
                            onClick={() => {
                              if (attachment.url) {
                                const link = document.createElement('a');
                                link.href = attachment.url;
                                link.download = attachment.originalName || attachment.filename;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4 bg-purple-50/30 p-4 rounded-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(order.clientMessages || []).length > 0 ? (
                  <div className="space-y-4">
                    {(order.clientMessages || []).map((message) => (
                      <div key={message.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{message.sender}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">Attachments:</span>
                            <div className="flex gap-2 mt-1">
                              {message.attachments.map((attachment, index) => (
                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {attachment}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 bg-orange-50/30 p-4 rounded-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Uploaded Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(order.uploadedFiles || []).length > 0 ? (
                  <div className="space-y-3">
                    {(order.uploadedFiles || []).map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{file.originalName}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (file.url) {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = file.originalName || file.filename;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        order={order}
        onConfirm={handleOrderConfirm}
      />
      
      {userRole === 'admin' && (
        <RequestRevisionModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          order={order}
          onRequestRevision={async (orderId, explanation, additionalNotes) => {
            await onAction('request_revision', orderId, { 
              explanation, 
              notes: additionalNotes,
              adminId: user?.id || 'admin'
            });
            setShowRevisionModal(false);
          }}
        />
      )}
      
      {userRole === 'writer' && (
        <>
          <UploadOrderFilesModal
            order={order}
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={async (files) => {
              await onAction('upload_files', order.id, { files });
              setShowUploadModal(false);
            }}
          />
          {order.status === 'Revision' ? (
            <SubmitRevisionModal
              order={order}
              isOpen={showRevisionSubmitModal}
              onClose={() => setShowRevisionSubmitModal(false)}
              onSubmit={async (submission) => {
                await onAction('resubmit', order.id, {
                  files: order.uploadedFiles || [],
                  notes: submission.notes,
                  revisionNotes: submission.revisionNotes
                });
                setShowRevisionSubmitModal(false);
              }}
            />
          ) : (
            <SubmitToAdminModal
              order={order}
              isOpen={showSubmitModal}
              onClose={() => setShowSubmitModal(false)}
              onSubmit={async (submission) => {
                await onAction('submit_to_admin', order.id, {
                  files: order.uploadedFiles || [],
                  notes: submission.notes,
                  estimatedCompletionTime: submission.estimatedCompletionTime
                });
                setShowSubmitModal(false);
              }}
            />
          )}
        </>
      )}
    </Modal>
  );
}
