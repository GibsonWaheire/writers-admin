import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Upload, 
  FileText, 
  X,
  Save,
  Send
} from 'lucide-react';
import type { Order, PaperType, CitationFormat } from '../types/order';

interface UploadNewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Partial<Order>) => void;
}

const PAPER_TYPES: PaperType[] = [
  'Essay',
  'Report',
  'Thesis',
  'Dissertation',
  'Research Paper',
  'Literature Review',
  'Case Study',
  'Annotated Bibliography',
  'Technical Documentation',
  'Business Plan',
  'Marketing Analysis',
  'Other'
];

const CITATION_FORMATS: CitationFormat[] = [
  'APA',
  'MLA',
  'Harvard',
  'Chicago',
  'Vancouver',
  'IEEE',
  'Other'
];

const DISCIPLINES = [
  'Business Administration',
  'Computer Science',
  'Engineering',
  'Environmental Science',
  'Health Sciences',
  'Humanities',
  'Law',
  'Mathematics',
  'Medicine',
  'Nursing',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Social Sciences',
  'Sociology',
  'Statistics',
  'Technology',
  'Other'
];

const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800', multiplier: 1 },
  { value: 'urgent', label: 'Urgent', color: 'bg-yellow-100 text-yellow-800', multiplier: 1.2 },
  { value: 'very-urgent', label: 'Very Urgent', color: 'bg-red-100 text-red-800', multiplier: 1.5 }
];

