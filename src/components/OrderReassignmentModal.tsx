import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Clock, RotateCcw, Info } from 'lucide-react';
import type { Order } from '../types/order';

interface OrderReassignmentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function OrderReassignmentModal({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm 
}: OrderReassignmentModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'other' ? customReason.trim() : selectedReason;
    if (!finalReason) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
      onClose();
      setSelectedReason('');
      setCustomReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    if (value !== 'other') {
      setCustomReason('');
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
      <DialogContent className="max-w-3xl my-32 bg-gradient-to-br from-white via-gray-50 to-blue-50 backdrop-blur-sm border-0 shadow-2xl flex flex-col max-h-[80vh]">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-red-100 rounded-full">
              <RotateCcw className="h-6 w-6 text-red-600" />
            </div>
            Reassign Order
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-base">
            Provide a reason for reassigning this order. This action will return the order to available status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-6 overflow-y-auto flex-1">
          {/* Order Info */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
              Order Details
            </h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium"><strong>Title:</strong></span>
                </div>
                <p className="font-semibold text-gray-900 ml-6 text-base">{order.title}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium"><strong>Status:</strong></span>
                </div>
                <p className="font-semibold text-gray-900 ml-6 text-base">{order.status}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium"><strong>Deadline:</strong></span>
                </div>
                <p className="font-semibold text-gray-900 ml-6 text-base">{new Date(order.deadline).toLocaleDateString()}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium"><strong>Price:</strong></span>
                </div>
                <p className="font-semibold text-gray-900 ml-6 text-base">KES {order.priceKES?.toLocaleString() || order.price?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Fine Warning */}
          <div className={`border-2 rounded-2xl p-8 shadow-lg ${
            fineWarning.severity === 'high' ? 'bg-gradient-to-br from-red-50 via-red-50 to-pink-50 border-red-300' :
            fineWarning.severity === 'medium' ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-300' :
            'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300'
          }`}>
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-full shadow-lg ${
                fineWarning.severity === 'high' ? 'bg-red-100' :
                fineWarning.severity === 'medium' ? 'bg-orange-100' :
                'bg-blue-100'
              }`}>
                <AlertCircle className={`h-8 w-8 ${
                  fineWarning.severity === 'high' ? 'text-red-600' :
                  fineWarning.severity === 'medium' ? 'text-orange-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className={`font-bold text-xl ${
                    fineWarning.severity === 'high' ? 'text-red-800' :
                    fineWarning.severity === 'medium' ? 'text-orange-800' :
                    'text-blue-800'
                  }`}>
                    Fine Risk Assessment
                  </h3>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                    fineWarning.severity === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                    fineWarning.severity === 'medium' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {fineWarning.severity.toUpperCase()} RISK
                  </div>
                </div>
                <p className={`text-lg font-medium mb-4 ${
                  fineWarning.severity === 'high' ? 'text-red-800' :
                  fineWarning.severity === 'medium' ? 'text-orange-800' :
                  'text-blue-800'
                }`}>
                  {fineWarning.message}
                </p>
                <div className="grid grid-cols-2 gap-8 text-sm mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                      fineWarning.severity === 'high' ? 'bg-red-500' :
                      fineWarning.severity === 'medium' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className={`font-medium ${
                      fineWarning.severity === 'high' ? 'text-red-800' :
                      fineWarning.severity === 'medium' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      <strong>Risk Level:</strong> {fineWarning.severity === 'high' ? 'High' : fineWarning.severity === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                      fineWarning.severity === 'high' ? 'bg-red-500' :
                      fineWarning.severity === 'medium' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className={`font-medium ${
                      fineWarning.severity === 'high' ? 'text-red-800' :
                      fineWarning.severity === 'medium' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      <strong>Fine Probability:</strong> {fineWarning.severity === 'high' ? 'Very Likely' : fineWarning.severity === 'medium' ? 'Possible' : 'Unlikely'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white/70 rounded-xl border border-current/30 shadow-sm">
                  <p className={`text-sm font-bold mb-3 ${
                    fineWarning.severity === 'high' ? 'text-red-800' :
                    fineWarning.severity === 'medium' ? 'text-orange-800' :
                    'text-blue-800'
                  }`}>
                    Fine Guidelines:
                  </p>
                  <ul className={`text-sm space-y-2 ${
                    fineWarning.severity === 'high' ? 'text-red-800' :
                    fineWarning.severity === 'medium' ? 'text-orange-800' :
                    'text-blue-800'
                  }`}>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      Early reassignment (≥12h): Usually no fine
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      Close to deadline (6-12h): Fine may apply
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      Very close (≤6h): Significant fine likely
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      Admin has final discretion on enforcement
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Input and Additional Warnings - Stacked vertically */}
          <div className="space-y-6">
            {/* Reason Input */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-8 rounded-2xl border-2 border-gray-200 shadow-lg space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-bold text-gray-900 text-xl mb-2">Reassignment Reason</h3>
                <p className="text-gray-600">Please select the primary reason for reassigning this order</p>
              </div>
              
              <div>
                <Label className="text-base font-semibold text-gray-700 mb-3 block">
                  Reason for Reassignment *
                </Label>
                <Select value={selectedReason} onValueChange={handleReasonChange}>
                  <SelectTrigger className="mt-2 h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a reason for reassignment" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                    <SelectItem value="unable_to_meet_deadline" className="py-3">Unable to meet deadline</SelectItem>
                    <SelectItem value="technical_difficulties" className="py-3">Technical difficulties</SelectItem>
                    <SelectItem value="personal_emergency" className="py-3">Personal emergency</SelectItem>
                    <SelectItem value="workload_conflict" className="py-3">Workload conflict</SelectItem>
                    <SelectItem value="client_requirements_changed" className="py-3">Client requirements changed</SelectItem>
                    <SelectItem value="quality_concerns" className="py-3">Quality concerns</SelectItem>
                    <SelectItem value="other" className="py-3">Other reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === 'other' && (
                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                  <Label htmlFor="customReason" className="text-base font-semibold text-gray-700 mb-3 block">
                    Please specify the reason *
                  </Label>
                  <Textarea
                    id="customReason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide a detailed explanation for the reassignment..."
                    className="mt-2 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Provide as much detail as possible to help administrators understand your situation.
                  </p>
                </div>
              )}

              {selectedReason && selectedReason !== 'other' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-blue-800">
                      <p className="font-bold text-lg mb-2">Selected Reason:</p>
                      <p className="text-lg capitalize font-medium">{selectedReason.replace(/_/g, ' ')}</p>
                      <p className="text-sm opacity-80 mt-2">
                        This reason will be logged and reviewed by administrators.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Warnings */}
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-orange-100 rounded-full shadow-lg">
                  <Clock className="h-7 w-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-800 mb-4 text-xl">Important Consequences</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shadow-sm"></div>
                      <span className="text-orange-800 text-base font-medium">Order returns to Available status</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shadow-sm"></div>
                      <span className="text-orange-800 text-base font-medium">Your progress will be lost</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shadow-sm"></div>
                      <span className="text-orange-800 text-base font-medium">Reason is permanently logged</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shadow-sm"></div>
                      <span className="text-orange-800 text-base font-medium">Admin may apply fines</span>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-100 rounded-xl border-2 border-orange-200 shadow-md">
                    <p className="text-orange-800 text-base font-bold text-center">
                      ⚠️ This action cannot be undone. Please ensure you have a valid reason for reassignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Processing Reassignment...</p>
                  <p className="text-xs opacity-80">Please wait while we process your request</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
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
              disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim()) || isSubmitting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Confirm Reassignment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
