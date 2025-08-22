import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Calendar,
  User
} from 'lucide-react';
import type { PODOrder } from '../types/pod';

interface PODConfirmationModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface PODConfirmation {
  hasReadInstructions: boolean;
  hasUnderstoodRequirements: boolean;
  canMeetDeadline: boolean;
  hasNoConflicts: boolean;
  understandsPODTerms: boolean;
  canHandleDelivery: boolean;
  hasTransportation: boolean;
  additionalNotes?: string;
  estimatedDeliveryDate?: string;
}

export function PODConfirmationModal({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm 
}: PODConfirmationModalProps) {
  const [confirmation, setConfirmation] = useState<PODConfirmation>({
    hasReadInstructions: false,
    hasUnderstoodRequirements: false,
    canMeetDeadline: false,
    hasNoConflicts: false,
    understandsPODTerms: false,
    canHandleDelivery: false,
    hasTransportation: false,
    additionalNotes: '',
    estimatedDeliveryDate: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (field: keyof PODConfirmation, checked: boolean) => {
    setConfirmation(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleInputChange = (field: keyof PODConfirmation, value: string) => {
    setConfirmation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateConfirmation = (): boolean => {
    const newErrors: string[] = [];
    
    // Check if deadline is within 24 hours
    const now = new Date();
    const deadline = new Date(order.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours > 24) {
      newErrors.push('POD orders must have a deadline within 24 hours. This order cannot be assigned.');
      return false; // Early return for deadline validation
    }
    
    if (!confirmation.hasReadInstructions) {
      newErrors.push('You must read and understand the order instructions');
    }
    if (!confirmation.hasUnderstoodRequirements) {
      newErrors.push('You must understand the order requirements');
    }
    if (!confirmation.canMeetDeadline) {
      newErrors.push('You must confirm you can meet the deadline');
    }
    if (!confirmation.hasNoConflicts) {
      newErrors.push('You must confirm you have no conflicts');
    }
    if (!confirmation.understandsPODTerms) {
      newErrors.push('You must understand the POD terms and conditions');
    }
    if (!confirmation.canHandleDelivery) {
      newErrors.push('You must confirm you can handle delivery');
    }
    if (!confirmation.hasTransportation) {
      newErrors.push('You must confirm you have transportation for delivery');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (validateConfirmation()) {
      setIsSubmitting(true);
      try {
        await onConfirm();
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = Object.values(confirmation).every(value => 
    typeof value === 'boolean' ? value : true
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            POD Order Assignment Confirmation
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Please carefully review and confirm your understanding of this POD order before proceeding
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Title</span>
                  <p className="font-semibold text-gray-900">{order.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Subject</span>
                  <p className="font-semibold text-gray-900">{order.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Pages</span>
                  <p className="font-semibold text-gray-900">{order.pages}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Deadline</span>
                  <p className="font-semibold text-gray-900">{new Date(order.deadline).toLocaleDateString()}</p>
                  {(() => {
                    const now = new Date();
                    const deadline = new Date(order.deadline);
                    const diffTime = deadline.getTime() - now.getTime();
                    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                    
                    if (diffHours <= 0) {
                      return <span className="text-red-600 text-xs font-medium">⚠️ OVERDUE</span>;
                    } else if (diffHours <= 6) {
                      return <span className="text-red-600 text-xs font-medium">🚨 URGENT: {diffHours}h left</span>;
                    } else if (diffHours <= 12) {
                      return <span className="text-orange-600 text-xs font-medium">⚠️ Due in {diffHours}h</span>;
                    } else if (diffHours <= 24) {
                      return <span className="text-green-600 text-xs font-medium">✅ Valid POD deadline</span>;
                    } else {
                      return <span className="text-red-600 text-xs font-medium">❌ Invalid: {diffHours}h &gt; 24h limit</span>;
                    }
                  })()}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">POD Amount</span>
                    <p className="text-2xl font-bold text-green-600">
                      KES {order.podAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Payment Terms</span>
                  <p className="text-sm font-medium text-gray-700">Pay on Delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* POD Terms Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 mb-3 text-lg">⚠️ Critical: Pay on Delivery (POD) Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">No advance payment will be made</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">Payment collected upon successful delivery</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">You are responsible for delivery logistics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">Payment must be collected in full</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-semibold text-sm">
                    🚨 Risk Warning: Failure to collect payment may result in loss of earnings and account penalties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Confirmation Checklist
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="hasReadInstructions"
                  checked={confirmation.hasReadInstructions}
                  onCheckedChange={(checked) => handleCheckboxChange('hasReadInstructions', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="hasReadInstructions" className="font-semibold text-gray-900 cursor-pointer">
                    I have read and understood all order instructions
                  </Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Instructions:</span> {order.additionalInstructions || 'No additional instructions provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="hasUnderstoodRequirements"
                  checked={confirmation.hasUnderstoodRequirements}
                  onCheckedChange={(checked) => handleCheckboxChange('hasUnderstoodRequirements', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="hasUnderstoodRequirements" className="font-semibold text-gray-900 cursor-pointer">
                    I understand all order requirements and specifications
                  </Label>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-800">Paper Type:</span>
                        <p className="text-green-700">{order.paperType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">Format:</span>
                        <p className="text-green-700">{order.format}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">Words:</span>
                        <p className="text-green-700">{order.words.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="canMeetDeadline"
                  checked={confirmation.canMeetDeadline}
                  onCheckedChange={(checked) => handleCheckboxChange('canMeetDeadline', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="canMeetDeadline" className="font-semibold text-gray-900 cursor-pointer">
                    I can complete this order by the deadline
                  </Label>
                  <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Deadline:</span>
                      <span className="text-orange-700 font-semibold">{new Date(order.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="hasNoConflicts"
                  checked={confirmation.hasNoConflicts}
                  onCheckedChange={(checked) => handleCheckboxChange('hasNoConflicts', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="hasNoConflicts" className="font-semibold text-gray-900 cursor-pointer">
                    I have no conflicts or overlapping deadlines
                  </Label>
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">Note:</span> Ensure you can dedicate sufficient time to this order without compromising other commitments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="understandsPODTerms"
                  checked={confirmation.understandsPODTerms}
                  onCheckedChange={(checked) => handleCheckboxChange('understandsPODTerms', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="understandsPODTerms" className="font-semibold text-gray-900 cursor-pointer">
                    I understand and accept the POD terms and conditions
                  </Label>
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Key Terms:</span> No advance payment, payment collected upon delivery, you are responsible for payment collection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="canHandleDelivery"
                  checked={confirmation.canHandleDelivery}
                  onCheckedChange={(checked) => handleCheckboxChange('canHandleDelivery', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="canHandleDelivery" className="font-semibold text-gray-900 cursor-pointer">
                    I can handle the physical delivery of this order
                  </Label>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Responsibility:</span> You will be responsible for delivering the completed work to the client and collecting payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="hasTransportation"
                  checked={confirmation.hasTransportation}
                  onCheckedChange={(checked) => handleCheckboxChange('hasTransportation', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="hasTransportation" className="font-semibold text-gray-900 cursor-pointer">
                    I have reliable transportation for delivery
                  </Label>
                  <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">Requirement:</span> Ensure you can reach the client location for delivery using reliable transportation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="estimatedDeliveryDate" className="font-medium text-gray-700">
                  Estimated Delivery Date
                </Label>
                <Input
                  id="estimatedDeliveryDate"
                  type="date"
                  value={confirmation.estimatedDeliveryDate}
                  onChange={(e) => handleInputChange('estimatedDeliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  When do you expect to deliver the completed work?
                </p>
              </div>

              <div>
                <Label htmlFor="additionalNotes" className="font-medium text-gray-700">
                  Additional Notes or Questions
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={confirmation.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any questions, concerns, or additional information..."
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Optional: Provide context about your delivery plans or any concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-3 text-lg">Please Address the Following Issues:</h3>
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-red-800 font-medium">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm & Pick Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