export function UploadNewOrderModal({ isOpen, onClose, onSubmit }: UploadNewOrderModalProps) {
  const [formData, setFormData] = useState({
    paperType: '' as PaperType | '',
    title: '',
    description: '',
    discipline: '',
    citationFormat: '' as CitationFormat | '',
    pages: '',
    words: '',
    deadline: '',
    price: '',
    urgencyLevel: 'normal' as 'normal' | 'urgent' | 'very-urgent',
    additionalInstructions: '',
    isDraft: false
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculate word count from pages (1 page = 275 words)
  const calculateWordsFromPages = (pages: number) => {
    return pages * 275;
  };

  // Auto-calculate price based on pages and urgency
  const calculatePrice = (pages: number, urgency: string) => {
    const basePricePerPage = 350; // KES
    const urgencyMultiplier = URGENCY_LEVELS.find(u => u.value === urgency)?.multiplier || 1;
    return Math.round(pages * basePricePerPage * urgencyMultiplier);
  };

  const handleInputChange = (field: string, value: string | number) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update form data and handle auto-calculations
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // Auto-calculate word count when pages change
      if (field === 'pages' && typeof value === 'string' && value) {
        const pages = parseInt(value);
        if (!isNaN(pages) && pages > 0) {
          newFormData.words = calculateWordsFromPages(pages).toString();
        } else {
          newFormData.words = '';
        }
      }

      // Auto-calculate price when pages or urgency changes
      if (field === 'pages' || field === 'urgencyLevel') {
        const pages = parseInt(field === 'pages' ? value as string : newFormData.pages) || 0;
        const urgency = field === 'urgencyLevel' ? value as string : newFormData.urgencyLevel;
        
        if (pages > 0) {
          const price = calculatePrice(pages, urgency as 'normal' | 'urgent' | 'very-urgent');
          newFormData.price = price.toString();
        } else {
          newFormData.price = '';
        }
      }

      return newFormData;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paperType) newErrors.paperType = 'Paper type is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.discipline) newErrors.discipline = 'Discipline is required';
    if (!formData.citationFormat) newErrors.citationFormat = 'Citation format is required';
    if (!formData.pages || parseInt(formData.pages) <= 0) newErrors.pages = 'Valid page count is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';

    // Validate deadline is not in the past
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: Partial<Order> = {
        paperType: formData.paperType as PaperType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        discipline: formData.discipline,
        format: formData.citationFormat as CitationFormat,
        pages: parseInt(formData.pages),
        words: parseInt(formData.words),
        deadline: formData.deadline,
        price: parseFloat(formData.price),
        priceKES: parseFloat(formData.price),
        cpp: Math.round(parseFloat(formData.price) / parseInt(formData.pages)),
        totalPriceKES: parseFloat(formData.price),
        status: isDraft ? 'Draft' : 'Available',
        additionalInstructions: formData.additionalInstructions.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOverdue: false,
        confirmationStatus: 'pending',
        paymentType: 'advance',
        clientMessages: [],
        uploadedFiles: [], // Empty initially - writers will upload completed work files
        // Add urgency level tracking
        urgencyLevel: formData.urgencyLevel,
        // Add requirement file attachments (not uploadedFiles - those are for completed work)
        attachments: uploadedFiles.map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          filename: file.name,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString()
        }))
      };

      await onSubmit(orderData);
      
      // Show success message (you can customize this with a toast notification)
      if (!isDraft) {
        console.log('✅ Order created successfully and is now available for writers to pick up!');
        // Optional: Add toast notification here
        // toast.success('Order created successfully! Writers can now see and pick up this order.');
      } else {
        console.log('📝 Order saved as draft successfully!');
        // Optional: Add toast notification here
        // toast.success('Order saved as draft successfully!');
      }
      
      // Reset form
      setFormData({
        paperType: '',
        title: '',
        description: '',
        discipline: '',
        citationFormat: '',
        pages: '',
        words: '',
        deadline: '',
        price: '',
        urgencyLevel: 'normal',
        additionalInstructions: '',
        isDraft: false
      });
      setUploadedFiles([]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(true);
  };

  const urgencyLevel = URGENCY_LEVELS.find(u => u.value === formData.urgencyLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl"
        aria-describedby="upload-order-description"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-purple-100/30 rounded-lg"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative z-10">
                  <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Upload New Order
          </DialogTitle>
          <p id="upload-order-description" className="text-gray-600 mt-2 text-sm">
            Create a new writing order that will be immediately available for writers to pick up
          </p>
        </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  Basic Information
                </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paperType">Paper Type *</Label>
                  <Select value={formData.paperType} onValueChange={(value) => handleInputChange('paperType', value)}>
                    <SelectTrigger className={errors.paperType ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                      {PAPER_TYPES.map(type => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paperType && <p className="text-sm text-red-500">{errors.paperType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipline">Discipline *</Label>
                  <Select value={formData.discipline} onValueChange={(value) => handleInputChange('discipline', value)}>
                    <SelectTrigger className={errors.discipline ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}>
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                      {DISCIPLINES.map(discipline => (
                        <SelectItem 
                          key={discipline} 
                          value={discipline}
                          className="px-4 py-3 hover:bg-green-50 focus:bg-green-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {discipline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.discipline && <p className="text-sm text-red-500">{errors.discipline}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citationFormat">Citation Format *</Label>
                  <Select value={formData.citationFormat} onValueChange={(value) => handleInputChange('citationFormat', value)}>
                    <SelectTrigger className={errors.citationFormat ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                      {CITATION_FORMATS.map(format => (
                        <SelectItem 
                          key={format} 
                          value={format}
                          className="px-4 py-3 hover:bg-purple-50 focus:bg-purple-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.citationFormat && <p className="text-sm text-red-500">{errors.citationFormat}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                      {URGENCY_LEVELS.map(level => (
                        <SelectItem 
                          key={level.value} 
                          value={level.value}
                          className="px-4 py-4 hover:bg-orange-50 focus:bg-orange-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Badge className={`${level.color} px-3 py-1`}>{level.label}</Badge>
                            <span className="text-sm text-gray-600 font-medium">
                              {level.multiplier > 1 ? `+${Math.round((level.multiplier - 1) * 100)}%` : 'Standard'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Order Details */}
            <Card className="bg-white/70 backdrop-blur-sm border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  Order Details
                </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Topic / Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter the topic or title of the order"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description / Instructions *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide detailed description and instructions for the writer"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
                  <Textarea
                    id="additionalInstructions"
                    value={formData.additionalInstructions}
                    onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
                    placeholder="Any additional requirements, formatting notes, or special instructions"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Specifications & Pricing */}
            <Card className="bg-white/70 backdrop-blur-sm border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-800">
                  <div className="p-1.5 rounded-lg bg-purple-100">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  Specifications & Pricing
                </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages">Number of Pages *</Label>
                  <div className="relative">
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => handleInputChange('pages', e.target.value)}
                      placeholder="Enter page count"
                      className={`${errors.pages ? 'border-red-500' : ''} ${formData.pages ? 'bg-blue-50 border-blue-300' : ''}`}
                    />
                    {formData.pages && parseInt(formData.pages) > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Auto-calc enabled</Badge>
                      </div>
                    )}
                  </div>
                  {errors.pages && <p className="text-sm text-red-500">{errors.pages}</p>}
                  <p className="text-xs text-gray-500">
                    📊 Automatically calculates word count (275 words/page) and price (350 KES/page)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="words">Word Count</Label>
                  <div className="relative">
                    <Input
                      id="words"
                      type="number"
                      min="1"
                      value={formData.words}
                      onChange={(e) => handleInputChange('words', e.target.value)}
                      placeholder="Auto-calculated from pages"
                      className={formData.words ? 'bg-green-50 border-green-300' : ''}
                    />
                    {formData.words && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge className="bg-green-100 text-green-800 text-xs">Auto-calculated</Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    ✨ Auto-calculated from pages (275 words/page). You can manually override if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className={errors.deadline ? 'border-red-500' : ''}
                  />
                  {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES) *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="Auto-calculated from pages and urgency"
                      className={`${errors.price ? 'border-red-500' : ''} ${formData.price ? 'bg-green-50 border-green-300' : ''}`}
                    />
                    {formData.price && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge className="bg-green-100 text-green-800 text-xs">Auto-calculated</Badge>
                      </div>
                    )}
                  </div>
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                  
                  {/* Price Breakdown */}
                  {formData.pages && parseInt(formData.pages) > 0 && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Base rate:</span>
                          <span className="font-medium">{parseInt(formData.pages)} pages × 350 KES = {parseInt(formData.pages) * 350} KES</span>
                        </div>
                        {(() => {
                          const urgencyLevel = URGENCY_LEVELS.find(u => u.value === formData.urgencyLevel);
                          return urgencyLevel && urgencyLevel.multiplier > 1 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Urgency multiplier:</span>
                              <span className="font-medium">× {urgencyLevel.multiplier} ({urgencyLevel.label})</span>
                            </div>
                          );
                        })()}
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span className="text-gray-800">Total Price:</span>
                          <span className="text-green-600">{formData.price} KES</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    💡 Price is automatically calculated based on pages (350 KES/page) and urgency level. You can manually adjust if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* File Upload */}
            <Card className="bg-white/70 backdrop-blur-sm border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-800">
                  <div className="p-1.5 rounded-lg bg-orange-100">
                    <Upload className="h-4 w-4 text-orange-600" />
                  </div>
                  Additional Files (Optional)
                </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300 bg-gradient-to-br from-orange-50/20 to-yellow-50/20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-3 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <p className="text-sm text-gray-600 font-medium">
                    Upload requirements, instructions, screenshots, or reference materials
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT, RTF, JPG, PNG, GIF, SVG, and more
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => {
                      const isImage = file.type.startsWith('image/');
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            {isImage ? (
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">IMG</span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-800">{file.name}</span>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isImage ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {isImage ? 'Image' : 'Document'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

            {/* Order Summary */}
            {formData.pages && formData.price && (
              <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl ring-1 ring-blue-200/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800">
                    <div className="p-1.5 rounded-lg bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    Order Summary
                  </h3>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-4 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-blue-100/50">
                      <div className="font-bold text-xl text-blue-600 mb-1">{formData.pages}</div>
                      <div className="text-gray-600 font-medium">Pages</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md border border-green-100/50">
                      <div className="font-bold text-xl text-green-600 mb-1">{formData.words}</div>
                      <div className="text-gray-600 font-medium">Words</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100/50">
                      <div className="font-bold text-xl text-emerald-600 mb-1">{formData.price}</div>
                      <div className="text-gray-600 font-medium">KES</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md border border-purple-100/50">
                      <div className="font-bold text-xl text-purple-600 mb-1">
                        {urgencyLevel?.label || 'Normal'}
                      </div>
                      <div className="text-gray-600 font-medium">Priority</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-white via-blue-50/30 to-white rounded-xl border border-blue-100/50 shadow-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">Base Price:</span>
                      <span className="font-semibold text-gray-800">{formData.pages ? `${parseInt(formData.pages) * 350} KES` : '0 KES'}</span>
                    </div>
                    {urgencyLevel && urgencyLevel.multiplier > 1 && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Urgency Multiplier:</span>
                        <span className="font-semibold text-orange-600">× {urgencyLevel.multiplier}</span>
                      </div>
                    )}
                    <Separator className="my-3 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">Total Price:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formData.price} KES
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ~{Math.round(parseInt(formData.price || '0') / 130)} USD
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-blue-100/50 bg-gradient-to-r from-blue-50/30 via-white to-indigo-50/30">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Order...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Create Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
