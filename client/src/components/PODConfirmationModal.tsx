import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Upload,
  Info
} from 'lucide-react';
import type { PODOrder, PODWriterConfirmation } from '../types/pod';

interface PODConfirmationModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmation: PODWriterConfirmation) => void;
}

export function PODConfirmationModal({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm 
}: PODConfirmationModalProps) {
  const [confirmation, setConfirmation] = useState<PODWriterConfirmation>({
    id: '',
    hasReadInstructions: false,
    hasUnderstoodRequirements: false,
    canMeetDeadline: false,
    hasNoConflicts: false,
    understandsPODTerms: false,
    canSubmitWork: false,
    estimatedCompletionHours: 24,
    additionalNotes: '',
    confirmedAt: '',
    writerId: '',
    showDropdown: false
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setConfirmation(prev => ({ ...prev, showDropdown: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (field: keyof PODWriterConfirmation, checked: boolean) => {
    setConfirmation(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleInputChange = (field: keyof PODWriterConfirmation, value: string | number) => {
    setConfirmation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const finalConfirmation: PODWriterConfirmation = {
      ...confirmation,
      id: `conf-${Date.now()}`,
      confirmedAt: now,
      writerId: 'writer-1' // This should come from auth context
    };
    onConfirm(finalConfirmation);
  };

  const isFormValid = 
    confirmation.hasReadInstructions &&
    confirmation.hasUnderstoodRequirements &&
    confirmation.canMeetDeadline &&
    confirmation.hasNoConflicts &&
    confirmation.understandsPODTerms &&
    confirmation.canSubmitWork &&
    confirmation.estimatedCompletionHours > 0;

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return { text: `Overdue by ${Math.abs(diffHours)} hours`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffHours === 0) {
      return { text: 'Due within the hour', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (diffHours <= 6) {
      return { text: `Due in ${diffHours} hours`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffHours} hours`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const deadlineStatus = formatDeadline(order.deadline);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Confirm POD Order Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{order.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{order.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Paper Type:</span>
                    <p className="text-gray-600">{order.paperType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <p className="text-gray-600">{order.format}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pages:</span>
                    <p className="text-gray-600">{order.pages}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Words:</span>
                    <p className="text-gray-600">{order.words.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    KES {(order.pages * 350).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.pages} pages × KES 350 CPP
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${deadlineStatus.bg} ${deadlineStatus.color} shadow-sm`}>
                    <Clock className="h-4 w-4" />
                    {deadlineStatus.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.deadlineHours === 24 ? '24-hour deadline' : '48-hour deadline'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* POD Terms Warning */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full shadow-md">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 mb-3 text-lg">⚠️ Important: POD Order Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">Submit completed work as file upload</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">No physical delivery required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">Payment processed after work approval</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-amber-800 font-medium">Strict deadline enforcement</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200 shadow-sm">
                  <p className="text-amber-800 font-semibold text-sm">
                    🚨 Note: POD orders have strict deadlines. Ensure you can complete the work within the specified hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Confirmation Checklist
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
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
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Instructions:</span> {order.additionalInstructions || 'No additional instructions provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
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
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm">
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

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
                <Checkbox
                  id="canMeetDeadline"
                  checked={confirmation.canMeetDeadline}
                  onCheckedChange={(checked) => handleCheckboxChange('canMeetDeadline', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="canMeetDeadline" className="font-semibold text-gray-900 cursor-pointer">
                    I can complete this order within {order.deadlineHours} hours
                  </Label>
                  <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Deadline:</span>
                      <span className="text-orange-700 font-semibold">{order.deadlineHours} hours from assignment</span>
                    </div>
                    <div className="mt-2 text-xs text-orange-600">
                      Current deadline: {new Date(order.deadline).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
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
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">Note:</span> Ensure you can dedicate sufficient time to this order without compromising other commitments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
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
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Key Terms:</span> File upload submission, no physical delivery, payment after approval, strict deadline enforcement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md">
                <Checkbox
                  id="canSubmitWork"
                  checked={confirmation.canSubmitWork}
                  onCheckedChange={(checked) => handleCheckboxChange('canSubmitWork', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="canSubmitWork" className="font-semibold text-gray-900 cursor-pointer">
                    I can submit the completed work as a file upload
                  </Label>
                  <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm text-indigo-800">
                        <span className="font-medium">Requirement:</span> Submit completed work as PDF, DOC, or DOCX file through the platform.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm relative">
                <Label htmlFor="estimatedCompletionHours" className="font-medium text-gray-700">
                  Estimated Completion Time
                </Label>
                <div className="relative mt-2" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setConfirmation(prev => ({ ...prev, showDropdown: !prev.showDropdown }))}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {confirmation.estimatedCompletionHours} hours
                  </button>
                  
                  {confirmation.showDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-48 overflow-y-auto">
                      {[6, 12, 18, 24, 36, 48].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => {
                            handleInputChange('estimatedCompletionHours', hours);
                            setConfirmation(prev => ({ ...prev, showDropdown: false }));
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                        >
                          {hours} hours
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  When do you expect to complete this order?
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <Label htmlFor="additionalNotes" className="font-medium text-gray-700">
                  Additional Notes or Questions
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={confirmation.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any questions, clarifications, or additional notes..."
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Optional: Add any questions or clarifications you need
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 p-6 rounded-lg shadow-sm">
            <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-100">
              Cancel
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Assignment
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 shadow-lg mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Form Completion</span>
              <span className="font-semibold">{Object.values(confirmation).filter(Boolean).length - 2}/{Object.keys(confirmation).length - 2} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ 
                  width: `${((Object.values(confirmation).filter(Boolean).length - 2) / (Object.keys(confirmation).length - 2)) * 100}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              All required items must be checked to confirm assignment
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
