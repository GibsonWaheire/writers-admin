import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  MessageSquare,
  DollarSign
} from 'lucide-react';
import type { Order, WriterQuestion, WriterConfirmation } from '../types/order';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (confirmation: WriterConfirmation, questions: WriterQuestion[]) => void;
}

export function OrderConfirmationModal({ 
  isOpen, 
  onClose, 
  order, 
  onConfirm 
}: OrderConfirmationModalProps) {
  const [confirmation, setConfirmation] = useState<WriterConfirmation>({
    id: `conf-${Date.now()}`,
    hasReadInstructions: false,
    hasUnderstoodRequirements: false,
    canMeetDeadline: false,
    hasNoConflicts: false,
    additionalNotes: '',
    confirmedAt: '',
    writerId: 'writer-1' // This should come from auth context
  });

  const [questions, setQuestions] = useState<WriterQuestion[]>([
    {
      id: 'q1',
      question: 'Do you have any questions about the requirements?',
      isRequired: false,
      askedAt: new Date().toISOString()
    },
    {
      id: 'q2',
      question: 'Are there any specific sources or references you need?',
      isRequired: false,
      askedAt: new Date().toISOString()
    },
    {
      id: 'q3',
      question: 'Do you need any clarification on the formatting requirements?',
      isRequired: false,
      askedAt: new Date().toISOString()
    }
  ]);

  const [customQuestion, setCustomQuestion] = useState('');

  const handleConfirmationChange = (field: keyof WriterConfirmation, value: boolean | string) => {
    setConfirmation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, answer, answeredAt: new Date().toISOString() }
        : q
    ));
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim()) {
      const newQuestion: WriterQuestion = {
        id: `q${Date.now()}`,
        question: customQuestion.trim(),
        isRequired: false,
        askedAt: new Date().toISOString()
      };
      setQuestions(prev => [...prev, newQuestion]);
      setCustomQuestion('');
    }
  };

  const canConfirm = confirmation.hasReadInstructions && 
                   confirmation.hasUnderstoodRequirements && 
                   confirmation.canMeetDeadline && 
                   confirmation.hasNoConflicts;

  const handleConfirm = () => {
    const finalConfirmation = {
      ...confirmation,
      confirmedAt: new Date().toISOString()
    };
    onConfirm(finalConfirmation, questions);
  };

  const calculateEarnings = () => {
    const baseAmount = order.pages * 350; // New CPP: 350 KES per page
    const cppAmount = order.cpp || (baseAmount / order.pages);
    const totalAmount = baseAmount;
    
    return { baseAmount, cppAmount, totalAmount };
  };

  const earnings = calculateEarnings();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Order Assignment"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm & Accept Order
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">{order.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{order.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pages:</span>
                  <span className="font-medium">{order.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Words:</span>
                  <span className="font-medium">{order.words.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Format:</span>
                  <span className="font-medium">{order.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deadline:</span>
                  <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Information */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Earnings Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  KES {earnings.baseAmount.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Base Amount</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  KES {earnings.cppAmount.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Per Page (CPP)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  KES {earnings.totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Confirmation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={confirmation.hasReadInstructions}
                  onCheckedChange={(checked) => 
                    handleConfirmationChange('hasReadInstructions', checked as boolean)
                  }
                />
                <span className="text-sm">
                  I have read and understood all the order instructions and requirements
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={confirmation.hasUnderstoodRequirements}
                  onCheckedChange={(checked) => 
                    handleConfirmationChange('hasUnderstoodRequirements', checked as boolean)
                  }
                />
                <span className="text-sm">
                  I understand the academic level, formatting, and citation requirements
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={confirmation.canMeetDeadline}
                  onCheckedChange={(checked) => 
                    handleConfirmationChange('canMeetDeadline', checked as boolean)
                  }
                />
                <span className="text-sm">
                  I can complete this order by the deadline: {new Date(order.deadline).toLocaleDateString()}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={confirmation.hasNoConflicts}
                  onCheckedChange={(checked) => 
                    handleConfirmationChange('hasNoConflicts', checked as boolean)
                  }
                />
                <span className="text-sm">
                  I have no conflicts of interest and can work on this order independently
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                placeholder="Any additional comments or questions..."
                value={confirmation.additionalNotes || ''}
                onChange={(e) => handleConfirmationChange('additionalNotes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Questions & Clarifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {question.question}
                  </label>
                  <Input
                    placeholder="Your answer..."
                    value={question.answer || ''}
                    onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Custom Question
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                />
                <Button 
                  onClick={addCustomQuestion}
                  variant="outline"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Once confirmed, this order will be assigned to you and cannot be easily transferred</li>
                  <li>You are responsible for meeting the deadline and quality requirements</li>
                  <li>Payment will be processed upon order completion and client approval</li>
                  <li>Make sure you have enough time and resources to complete this order</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
