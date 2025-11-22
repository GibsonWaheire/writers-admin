import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import type { Order } from '../types/order';
import type { AssignmentHistory } from '../types/notification';

interface UnifiedAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  assignment?: AssignmentHistory;
  actionType: 'start_work' | 'reassign';
  onConfirm: (actionType: 'start_work' | 'reassign', data: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
    reason?: string;
  }) => void;
}

export function UnifiedAssignmentModal({
  isOpen,
  onClose,
  order,
  assignment,
  actionType,
  onConfirm
}: UnifiedAssignmentModalProps) {
  const [questions, setQuestions] = useState<string[]>(['']);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState('');
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [showReassignmentForm, setShowReassignmentForm] = useState(actionType === 'reassign');

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (actionType === 'reassign' && !reassignmentReason.trim()) {
      alert('Please provide a reason for reassignment');
      return;
    }

    const validQuestions = questions.filter(q => q.trim());
    const data = {
      estimatedCompletionTime: estimatedCompletionTime ? parseInt(estimatedCompletionTime) : undefined,
      questions: validQuestions,
      additionalNotes: additionalNotes.trim() || undefined,
      reason: reassignmentReason.trim() || undefined
    };

    onConfirm(actionType, data);
    onClose();
  };

  const handleClose = () => {
    // Reset form state
    setQuestions(['']);
    setAdditionalNotes('');
    setEstimatedCompletionTime('');
    setReassignmentReason('');
    setShowReassignmentForm(actionType === 'reassign');
    onClose();
  };

  // Update form visibility when action type changes
  useEffect(() => {
    setShowReassignmentForm(actionType === 'reassign');
  }, [actionType]);

  const isStartWork = actionType === 'start_work';
  const isReassign = actionType === 'reassign';

  const timeRemaining = () => {
    if (!assignment?.autoConfirmDeadline) return 'Unknown';
    
    const deadline = new Date(assignment.autoConfirmDeadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffInMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'Expired';
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStartWork ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              {isStartWork ? (
                <Play className="h-5 w-5 text-blue-600" />
              ) : (
                <RotateCcw className="h-5 w-5 text-red-600" />
              )}
            </div>
            {isStartWork ? 'Start Work on Order' : 'Reassign Order'}
            {assignment && (
              <Badge className={`${getPriorityColor(assignment.priority)} border`}>
                {assignment.priority} priority
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isStartWork 
              ? "Confirm that you're ready to start working on this order. You can add questions or notes if needed."
              : "Provide a reason for reassigning this order. The order will be made available for other writers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-confirm warning for start work */}
          {isStartWork && assignment && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Auto-confirmation in {timeRemaining()}
                    </p>
                    <p className="text-sm text-yellow-700">
                      This assignment will be automatically confirmed if no action is taken.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reassignment warning */}
          {isReassign && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Reassignment Warning
                    </p>
                    <p className="text-sm text-red-700">
                      Reassigning this order will return it to available status. You may incur penalties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{order.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{order.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">Paper Type:</span>
                      <span className="text-gray-600">{order.paperType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">Pages:</span>
                      <span className="text-gray-600">{order.pages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">Deadline:</span>
                      <span className="text-gray-600">
                        {new Date(order.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">Earnings:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(order.totalPriceKES || order.pages * 350)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Assignment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Assigned:</span>
                        <span className="text-gray-600 ml-2">
                          {assignment ? formatTimeAgo(assignment.assignedAt) : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <Badge className={`ml-2 ${getPriorityColor(assignment?.priority || 'medium')}`}>
                          {assignment?.priority || 'medium'}
                        </Badge>
                      </div>
                      {assignment?.notes && (
                        <div>
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600 mt-1">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action-specific forms */}
          {isStartWork && (
            <>
              {/* Estimated Completion Time */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Work Planning</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Completion Time (hours)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        placeholder="e.g., 24"
                        value={estimatedCompletionTime}
                        onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How many hours do you estimate this order will take to complete?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions for Client */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Questions for Client</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                    >
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          placeholder="Enter your question..."
                          value={question}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="px-3"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isReassign && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Reassignment Reason</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Reassignment *
                    </label>
                    <Textarea
                      placeholder="Please provide a detailed reason for reassigning this order..."
                      value={reassignmentReason}
                      onChange={(e) => setReassignmentReason(e.target.value)}
                      className="w-full"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This reason will be recorded and may affect your rating.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
              <Textarea
                placeholder="Any additional notes or comments..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`${
              isStartWork 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isStartWork ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Work
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Confirm Reassignment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
