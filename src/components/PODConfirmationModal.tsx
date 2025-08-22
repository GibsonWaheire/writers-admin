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

  const handleSubmit = () => {
    if (validateConfirmation()) {
      onConfirm();
      onClose();
    }
  };

  const isFormValid = Object.values(confirmation).every(value => 
    typeof value === 'boolean' ? value : true
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirm POD Order Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{order.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{order.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{order.pages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">POD Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  KES {order.podAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* POD Terms Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Important: Pay on Delivery (POD) Terms</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>No advance payment will be made</li>
                  <li>Payment is collected upon successful delivery</li>
                  <li>You are responsible for delivery logistics</li>
                  <li>Payment must be collected in full before order completion</li>
                  <li>Failure to collect payment may affect your earnings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Confirmation Checklist</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasReadInstructions"
                  checked={confirmation.hasReadInstructions}
                  onCheckedChange={(checked) => handleCheckboxChange('hasReadInstructions', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="hasReadInstructions" className="font-medium">
                    I have read and understood all order instructions
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Including additional instructions: {order.additionalInstructions || 'None'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasUnderstoodRequirements"
                  checked={confirmation.hasUnderstoodRequirements}
                  onCheckedChange={(checked) => handleCheckboxChange('hasUnderstoodRequirements', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="hasUnderstoodRequirements" className="font-medium">
                    I understand all order requirements and specifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Paper type: {order.paperType}, Format: {order.format}, Words: {order.words.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="canMeetDeadline"
                  checked={confirmation.canMeetDeadline}
                  onCheckedChange={(checked) => handleCheckboxChange('canMeetDeadline', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="canMeetDeadline" className="font-medium">
                    I can complete this order by the deadline
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Deadline: {new Date(order.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasNoConflicts"
                  checked={confirmation.hasNoConflicts}
                  onCheckedChange={(checked) => handleCheckboxChange('hasNoConflicts', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="hasNoConflicts" className="font-medium">
                    I have no conflicts or overlapping deadlines
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensure you can dedicate sufficient time to this order
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="understandsPODTerms"
                  checked={confirmation.understandsPODTerms}
                  onCheckedChange={(checked) => handleCheckboxChange('understandsPODTerms', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="understandsPODTerms" className="font-medium">
                    I understand and accept the POD terms and conditions
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    No advance payment, payment collected upon delivery
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="canHandleDelivery"
                  checked={confirmation.canHandleDelivery}
                  onCheckedChange={(checked) => handleCheckboxChange('canHandleDelivery', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="canHandleDelivery" className="font-medium">
                    I can handle the physical delivery of this order
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    You will be responsible for delivering the completed work to the client
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasTransportation"
                  checked={confirmation.hasTransportation}
                  onCheckedChange={(checked) => handleCheckboxChange('hasTransportation', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="hasTransportation" className="font-medium">
                    I have reliable transportation for delivery
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensure you can reach the client location for delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Additional Information</h3>
            
            <div>
              <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
              <Input
                id="estimatedDeliveryDate"
                type="date"
                value={confirmation.estimatedDeliveryDate}
                onChange={(e) => handleInputChange('estimatedDeliveryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                When do you expect to deliver the completed work?
              </p>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes or Questions</Label>
              <Textarea
                id="additionalNotes"
                value={confirmation.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any questions, concerns, or additional information..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-2">Please address the following:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Pick Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
