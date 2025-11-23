import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Edit, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle,
  Save,
  X,
  FileText,
  Clock,
  User
} from 'lucide-react';
import type { Order, UploadedFile } from '../types/order';

interface OrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (orderId: string, updatedOrder: Partial<Order>) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onAddMessage: (orderId: string, message: string, attachments: UploadedFile[], isNotification: boolean) => Promise<void>;
  userRole: string;
}

export function OrderManagementModal({
  isOpen,
  onClose,
  order,
  onSave,
  onDelete,
  onAddMessage,
  userRole
}: OrderManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isNotification, setIsNotification] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Guards to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  
  // Form fields for editing
  const [formData, setFormData] = useState<Partial<Order>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        title: order.title,
        description: order.description,
        discipline: order.discipline,
        paperType: order.paperType,
        pages: order.pages,
        words: order.words,
        format: order.format,
        deadline: order.deadline,
        requirements: order.requirements,
        totalPriceKES: order.totalPriceKES
      });
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    
    try {
      await onSave(order.id, formData);
      setIsEditing(false);
      // Reset form
      setFormData({
        title: order.title,
        description: order.description,
        discipline: order.discipline,
        paperType: order.paperType,
        pages: order.pages,
        words: order.words,
        format: order.format,
        deadline: order.deadline,
        requirements: order.requirements,
        totalPriceKES: order.totalPriceKES
      });
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    if (order.writerId || order.assignedWriter) {
      alert('Cannot delete assigned orders. Please reassign or cancel the order first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await onDelete(order.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handleAddMessage = async () => {
    if (!order || !newMessage.trim()) return;
    
    // Guard: Prevent duplicate submissions (React StrictMode protection)
    if (isSubmittingRef.current) {
      console.log('⚠️ OrderManagementModal: Already submitting message, skipping duplicate call');
      return;
    }

    // Mark as submitting
    isSubmittingRef.current = true;
    
    try {
      // Convert selected files to UploadedFile format
      const convertedFiles: UploadedFile[] = selectedFiles.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        filename: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin'
      }));
      
      await onAddMessage(order.id, newMessage, convertedFiles, isNotification);
      setNewMessage('');
      setSelectedFiles([]);
      setIsAddingMessage(false);
      setIsNotification(false);
    } catch (error) {
      console.error('Failed to add message:', error);
    } finally {
      // Reset submitting flag after a delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Guard: Prevent duplicate file additions
    setSelectedFiles(prev => {
      const newFiles: File[] = [];
      files.forEach(file => {
        // Check for duplicates by name + size
        const exists = prev.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists) {
          newFiles.push(file);
        }
      });
      return [...prev, ...newFiles];
    });
    
    // Reset input to prevent double-firing
    setTimeout(() => {
      if (event.target) {
        event.target.value = '';
      }
    }, 0);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!order) return null;

  const canDelete = !order.writerId && !order.assignedWriter;
  const isAssigned = order.writerId || order.assignedWriter;
  const hasAdminMessages = order.adminMessages && order.adminMessages.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Order Management - ${order.title}`}
    >
      <div className="space-y-6">
        {/* Order Status and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant={order.status === 'Available' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
            {isAssigned && (
              <Badge variant="outline">
                <User className="w-3 h-3 mr-1" />
                Assigned
              </Badge>
            )}
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(order.deadline).toLocaleDateString()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Order'}
                </Button>
                
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Order title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Discipline</label>
                  <select
                    value={formData.discipline || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discipline: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Discipline</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Economics">Economics</option>
                    <option value="Education">Education</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Law">Law</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Sociology">Sociology</option>
                    <option value="Political Science">Political Science</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Paper Type</label>
                  <select
                    value={formData.paperType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, paperType: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Paper Type</option>
                    <option value="Essay">Essay</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Literature Review">Literature Review</option>
                    <option value="Thesis">Thesis</option>
                    <option value="Dissertation">Dissertation</option>
                    <option value="Report">Report</option>
                    <option value="Annotated Bibliography">Annotated Bibliography</option>
                    <option value="Business Plan">Business Plan</option>
                    <option value="Marketing Analysis">Marketing Analysis</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Pages</label>
                  <Input
                    type="number"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of pages"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Total Price (KES)</label>
                  <Input
                    type="number"
                    value={formData.totalPriceKES || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalPriceKES: parseInt(e.target.value) || 0 }))}
                    placeholder="Price in KES"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <Input
                    type="datetime-local"
                    value={formData.deadline ? new Date(formData.deadline).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: new Date(e.target.value).toISOString() }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Order description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  value={formData.requirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Specific requirements"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={!formData.title}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Messages Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Admin Messages & Files</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingMessage(!isAddingMessage)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isAddingMessage ? 'Cancel' : 'Add Message'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Add Message Form */}
            {isAddingMessage && (
              <div className="space-y-4 p-4 border rounded-lg mb-4">
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNotification"
                      checked={isNotification}
                      onChange={(e) => setIsNotification(e.target.checked)}
                    />
                    <label htmlFor="isNotification" className="text-sm">
                      Send notification to writer
                    </label>
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attach Files
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                
                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected Files:</label>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button onClick={handleAddMessage} disabled={!newMessage.trim()}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingMessage(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Existing Messages */}
            {hasAdminMessages ? (
              <div className="space-y-3">
                {order.adminMessages?.map((msg, index) => (
                  <div key={msg.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.isNotification ? "destructive" : "secondary"}>
                          {msg.isNotification ? 'Notification' : 'Message'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(msg.sentAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{msg.message}</p>
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Attachments:</label>
                        {msg.attachments.map((file, fileIndex) => (
                          <div key={`msg-${msg.id}-attachment-${file.id || file.filename || fileIndex}-${fileIndex}`} className="flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="w-4 h-4" />
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              {file.originalName}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No admin messages yet</p>
            )}
          </CardContent>
        </Card>

        {/* Warning for Assigned Orders */}
        {isAssigned && isEditing && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Warning</span>
            </div>
            <p className="text-yellow-700 mt-1">
              This order is assigned to a writer. Any changes will be logged and the writer will be notified.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
