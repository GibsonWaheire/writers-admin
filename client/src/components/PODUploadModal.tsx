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
  DollarSign,
  CheckCircle
} from 'lucide-react';
import type { PODOrder, PaperType, CitationFormat } from '../types/pod';

interface PODUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (podOrderData: Partial<PODOrder>) => void;
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

const DEADLINE_OPTIONS = [
  { value: '24', label: '24 Hours', color: 'bg-red-100 text-red-800', multiplier: 1.5, description: 'Very Urgent' },
  { value: '48', label: '48 Hours', color: 'bg-orange-100 text-orange-800', multiplier: 1.3, description: 'Urgent' },
  { value: '72', label: '72 Hours', color: 'bg-yellow-100 text-yellow-800', multiplier: 1.1, description: 'Standard' },
  { value: '96', label: '96 Hours', color: 'bg-green-100 text-green-800', multiplier: 1.0, description: 'Flexible' }
];

export function PODUploadModal({ isOpen, onClose, onSubmit }: PODUploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    discipline: '',
    paperType: '' as PaperType | '',
    citationFormat: '' as CitationFormat | '',
    pages: '',
    words: '',
    deadlineHours: '48',
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

  // Auto-calculate POD amount based on pages (350 KES per page)
  const calculatePODAmount = (pages: number) => {
    return pages * 350;
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

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.discipline) newErrors.discipline = 'Discipline is required';
    if (!formData.paperType) newErrors.paperType = 'Paper type is required';
    if (!formData.citationFormat) newErrors.citationFormat = 'Citation format is required';
    if (!formData.pages || parseInt(formData.pages) <= 0) newErrors.pages = 'Valid page count is required';
    if (!formData.deadlineHours) newErrors.deadlineHours = 'Deadline is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const podOrderData = {
        ...formData,
        pages: parseInt(formData.pages),
        words: parseInt(formData.words),
        deadlineHours: parseInt(formData.deadlineHours),
        paperType: formData.paperType || undefined,
        citationFormat: formData.citationFormat || undefined,
        isDraft
      };

      await onSubmit(podOrderData);
      
      if (!isDraft) {
        // Reset form on successful submission
        setFormData({
          title: '',
          description: '',
          subject: '',
          discipline: '',
          paperType: '',
          citationFormat: '',
          pages: '',
          words: '',
          deadlineHours: '48',
          additionalInstructions: '',
          isDraft: false
        });
        setUploadedFiles([]);
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit POD order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(true);
  };

  const selectedDeadline = DEADLINE_OPTIONS.find(d => d.value === formData.deadlineHours);
  const podAmount = formData.pages ? calculatePODAmount(parseInt(formData.pages)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-emerald-50 border-0 shadow-2xl"
        aria-describedby="upload-pod-order-description"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-transparent to-emerald-100/30 rounded-lg"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              Upload New POD Order
            </DialogTitle>
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                💰 <strong>POD Order:</strong> Payment on delivery. Writers will be paid KES 350 per page upon successful delivery.
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/70 backdrop-blur-sm border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  Basic Information
                </h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Order Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter order title"
                      className={errors.title ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="e.g., Psychology, Business, Engineering"
                      className={errors.subject ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paperType">Paper Type *</Label>
                    <Select value={formData.paperType} onValueChange={(value) => handleInputChange('paperType', value)}>
                      <SelectTrigger className={errors.paperType ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}>
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                        {PAPER_TYPES.map(type => (
                          <SelectItem 
                            key={type} 
                            value={type}
                            className="px-4 py-3 hover:bg-green-50 focus:bg-green-100 cursor-pointer border-b border-gray-100 last:border-b-0"
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
                      <SelectTrigger className={errors.discipline ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}>
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
                      <SelectTrigger className={errors.citationFormat ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}>
                        <SelectValue placeholder="Select citation format" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                        {CITATION_FORMATS.map(format => (
                          <SelectItem 
                            key={format} 
                            value={format}
                            className="px-4 py-3 hover:bg-green-50 focus:bg-green-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.citationFormat && <p className="text-sm text-red-500">{errors.citationFormat}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pages">Number of Pages *</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => handleInputChange('pages', e.target.value)}
                      placeholder="Enter number of pages"
                      className={errors.pages ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}
                    />
                    {errors.pages && <p className="text-sm text-red-500">{errors.pages}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="words">Word Count</Label>
                    <Input
                      id="words"
                      type="number"
                      value={formData.words}
                      onChange={(e) => handleInputChange('words', e.target.value)}
                      placeholder="Auto-calculated from pages"
                      className="border-gray-300 bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500">1 page = 275 words (auto-calculated)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadlineHours">Deadline *</Label>
                    <Select value={formData.deadlineHours} onValueChange={(value) => handleInputChange('deadlineHours', value)}>
                      <SelectTrigger className={errors.deadlineHours ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}>
                        <SelectValue placeholder="Select deadline" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                        {DEADLINE_OPTIONS.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="px-4 py-3 hover:bg-green-50 focus:bg-green-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={option.color}>{option.label}</Badge>
                              <span className="text-sm text-gray-600">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.deadlineHours && <p className="text-sm text-red-500">{errors.deadlineHours}</p>}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="description">Order Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide detailed description of the order requirements..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                  <Textarea
                    id="additionalInstructions"
                    value={formData.additionalInstructions}
                    onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
                    placeholder="Any additional instructions, requirements, or special notes..."
                    rows={3}
                    className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* POD Pricing Information */}
            {formData.pages && (
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-0 shadow-xl ring-1 ring-green-200/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                    <div className="p-1.5 rounded-lg bg-green-100">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    POD Pricing Information
                  </h3>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-4 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md border border-green-100/50">
                      <div className="font-bold text-xl text-green-600 mb-1">{formData.pages}</div>
                      <div className="text-gray-600 font-medium">Pages</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100/50">
                      <div className="font-bold text-xl text-emerald-600 mb-1">{formData.words}</div>
                      <div className="text-gray-600 font-medium">Words</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-blue-100/50">
                      <div className="font-bold text-xl text-blue-600 mb-1">350</div>
                      <div className="text-gray-600 font-medium">KES/Page</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md border border-purple-100/50">
                      <div className="font-bold text-xl text-purple-600 mb-1">
                        {selectedDeadline?.label || '48 Hours'}
                      </div>
                      <div className="text-gray-600 font-medium">Deadline</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-white via-green-50/30 to-white rounded-xl border border-green-100/50 shadow-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">Base Price:</span>
                      <span className="font-semibold text-gray-800">{formData.pages ? `${parseInt(formData.pages) * 350} KES` : '0 KES'}</span>
                    </div>
                    {selectedDeadline && selectedDeadline.multiplier > 1 && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Urgency Multiplier:</span>
                        <span className="font-semibold text-orange-600">× {selectedDeadline.multiplier}</span>
                      </div>
                    )}
                    <Separator className="my-3 bg-gradient-to-r from-transparent via-green-200 to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">Total POD Amount:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {podAmount} KES
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ~{Math.round(podAmount / 130)} USD
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span><strong>POD Terms:</strong> Writer will be paid {podAmount} KES upon successful delivery to client</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    💡 POD amount is automatically calculated based on pages (350 KES/page) and deadline urgency. This is the amount the writer will receive upon delivery.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* File Upload */}
            <Card className="bg-white/70 backdrop-blur-sm border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <Upload className="h-4 w-4 text-green-600" />
                  </div>
                  Additional Files (Optional)
                </h3>
              
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center hover:border-green-300 hover:bg-green-50/30 transition-all duration-300 bg-gradient-to-br from-green-50/20 to-emerald-50/20">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-3 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400"
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
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-green-100/50 bg-gradient-to-r from-green-50/30 via-white to-emerald-50/30">
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
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating POD Order...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Create POD Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
