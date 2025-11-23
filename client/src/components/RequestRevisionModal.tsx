import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import type { Order } from '../types/order';

interface RequestRevisionModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onRequestRevision: (orderId: string, explanation: string, notes?: string) => void;
}

const REVISION_TEMPLATES = [
  {
    id: 'formatting',
    title: 'Formatting Issues',
    description: 'Citations, references, or document formatting needs correction',
    template: 'The document requires formatting corrections:\n\n1. Citation format needs to be consistent throughout\n2. Reference list needs to be properly formatted\n3. Page margins and spacing need adjustment\n4. Headers and footers need correction\n\nPlease review the formatting guidelines and ensure all requirements are met.'
  },
  {
    id: 'content',
    title: 'Content Quality',
    description: 'Content needs improvement in depth, clarity, or accuracy',
    template: 'The content requires improvements:\n\n1. Some sections lack sufficient depth and detail\n2. Arguments need stronger supporting evidence\n3. Clarity and flow of ideas needs improvement\n4. Some factual information needs verification\n\nPlease enhance the content quality and ensure all points are well-supported.'
  },
  {
    id: 'structure',
    title: 'Structure & Organization',
    description: 'Document structure, flow, or organization needs revision',
    template: 'The document structure needs revision:\n\n1. Introduction needs to better set up the main arguments\n2. Body paragraphs need better logical flow\n3. Transitions between sections need improvement\n4. Conclusion needs to better summarize key points\n\nPlease reorganize the content for better structure and flow.'
  },
  {
    id: 'requirements',
    title: 'Requirements Not Met',
    description: 'Order requirements or instructions were not fully followed',
    template: 'Some order requirements were not fully met:\n\n1. Specific instructions from the order were not followed\n2. Required sections or topics were not addressed\n3. Word count or page count requirements not met\n4. Additional requirements were overlooked\n\nPlease review the original order requirements and ensure all are addressed.'
  },
  {
    id: 'grammar',
    title: 'Grammar & Language',
    description: 'Grammar, spelling, or language quality needs improvement',
    template: 'The document requires language improvements:\n\n1. Multiple grammar and spelling errors need correction\n2. Sentence structure needs improvement\n3. Academic tone and formality need adjustment\n4. Clarity of expression needs enhancement\n\nPlease thoroughly proofread and improve the language quality.'
  },
  {
    id: 'custom',
    title: 'Custom Template',
    description: 'Write your own revision explanation',
    template: ''
  }
];

export function RequestRevisionModal({ 
  order, 
  isOpen, 
  onClose, 
  onRequestRevision 
}: RequestRevisionModalProps) {
  const [explanation, setExplanation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    const template = REVISION_TEMPLATES.find(t => t.id === templateId);
    if (template && template.template) {
      setExplanation(template.template);
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onRequestRevision(order.id, explanation.trim(), notes.trim() || undefined);
      onClose();
      setExplanation('');
      setNotes('');
      setSelectedTemplate(null);
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
            Request Revision
            {order.revisionCount && order.revisionCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-300">
                Revision #{order.revisionCount + 1}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {order.revisionCount && order.revisionCount > 0
              ? `This will be revision #${order.revisionCount + 1} for this order. Explain what still needs to be revised.`
              : 'Explain what needs to be revised in this order. This will be sent to the writer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{order.title}</h3>
            <div className="text-sm text-gray-600">
              <p>Order ID: {order.id}</p>
              <p>Pages: {order.pages} • Words: {order.words?.toLocaleString() || 'N/A'}</p>
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
                  <li>Revision score will be reduced with each revision request</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Revision Templates */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Templates (Optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {REVISION_TEMPLATES.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {template.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Click a template to auto-fill the explanation field. You can edit it afterward.
            </p>
          </div>

          {/* Revision Explanation (Required) */}
          <div>
            <Label htmlFor="explanation" className="text-sm font-medium text-gray-700">
              Revision Explanation * <span className="text-red-500">(Required)</span>
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                if (e.target.value !== explanation) {
                  setSelectedTemplate(null); // Clear template selection if manually edited
                }
              }}
              placeholder="Explain in detail what needs to be revised. Be specific about sections, content, formatting, or any other issues that need to be addressed..."
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
              placeholder="Any additional context, suggestions, or notes for the writer..."
              className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Add any additional context or suggestions that might help the writer.
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
            {isSubmitting ? 'Requesting...' : 'Request Revision'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

