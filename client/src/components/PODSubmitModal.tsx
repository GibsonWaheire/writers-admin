import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, FileText, Upload, CheckCircle, Send } from 'lucide-react';
import type { PODOrder } from '../types/pod';

interface PODSubmitModalProps {
  order: PODOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: {
    files: File[];
    notes: string;
  }) => void;
}

export function PODSubmitModal({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit 
}: PODSubmitModalProps) {
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        files: uploadedFiles,
        notes: notes.trim()
      });
      onClose();
      setNotes('');
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
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            {order.status === 'Revision Required' ? 'Resubmit POD Order After Revision' : 'Submit POD Order to Admin'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {order.status === 'Revision Required' 
              ? 'Upload revised work and resubmit to admin for review'
              : 'Upload completed work and submit to admin for review and approval'
            }
          </DialogDescription>
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
                  <FileText className="h-4 w-4 text-orange-600" />
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
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">POD Amount</span>
                    <div className="text-2xl font-bold text-green-600">
                      KES {(order.pages * 350).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                  <p className="text-sm font-medium text-gray-700">Ready for Admin Review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Information - Show only for revision orders */}
          {order.status === 'Revision Required' && order.revisionNotes && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-2">Revision Required - Previous Feedback</p>
                  <div className="bg-white p-3 rounded border mt-2">
                    <p className="text-gray-800">{order.revisionNotes}</p>
                    {order.revisionCount && order.revisionCount > 1 && (
                      <p className="text-xs text-gray-600 mt-2">
                        This is revision #{order.revisionCount} for this order.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className={`border rounded-lg p-4 ${
            order.status === 'Revision Required' 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                order.status === 'Revision Required' ? 'text-orange-600' : 'text-blue-600'
              }`} />
              <div className={`text-sm ${
                order.status === 'Revision Required' ? 'text-orange-800' : 'text-blue-800'
              }`}>
                <p className="font-medium mb-2">
                  {order.status === 'Revision Required' 
                    ? 'Important: POD Order Resubmission Process'
                    : 'Important: POD Order Submission Process'
                  }
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload the {order.status === 'Revision Required' ? 'revised' : 'completed'} work files</li>
                  <li>Admin will review your {order.status === 'Revision Required' ? 'resubmission' : 'submission'}</li>
                  <li>Once approved, order will be marked as ready for delivery</li>
                  <li>You will then coordinate delivery with the client</li>
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

          {/* Additional Information */}
          <div>
            <Label htmlFor="notes" className="font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes, completion details, or additional context for admin review..."
              className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Provide context about your work, any special considerations, or notes for admin review.
            </p>
          </div>

          {/* Submission Checklist */}
          <div className={`border rounded-lg p-4 ${
            order.status === 'Revision Required' 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`h-5 w-5 mt-0.5 ${
                order.status === 'Revision Required' ? 'text-orange-600' : 'text-green-600'
              }`} />
              <div className={`text-sm ${
                order.status === 'Revision Required' ? 'text-orange-800' : 'text-green-800'
              }`}>
                <p className="font-medium mb-2">
                  {order.status === 'Revision Required' ? 'Resubmission Checklist:' : 'Submission Checklist:'}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {order.status === 'Revision Required' ? (
                    <>
                      <li>✅ Revision feedback has been addressed</li>
                      <li>✅ All requested changes have been made</li>
                      <li>✅ Work quality has been improved</li>
                      <li>✅ Files are properly formatted and readable</li>
                      <li>✅ Work has been proofread and edited</li>
                      <li>✅ Ready for admin review and approval</li>
                    </>
                  ) : (
                    <>
                      <li>✅ Work is complete and meets requirements</li>
                      <li>✅ Files are properly formatted and readable</li>
                      <li>✅ All instructions have been followed</li>
                      <li>✅ Work has been proofread and edited</li>
                      <li>✅ Ready for admin review and approval</li>
                      <li>✅ All necessary files are uploaded</li>
                    </>
                  )}
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
                  <Send className="h-5 w-5 mr-2" />
                  Submit to Admin
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
