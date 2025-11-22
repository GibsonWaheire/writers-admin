import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
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
  X
} from 'lucide-react';
import type { Order } from '../types/order';
import type { AssignmentHistory } from '../types/notification';

interface AssignmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  assignment: AssignmentHistory;
  onConfirm: (confirmation: {
    estimatedCompletionTime?: number;
    questions?: string[];
    additionalNotes?: string;
  }) => void;
  onDecline: (reason: string) => void;
}

export function AssignmentConfirmationModal({
  isOpen,
  onClose,
  order,
  assignment,
  onConfirm,
  onDecline
}: AssignmentConfirmationModalProps) {
  const [estimatedHours, setEstimatedHours] = useState<number>(48);
  const [questions, setQuestions] = useState<string[]>(['']);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

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
    const validQuestions = questions.filter(q => q.trim() !== '');
    onConfirm({
      estimatedCompletionTime: estimatedHours,
      questions: validQuestions.length > 0 ? validQuestions : undefined,
      additionalNotes: additionalNotes.trim() || undefined
    });
    onClose();
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      onDecline(declineReason.trim());
      onClose();
    }
  };

  const timeRemaining = () => {
    const deadline = new Date(assignment.autoConfirmDeadline);
    const now = new Date();
    const diffInMinutes = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'Expired';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            Assignment Confirmation Required
            <Badge className={`${getPriorityColor(assignment.priority)} border`}>
              {assignment.priority} priority
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-confirm warning */}
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

          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">{order.title}</h4>
                  <p className="text-gray-600 mb-3">{order.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="font-medium">{order.discipline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paper Type:</span>
                      <span className="font-medium">{order.paperType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span className="font-medium">{order.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="font-medium">{order.format}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-lg text-green-600">
                        {formatCurrency(order.pages * 350)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <div>
                        <span className="font-medium">Deadline: </span>
                        <span className="text-red-600">{order.deadline}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="font-medium">Assigned by: </span>
                        <span>{assignment.assignedByName}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Assigned: </span>
                      {formatTimeAgo(assignment.assignedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {assignment.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Admin Notes:</p>
                      <p className="text-blue-700 text-sm">{assignment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!showDeclineForm ? (
            /* Confirmation Form */
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Confirmation Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estimated Completion Time (hours)
                    </label>
                    <Input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      min="1"
                      max="168"
                      className="w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {order.pages} pages, estimated {order.pages * 2} hours
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Questions for the Client (optional)
                    </label>
                    {questions.map((question, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder={`Question ${index + 1}`}
                          value={question}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                          className="flex-1"
                        />
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      className="mt-2"
                    >
                      Add Question
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Any additional information or special requirements..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Decline Form */
            <Card className="border-red-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-800">
                  Decline Assignment
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for declining (required)
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for declining this assignment..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {!showDeclineForm ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowDeclineForm(true)}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Assignment
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowDeclineForm(false)}
              >
                Back
              </Button>
              <Button 
                onClick={handleDecline}
                disabled={!declineReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirm Decline
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
