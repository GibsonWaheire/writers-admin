import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

import { AlertTriangle, FileText, Upload, CheckCircle } from 'lucide-react';
import type { Order, UploadedFile } from '../types/order';

interface SubmitToAdminModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: {
    files: UploadedFile[];
    notes: string;
    estimatedCompletionTime?: string;
  }) => void;
}

export function SubmitToAdminModal({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit 
}: SubmitToAdminModalProps) {
  const [notes, setNotes] = useState('');
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        files: uploadedFiles,
        notes: notes.trim(),
        estimatedCompletionTime: estimatedCompletionTime.trim() || undefined
      });
      onClose();
      setNotes('');
      setEstimatedCompletionTime('');
      setUploadedFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    };
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const isFormValid = uploadedFiles.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Submit to Admin Review
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
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{order.pages}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Words:</span>
                <span className="font-medium">{order.words?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">CPP:</span>
                <span className="font-medium">KES {order.cpp?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Important: Admin Review Process</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your work will be reviewed by administrators first</li>
                  <li>Admin may request revisions before client delivery</li>
                  <li>Quality standards must be met before client review</li>
                  <li>This ensures consistent quality across all orders</li>
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
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </label>
                  <input
                    id="file-upload"
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
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{file.originalName}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
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
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Additional Information</h3>
            
            <div>
              <Label htmlFor="estimatedCompletionTime">Estimated Completion Time</Label>
              <Input
                id="estimatedCompletionTime"
                value={estimatedCompletionTime}
                onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                placeholder="e.g., 2 hours, 1 day, etc."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long did it take you to complete this work?
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes for Admin Review</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes, challenges faced, or additional context for the admin reviewer..."
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Provide context about your work process or any challenges encountered.
              </p>
            </div>
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
                  <li>✅ Ready for admin quality review</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
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
