import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertTriangle, FileText, Upload, CheckCircle, RefreshCw } from 'lucide-react';
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        files: uploadedFiles,
        notes: notes.trim(),
        revisionNotes: revisionNotes.trim() || undefined
      });
      onClose();
      setNotes('');
      setRevisionNotes('');
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

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Upload Revised Work *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="revision-file-upload" className="cursor-pointer">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </label>
                  <input
                    id="revision-file-upload"
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
                      <span className="text-sm font-medium">{file.filename}</span>
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
              disabled={!isFormValid || !revisionNotes.trim() || isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Submit Revision
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
