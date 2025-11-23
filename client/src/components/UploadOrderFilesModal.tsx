import { useState, useEffect, useRef } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log when isOpen changes
  useEffect(() => {
    console.log('📎 UploadOrderFilesModal: isOpen changed to:', isOpen);
    console.log('📎 UploadOrderFilesModal: order.status =', order.status);
  }, [isOpen, order.status]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploadedFiles([]);
      setIsUploading(false);
      setIsDragging(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = (file: File) => {
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`File "${file.name}" is too large. Maximum file size is 50MB.`);
      return;
    }

    setUploadedFiles(prev => {
      // Check for duplicates by filename + size
      const exists = prev.some(
        (f) => (f.originalName || f.filename) === file.name && f.size === file.size
      );

      if (exists) {
        alert(`File "${file.name}" (${formatFileSize(file.size)}) is already in the upload list.`);
        return prev; // don't add duplicate
      }

      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };

      return [...prev, newFile];
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      Array.from(files).forEach(handleFileUpload);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
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
      console.log('📤 UploadOrderFilesModal: Uploading files:', {
        count: uploadedFiles.length,
        files: uploadedFiles.map(f => ({ name: f.originalName || f.filename, size: f.size }))
      });
      
      await onUpload(uploadedFiles);
      
      console.log('✅ UploadOrderFilesModal: Files uploaded successfully');
      
      // Reset state
      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Close modal after successful upload
      onClose();
    } catch (error) {
      console.error('❌ UploadOrderFilesModal: Error uploading files:', error);
      alert(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  console.log('📎 UploadOrderFilesModal: Rendering with isOpen =', isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className={`p-2 rounded-xl shadow-lg ${order.status === 'Revision' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              <Upload className="h-6 w-6 text-white" />
            </div>
            {order.status === 'Revision' ? 'Upload Revision Files' : 'Upload Order Files'}
          </DialogTitle>
          <DialogDescription>
            {order.status === 'Revision' 
              ? 'Upload your revised work files. These should be NEW files addressing the revision feedback. After uploading, you\'ll be able to submit the revision for admin review.'
              : 'Upload your completed work files. You can upload multiple files. After uploading, you\'ll be able to submit the work for admin review.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Revision Warning */}
          {order.status === 'Revision' && order.revisionExplanation && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Revision Required</h4>
                  <p className="text-sm text-red-800 mb-3 whitespace-pre-wrap">{order.revisionExplanation}</p>
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ Please upload NEW files that address the revision feedback above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className={`border rounded-lg p-4 ${order.status === 'Revision' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className={`h-4 w-4 ${order.status === 'Revision' ? 'text-orange-600' : 'text-blue-600'}`} />
              <span className={`font-medium ${order.status === 'Revision' ? 'text-orange-900' : 'text-blue-900'}`}>Order: {order.title}</span>
            </div>
            <div className={`text-sm ${order.status === 'Revision' ? 'text-orange-700' : 'text-blue-700'}`}>
              {order.pages} pages • {order.words?.toLocaleString() || 'N/A'} words
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Upload Files *</Label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : order.status === 'Revision'
                  ? 'border-orange-300 hover:border-orange-400 bg-orange-50/50'
                  : 'border-blue-300 hover:border-blue-400 bg-blue-50/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                order.status === 'Revision' ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                <Upload className={`h-10 w-10 ${order.status === 'Revision' ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <div className="text-sm text-gray-700">
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📎 UploadOrderFilesModal: File input label clicked');
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    } else {
                      console.error('❌ UploadOrderFilesModal: fileInputRef is null');
                    }
                  }}
                >
                  <span className={`font-medium hover:underline transition-colors ${
                    order.status === 'Revision' ? 'text-orange-600 hover:text-orange-500' : 'text-blue-600 hover:text-blue-500'
                  }`}>
                    Click to browse files
                  </span>
                  {' '}or drag and drop files here
                </label>
                <div className="mt-2 text-xs text-gray-500">
                  {order.status === 'Revision' 
                    ? 'Select NEW revision files that address the feedback above. You can select multiple files at once.'
                    : 'You can select multiple files at once'}
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx,.csv,.odt,.ods,.odp,.zip,.rar,.7z,image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFiles(files);
                    }
                    // Reset input to allow selecting the same file again
                    if (e.target) {
                      e.target.value = '';
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
                {uploadedFiles.map((file, index) => (
                  <div key={`upload-order-${order.id}-${file.id || file.filename || index}-${index}-${file.uploadedAt || Date.now()}`} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${order.status === 'Revision' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                        <FileText className={`h-4 w-4 ${order.status === 'Revision' ? 'text-orange-600' : 'text-blue-600'}`} />
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
                console.log('📤 UploadOrderFilesModal: Upload button clicked', {
                  fileCount: uploadedFiles.length,
                  isUploading,
                  orderStatus: order.status
                });
                handleUpload();
              }}
              disabled={uploadedFiles.length === 0 || isUploading}
              className={`text-white ${
                order.status === 'Revision' 
                  ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  {order.status === 'Revision' ? 'Uploading Revision Files...' : 'Uploading...'}
                </>
              ) : uploadedFiles.length === 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {order.status === 'Revision' ? 'Upload Revision Files Required' : 'Upload Files Required'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {order.status === 'Revision' 
                    ? `Upload Revision Files (${uploadedFiles.length})`
                    : `Upload Files (${uploadedFiles.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

