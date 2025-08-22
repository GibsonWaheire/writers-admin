import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import type { PODOrder } from '../types/pod';

interface PODReassignmentModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function PODReassignmentModal({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm 
}: PODReassignmentModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      onClose();
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeadlineClose = () => {
    const deadline = new Date(order.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 6; // 6 hours or less
  };

  const getFineWarning = () => {
    if (isDeadlineClose()) {
      return {
        severity: 'high' as const,
        message: '⚠️ HIGH RISK: Deadline is very close. Reassignment may result in a significant fine.',
        color: 'text-red-600',
        bg: 'bg-red-50'
      };
    }
    
    const deadline = new Date(order.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours <= 12) {
      return {
        severity: 'medium' as const,
        message: '⚠️ MEDIUM RISK: Deadline is approaching. Reassignment may result in a fine.',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      };
    }
    
    return {
      severity: 'low' as const,
      message: 'ℹ️ LOW RISK: Deadline is still manageable. Reassignment likely won\'t result in a fine.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    };
  };

  const fineWarning = getFineWarning();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <RotateCcw className="h-5 w-5" />
            Reassign POD Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">POD Order Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Title:</strong> {order.title}</p>
              <p><strong>Deadline:</strong> {new Date(order.deadline).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>POD Amount:</strong> KES {order.podAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Fine Warning */}
          <div className={`border rounded-lg p-4 ${fineWarning.bg}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${fineWarning.color}`} />
              <div className="text-sm">
                <p className={`font-medium ${fineWarning.color} mb-1`}>
                  Fine Warning
                </p>
                <p className={`${fineWarning.color}`}>
                  {fineWarning.message}
                </p>
                <div className="mt-2 text-xs opacity-80">
                  <p>• Early reassignment: Usually no fine</p>
                  <p>• Close to deadline: Fine may apply</p>
                  <p>• Admin has final say on fine enforcement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Reassignment *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for reassigning this POD order..."
              className="mt-1"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be logged and reviewed by administrators.
            </p>
          </div>

          {/* Additional Warnings */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Order will return to Available status</li>
                  <li>Your progress will be lost</li>
                  <li>Reassignment reason is permanently logged</li>
                  <li>Admin may review and apply fines if necessary</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Reassigning...' : 'Confirm Reassignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
