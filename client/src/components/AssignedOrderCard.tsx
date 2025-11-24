import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Eye,
  Play,
  RotateCcw,
  User,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { AssignmentConfirmationModal } from './AssignmentConfirmationModal';
import { UnifiedAssignmentModal } from './UnifiedAssignmentModal';
import { UploadOrderFilesModal } from './UploadOrderFilesModal';
import { useOrders } from '../contexts/OrderContext';
import type { Order } from '../types/order';
import type { AssignmentHistory } from '../types/notification';

interface AssignedOrderCardProps {
  order: Order;
  assignment?: AssignmentHistory;
  onView: (order: Order) => void;
  onConfirmAssignment: (orderId: string, confirmation: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => void;
  onDeclineAssignment: (orderId: string, reason: string) => void;
  onStartWork: (orderId: string, data: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => void;
  onRequestReassignment: (orderId: string, data: {
    reason: string;
    additionalNotes?: string;
  }) => void;
  onSubmitWork?: (orderId: string, submission: {
    files: import('../types/order').UploadedFile[];
    notes: string;
    estimatedCompletionTime?: string;
  }) => void;
  onUploadFiles?: (orderId: string, files: import('../types/order').UploadedFile[]) => void;
}

export function AssignedOrderCard({
  order: orderProp,
  assignment,
  onView,
  onConfirmAssignment,
  onDeclineAssignment,
  onStartWork,
  onRequestReassignment,
  onSubmitWork,
  onUploadFiles
}: AssignedOrderCardProps) {
  const { orders } = useOrders();
  // Get the latest order from context to ensure we have updated files
  const order = orders.find(o => o.id === orderProp.id) || orderProp;
  
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [unifiedModalAction, setUnifiedModalAction] = useState<'start_work' | 'reassign'>('start_work');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const filesToSubmit = useMemo(() => {
    if (order.revisionFiles && order.revisionFiles.length > 0 && order.status === 'Revision') {
      return order.revisionFiles;
    }
    if (order.originalFiles && order.originalFiles.length > 0) {
      return order.originalFiles;
    }
    return order.uploadedFiles || [];
  }, [order]);

  const hasFiles = filesToSubmit.length > 0;

  const handleSubmitWorkClick = async () => {
    if (!onSubmitWork) return;
    if (!hasFiles) {
      setShowUploadModal(true);
      return;
    }

    const confirmed = window.confirm('Submit your work to admin for review? You will be notified once it is reviewed.');
    if (!confirmed) return;

    setIsSubmittingWork(true);
    setSubmitError(null);
    try {
      await onSubmitWork(order.id, {
        files: filesToSubmit,
        notes: '',
        estimatedCompletionTime: undefined
      });
    } catch (error) {
      console.error('Failed to submit work:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit work. Please try again.');
    } finally {
      setIsSubmittingWork(false);
    }
  };
  const needsConfirmation = order.status === 'Assigned' && assignment?.status === 'pending';
  const canStartWork = order.status === 'Assigned' && assignment?.status === 'confirmed';
  
  // Check if order can be reassigned (must have >= 12 hours remaining)
  const deadline = new Date(order.deadline);
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canReassign = (order.status === 'Assigned' || order.status === 'In Progress') && hoursRemaining >= 12;

  const handleStartWork = () => {
    setUnifiedModalAction('start_work');
    setShowUnifiedModal(true);
  };

  const handleReassign = () => {
    setUnifiedModalAction('reassign');
    setShowUnifiedModal(true);
  };

  const handleUnifiedAction = (actionType: 'start_work' | 'reassign', data: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
    reason?: string;
  }) => {
    if (actionType === 'start_work') {
      onStartWork(order.id, data);
    } else if (actionType === 'reassign') {
      onRequestReassignment(order.id, {
        reason: data.reason || 'No reason provided',
        additionalNotes: data.additionalNotes
      });
    }
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

  const deadlineStatus = getDeadlineStatus();

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{order.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {order.discipline}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {order.paperType}
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {order.pages} pages
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {order.format}
                </Badge>
              </div>
            </div>
            
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                KES {order.totalPriceKES?.toLocaleString() || (order.pages * 350).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Earnings</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Deadline Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(order.status as string) === 'Awaiting Approval' ? (
                <Badge className="bg-orange-500 text-white border-0 animate-pulse px-3 py-1">
                  ⏳ Awaiting Admin Approval
                </Badge>
              ) : (
                <Badge 
                  variant={order.status === 'Assigned' ? 'default' : 'secondary'}
                  className={order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : ''}
                >
                  {order.status}
                </Badge>
              )}
              <div className={`text-sm ${deadlineStatus.color} ${deadlineStatus.bg} px-2 py-1 rounded-full`}>
                {deadlineStatus.text}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Due: {new Date(order.deadline).toLocaleDateString()}
            </div>
          </div>
          
          {/* Awaiting Approval Notice */}
          {(order.status as string) === 'Awaiting Approval' && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    Waiting for Admin Approval
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    This order is pending admin approval. Once approved, you'll be able to start working on it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Details */}
          {assignment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Assignment Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Assigned:</span>
                  <span className="text-blue-900 ml-2">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Priority:</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {assignment.priority}
                  </Badge>
                </div>
                {assignment.notes && (
                  <div className="col-span-2">
                    <span className="text-blue-700">Notes:</span>
                    <span className="text-blue-900 ml-2">{assignment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(order)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            {needsConfirmation ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowConfirmationModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              </>
            ) : (
              <>
                {canStartWork && (
                  <Button
                    size="sm"
                    onClick={handleStartWork}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Work
                  </Button>
                )}
                {/* Upload and Submit buttons for Assigned and In Progress orders */}
                {(order.status === 'Assigned' || order.status === 'In Progress') && (
                  hasFiles ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={handleSubmitWorkClick}
                        disabled={isSubmittingWork}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingWork ? 'Submitting...' : 'Submit for Review'}
                      </Button>
                      {submitError && (
                        <p className="text-xs text-red-600">{submitError}</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Files
                    </Button>
                  )
                )}
                {canReassign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReassign}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reassign
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Assignment */}
      {showConfirmationModal && assignment && (
        <AssignmentConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          order={order}
          assignment={assignment}
          onConfirm={(confirmation) => {
            onConfirmAssignment(order.id, confirmation);
            setShowConfirmationModal(false);
          }}
          onDecline={(reason) => {
            onDeclineAssignment(order.id, reason);
            setShowConfirmationModal(false);
          }}
        />
      )}

      {/* Unified Modal for Start Work and Reassign */}
      <UnifiedAssignmentModal
        isOpen={showUnifiedModal}
        onClose={() => setShowUnifiedModal(false)}
        order={order}
        assignment={assignment}
        actionType={unifiedModalAction}
        onConfirm={handleUnifiedAction}
      />

      {/* Upload Files Modal */}
      {onUploadFiles && (
        <UploadOrderFilesModal
          order={order}
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={async (files) => {
            if (onUploadFiles) {
              await onUploadFiles(order.id, files);
              // Modal will close itself after successful upload
            }
          }}
        />
      )}

    </>
  );
}

interface WriterSubmissionPanelProps {
  order: Order;
  onSubmitWork?: (orderId: string, submission: {
    files: import('../types/order').UploadedFile[];
    notes: string;
    estimatedCompletionTime?: string;
  }) => Promise<void>;
  onOpenUpload: () => void;
  submissionNotes: string;
  onChangeNotes: (value: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  submitError: string | null;
  setSubmitError: (value: string | null) => void;
}

function WriterSubmissionPanel({
  order,
  onSubmitWork,
  onOpenUpload,
  submissionNotes,
  onChangeNotes,
  isSubmitting,
  setIsSubmitting,
  submitError,
  setSubmitError
}: WriterSubmissionPanelProps) {
  const filesToSubmit = useMemo(() => {
    if (order.revisionFiles && order.revisionFiles.length > 0 && order.status === 'Revision') {
      return order.revisionFiles;
    }
    if (order.originalFiles && order.originalFiles.length > 0) {
      return order.originalFiles;
    }
    return order.uploadedFiles || [];
  }, [order]);

  const hasFiles = filesToSubmit.length > 0;

  const renderFileSummary = () => {
    if (!hasFiles) {
      return (
        <div className="text-sm text-gray-500">
          No files uploaded yet. Please upload your work files before submitting.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filesToSubmit.slice(0, 3).map((file, index) => (
          <div
            key={`${file.id || file.filename || index}-${index}`}
            className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-md border border-gray-100"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-800 truncate max-w-[160px]">
                {file.originalName || file.filename}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ))}
        {filesToSubmit.length > 3 && (
          <div className="text-xs text-gray-500">
            +{filesToSubmit.length - 3} more file(s)
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!onSubmitWork) return;
    if (!hasFiles) {
      onOpenUpload();
      return;
    }

    const confirmed = window.confirm('Submit your work to admin for review? You will be notified once it is reviewed.');
    if (!confirmed) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmitWork(order.id, {
        files: filesToSubmit,
        notes: submissionNotes.trim(),
        estimatedCompletionTime: undefined
      });
      onChangeNotes('');
    } catch (error) {
      console.error('Failed to submit work:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Upload className="h-4 w-4 text-blue-600" />
        Upload & Submit Work
      </div>

      {renderFileSummary()}

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Notes for Admin (optional)</label>
        <Textarea
          value={submissionNotes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Add context about your submission for the admin reviewer..."
          className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 resize-none text-sm"
          rows={2}
        />
      </div>

      {submitError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!hasFiles || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-1" />
              Submit for Review
              <span className="ml-1 text-xs opacity-90">({filesToSubmit.length})</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenUpload}
        >
          <Upload className="h-4 w-4 mr-1" />
          {hasFiles ? 'Update Uploaded Files' : 'Upload Files'}
        </Button>
      </div>

      {!hasFiles && (
        <p className="text-xs text-gray-500">
          Upload your work files first to enable submission.
        </p>
      )}
    </div>
  );
}
