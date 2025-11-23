import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import type { Order, UploadedFile } from '../types/order';

interface SubmitRevisionModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: {
    files: UploadedFile[];
    notes: string;
    revisionNotes?: string;
  }) => void;
}

export function SubmitRevisionModal({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit 
}: SubmitRevisionModalProps) {
  const [notes, setNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use revision files (or uploadedFiles as fallback for backward compatibility)
  const uploadedFiles = order.revisionFiles || order.uploadedFiles || [];

  const handleSubmit = async (e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validation: Must have at least one file uploaded
    if (uploadedFiles.length === 0) {
      alert('Please upload revision files first using the "Upload Revision Files" button.');
      return;
    }
    // Validation: Must have revision explanation
    if (!revisionNotes.trim()) {
      alert('Please provide a revision summary explaining what changes were made.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        files: uploadedFiles,
        notes: notes.trim(),
        revisionNotes: revisionNotes.trim()
      });
      // Reset form state
      setNotes('');
      setRevisionNotes('');
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to submit revision:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = uploadedFiles.length > 0 && revisionNotes.trim().length > 0;
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNotes('');
      setRevisionNotes('');
    }
  }, [isOpen]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-orange-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
            Submit Revision
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Upload your revised work and provide notes about the changes made
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-4 w-4 text-orange-600" />
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Deadline</span>
                  <p className="font-semibold text-gray-900">{new Date(order.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                    <div className="text-lg font-bold text-orange-600">Revision Required</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Action</span>
                  <p className="text-sm font-medium text-gray-700">Submit Revised Work</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-2">Important: Revision Submission Process</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload the revised work files</li>
                  <li>Explain what changes were made</li>
                  <li>Admin will review your revision</li>
                  <li>Ensure all feedback has been addressed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Uploaded Files Display */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Revision Files *</Label>
            {uploadedFiles.length > 0 ? (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={`submit-revision-${order.id}-${file.id || file.filename || index}-${index}-${file.uploadedAt || Date.now()}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{file.originalName || file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{uploadedFiles.length} file(s) ready for submission</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">No revision files uploaded</p>
                    <p className="text-xs mt-1">Please upload revision files first using the "Upload Revision Files" button.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Revision Notes */}
          <div>
            <Label htmlFor="revisionNotes" className="font-medium text-gray-700">
              Revision Summary *
            </Label>
            <Textarea
              id="revisionNotes"
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe what changes you made to address the revision feedback..."
              className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Required: Explain what changes were made to address the revision requirements.
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context, special considerations, or notes for admin review..."
              className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Provide additional context about your revision or any special notes.
            </p>
          </div>

          {/* Revision Checklist */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-2">Revision Checklist:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>✅ All revision feedback has been addressed</li>
                  <li>✅ Work quality has been improved</li>
                  <li>✅ Files are properly formatted and readable</li>
                  <li>✅ Revision summary is provided</li>
                  <li>✅ Work has been proofread and edited</li>
                  <li>✅ Ready for admin review</li>
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
              disabled={!isFormValid || !revisionNotes.trim() || isSubmitting || uploadedFiles.length === 0}
              className={`px-8 py-2 shadow-lg transition-all duration-200 ${
                isFormValid && revisionNotes.trim() && uploadedFiles.length > 0
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:shadow-xl'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : uploadedFiles.length === 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Upload Files Required
                </>
              ) : !revisionNotes.trim() ? (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Revision Summary Required
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Submit Revision ({uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
