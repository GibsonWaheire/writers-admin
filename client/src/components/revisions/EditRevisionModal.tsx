/**
 * Edit Revision Modal
 * Allows writers to edit revision notes and manage files
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  X, 
  FileText, 
  Trash2, 
  Save, 
  Upload,
  AlertCircle
} from 'lucide-react';
import type { Order, UploadedFile } from '../../types/order';

export interface EditRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSave: (data: {
    revisionNotes?: string;
    files?: UploadedFile[];
  }) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onUploadFiles: (files: File[]) => Promise<UploadedFile[]>;
}

export function EditRevisionModal({
  isOpen,
  onClose,
  order,
  onSave,
  onDeleteFile,
  onUploadFiles
}: EditRevisionModalProps) {
  const [revisionNotes, setRevisionNotes] = useState(order.revisionResponseNotes || '');
  const [files, setFiles] = useState<UploadedFile[]>(order.revisionFiles || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRevisionNotes(order.revisionResponseNotes || '');
      setFiles(order.revisionFiles || []);
      setError(null);
    }
  }, [isOpen, order]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        revisionNotes: revisionNotes.trim(),
        files
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save revision');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this file?')) return;
    
    try {
      setIsDeleting(fileId);
      await onDeleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setError(null);
      const fileArray = Array.from(selectedFiles);
      
      // Filter out duplicates before uploading
      const newFiles = fileArray.filter(file => {
        const exists = files.some(
          (f) => (f.originalName || f.filename) === file.name && f.size === file.size
        );
        if (exists) {
          setError(`File "${file.name}" (${formatFileSize(file.size)}) is already uploaded.`);
        }
        return !exists;
      });

      if (newFiles.length === 0) {
        // All files were duplicates
        e.target.value = '';
        return;
      }

      const uploadedFiles = await onUploadFiles(newFiles);
      setFiles(prev => [...prev, ...uploadedFiles]);
      // Reset input
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Edit Revision: {order.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Revision Explanation (Read-only) */}
          {order.revisionExplanation && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Admin's Revision Request</h4>
                  <p className="text-sm text-red-800 whitespace-pre-wrap">{order.revisionExplanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Revision Notes */}
          <div>
            <Label htmlFor="revisionNotes" className="text-base font-medium">
              Your Revision Notes <span className="text-gray-500 text-sm">(Optional)</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Describe the changes you made to address the revision request
            </p>
            <Textarea
              id="revisionNotes"
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="E.g., Fixed formatting issues, updated citations, revised introduction section..."
              className="min-h-[120px]"
            />
          </div>

          {/* Files Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">
                Revision Files
                {files.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </Label>
              <div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".doc,.docx,.pdf,.txt,.rtf,.pages"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
              </div>
            </div>

            {files.length > 0 ? (
              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                {files.map((file, index) => (
                  <div
                    key={`edit-revision-${order.id}-${file.id || file.filename || index}-${index}-${file.uploadedAt || Date.now()}`}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {file.originalName || file.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={isDeleting === file.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === file.id ? (
                        'Removing...'
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium mb-1">No files uploaded</p>
                <p className="text-sm text-gray-400 mb-4">
                  Upload revised files to address the revision request
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || files.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

