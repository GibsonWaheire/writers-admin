import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Order, UploadedFile } from '../types/order';

interface UploadOrderFilesModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: UploadedFile[]) => void;
}

export function UploadOrderFilesModal({ 
  order, 
  isOpen, 
  onClose, 
  onUpload 
}: UploadOrderFilesModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (file: File) => {
    const newFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file.');
      return;
    }
    
    setIsUploading(true);
    try {
      await onUpload(uploadedFiles);
      onClose();
      setUploadedFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Upload className="h-6 w-6 text-white" />
            </div>
            Upload Order Files
          </DialogTitle>
          <DialogDescription>
            Upload your completed work files. You can upload multiple files. After uploading, you'll be able to submit the work for admin review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Order: {order.title}</span>
            </div>
            <div className="text-sm text-blue-700">
              {order.pages} pages • {order.words?.toLocaleString() || 'N/A'} words
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Upload Files *</Label>
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <div className="text-sm text-gray-700">
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

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length}):</Label>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Files ready</span>
                  </div>
                </div>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{file.originalName}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">No files uploaded yet</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1 ml-6">
                  Please upload your completed work files above.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpload();
              }}
              disabled={uploadedFiles.length === 0 || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : uploadedFiles.length === 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Upload Files Required
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Upload Files ({uploadedFiles.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

