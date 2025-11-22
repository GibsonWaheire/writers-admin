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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0 shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
        </div>

        <DialogHeader className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Submit to Admin Review
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Submit your completed work for quality review and approval
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 shadow-lg backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Order Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">Title</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 line-clamp-2">{order.title}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-green-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Pages</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{order.pages}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-purple-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Words</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{order.words?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-700 font-medium">CPP</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">KES {order.cpp?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/50 shadow-lg backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Important: Admin Review Process</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Your work will be reviewed by administrators first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Admin may request revisions before client delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Quality standards must be met before client review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>This ensures consistent quality across all orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Upload Completed Work *</Label>
              <div className="mt-3 bg-gradient-to-r from-white/80 to-gray-50/80 border-2 border-dashed border-blue-300/50 rounded-xl p-8 text-center hover:border-blue-400/70 transition-colors duration-200">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-sm text-gray-700">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx,.csv,.odt,.ods,.odp"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(handleFileUpload);
                      }
                    }}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), CSV, TXT, RTF, and more
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Uploaded Files:</Label>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="bg-gradient-to-r from-white/90 to-blue-50/50 border border-blue-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{file.originalName}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 transition-colors duration-200"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50 shadow-lg backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Additional Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="estimatedCompletionTime" className="text-sm font-medium text-amber-800">Estimated Completion Time</Label>
                <Input
                  id="estimatedCompletionTime"
                  value={estimatedCompletionTime}
                  onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                  placeholder="e.g., 2 hours, 1 day, etc."
                  className="mt-2 bg-white/80 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200/50"
                />
                <p className="text-xs text-amber-700 mt-2">
                  How long did it take you to complete this work?
                </p>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-amber-800">Notes for Admin Review</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes, challenges faced, or additional context for the admin reviewer..."
                  className="mt-2 bg-white/80 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200/50 resize-none"
                  rows={3}
                />
                <p className="text-xs text-amber-700 mt-2">
                  Optional: Provide context about your work process or any challenges encountered.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Checklist */}
          <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 shadow-lg backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Submission Checklist:</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Work is complete and meets requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Files are properly formatted and readable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>All instructions have been followed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Work has been proofread and edited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ready for admin quality review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative pt-6 mt-6 border-t border-gradient-to-r from-transparent via-gray-300 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 -mx-6 -mb-6 pb-6 px-6 rounded-b-lg"></div>
            <div className="relative flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
