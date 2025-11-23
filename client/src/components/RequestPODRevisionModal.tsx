import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import type { PODOrder } from '../types/pod';

interface RequestPODRevisionModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onRequestRevision: (orderId: string, explanation: string, notes?: string) => void;
}

export function RequestPODRevisionModal({ 
  order, 
  isOpen, 
  onClose, 
  onRequestRevision 
}: RequestPODRevisionModalProps) {
  const [explanation, setExplanation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onRequestRevision(order.id, explanation.trim(), notes.trim() || undefined);
      onClose();
      setExplanation('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = explanation.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-orange-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
            Request POD Revision
            {order.revisionCount && order.revisionCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-300">
                Revision #{order.revisionCount + 1}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {order.revisionCount && order.revisionCount > 0
              ? `This will be POD revision #${order.revisionCount + 1} for this order. Explain what still needs to be revised.`
              : 'Explain what needs to be revised in this POD order. This will be sent to the writer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{order.title}</h3>
            <div className="text-sm text-gray-600">
              <p>Order ID: {order.id}</p>
              <p>Pages: {order.pages} • Words: {order.words?.toLocaleString() || 'N/A'}</p>
              <p className="mt-2 text-green-600 font-medium">
                POD Amount: KES {(order.pages * 350).toLocaleString()}
              </p>
              {order.revisionCount && order.revisionCount > 0 && (
                <p className="mt-2 text-orange-700 font-medium">
                  Current Revision Count: {order.revisionCount}
                  {order.revisionCount === 1 && ' (First Revision)'}
                  {order.revisionCount === 2 && ' (Second Revision)'}
                  {order.revisionCount > 2 && ` (Revision #${order.revisionCount})`}
                </p>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-2">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide clear, specific explanation of what needs to be revised</li>
                  <li>The writer will see this explanation and use it to improve their work</li>
                  <li>Revision count will increase with each revision request</li>
                  <li>POD orders require careful review before delivery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Revision Explanation (Required) */}
          <div>
            <Label htmlFor="explanation" className="text-sm font-medium text-gray-700">
              Revision Explanation * <span className="text-red-500">(Required)</span>
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain in detail what needs to be revised in this POD order. Be specific about sections, content, formatting, delivery requirements, or any other issues that need to be addressed..."
              className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              rows={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Required: Provide a clear explanation of what needs to be revised. This helps the writer understand exactly what changes are needed.
            </p>
          </div>

          {/* Additional Notes (Optional) */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context, suggestions, delivery instructions, or notes for the writer..."
              className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Add any additional context or suggestions that might help the writer, especially regarding delivery requirements.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? 'Requesting...' : 'Request POD Revision'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

