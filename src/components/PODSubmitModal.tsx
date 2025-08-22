import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { AlertTriangle, FileText, Upload, CheckCircle, Truck, Calendar } from 'lucide-react';
import type { PODOrder } from '../types/pod';

interface PODSubmitModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: {
    files: File[];
    notes: string;
    estimatedDeliveryTime?: string;
    deliveryAddress?: string;
    clientContactInfo?: string;
  }) => void;
}

export function PODSubmitModal({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit 
}: PODSubmitModalProps) {
  const [notes, setNotes] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientContactInfo, setClientContactInfo] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        files: uploadedFiles,
        notes: notes.trim(),
        estimatedDeliveryTime: estimatedDeliveryTime.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        clientContactInfo: clientContactInfo.trim() || undefined
      });
      onClose();
      setNotes('');
      setEstimatedDeliveryTime('');
      setDeliveryAddress('');
      setClientContactInfo('');
      setUploadedFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = uploadedFiles.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-blue-100 rounded-full">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            Submit POD Order for Delivery
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Upload completed work and provide delivery information for this POD order
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              POD Order Summary
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
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Pages</span>
                  <p className="font-semibold text-gray-900">{order.pages}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Words</span>
                  <p className="font-semibold text-gray-900">{order.words.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Deadline</span>
                  <p className="font-semibold text-gray-900">{new Date(order.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
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

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Important: POD Delivery Process</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload the completed work files</li>
                  <li>Provide delivery information and timing</li>
                  <li>You will be responsible for physical delivery</li>
                  <li>Payment must be collected upon successful delivery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Upload Completed Work *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="pod-file-upload" className="cursor-pointer">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </label>
                  <input
                    id="pod-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(handleFileUpload);
                      }
                    }}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT, RTF files accepted
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Uploaded Files:</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              Delivery Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="estimatedDeliveryTime" className="font-medium text-gray-700">
                  Estimated Delivery Time
                </Label>
                <Input
                  id="estimatedDeliveryTime"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  placeholder="e.g., 2 hours, 1 day, etc."
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  When do you expect to deliver this order?
                </p>
              </div>

              <div>
                <Label htmlFor="deliveryAddress" className="font-medium text-gray-700">
                  Delivery Address
                </Label>
                <Input
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Client delivery address"
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Where will you deliver this order?
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="clientContactInfo" className="font-medium text-gray-700">
                Client Contact Information
              </Label>
              <Input
                id="clientContactInfo"
                value={clientContactInfo}
                onChange={(e) => setClientContactInfo(e.target.value)}
                placeholder="Client phone, email, or contact details"
                className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                How can you contact the client for delivery coordination?
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="notes" className="font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes, delivery instructions, or additional context..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Provide context about your delivery plans or any special requirements.
            </p>
          </div>

          {/* Submission Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">Submission Checklist:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>✅ Work is complete and meets requirements</li>
                  <li>✅ Files are properly formatted and readable</li>
                  <li>✅ All instructions have been followed</li>
                  <li>✅ Work has been proofread and edited</li>
                  <li>✅ Ready for physical delivery to client</li>
                  <li>✅ Payment collection plan is in place</li>
                </ul>
              </div>
            </div>
          </div>

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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit for Delivery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
