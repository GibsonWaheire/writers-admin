import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Modal } from './ui/Modal';
import { 
  User, 
  GraduationCap, 
  FileText, 
  Upload, 
  Plus, 
  X, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import type { Writer } from '../types/user';

interface WriterApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: Partial<Writer>) => void;
  initialData?: Partial<Writer>;
}

export function WriterApplicationForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {} 
}: WriterApplicationFormProps) {
  // Personal Information
  const [nationalId, setNationalId] = useState(initialData.nationalId || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '');
  const [gender, setGender] = useState(initialData.gender || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  
  // Address
  const [address, setAddress] = useState({
    street: initialData.address?.street || '',
    city: initialData.address?.city || '',
    state: initialData.address?.state || '',
    zipCode: initialData.address?.zipCode || '',
    country: initialData.address?.country || 'Kenya'
  });
  
  // Education
  const [education, setEducation] = useState({
    level: initialData.education?.level || '',
    institution: initialData.education?.institution || '',
    fieldOfStudy: initialData.education?.fieldOfStudy || '',
    graduationYear: initialData.education?.graduationYear || new Date().getFullYear(),
    gpa: initialData.education?.gpa || ''
  });
  
  // Experience
  const [experience, setExperience] = useState({
    yearsOfWriting: initialData.experience?.yearsOfWriting || 0,
    previousPlatforms: initialData.experience?.previousPlatforms || [],
    writingSamples: initialData.experience?.writingSamples || [],
    certifications: initialData.experience?.certifications || []
  });
  
  // Specializations
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    initialData.specializations || []
  );
  const [newSpecialization, setNewSpecialization] = useState('');
  
  // Bio
  const [bio, setBio] = useState(initialData.bio || '');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const availableSpecializations = [
    'Academic Writing', 'Business Writing', 'Creative Writing', 'Technical Writing',
    'Research Papers', 'Essays', 'Dissertations', 'Thesis Writing', 'Literature Review',
    'Case Studies', 'Reports', 'Proposals', 'Marketing Content', 'Web Content',
    'Legal Writing', 'Medical Writing', 'Scientific Writing', 'Engineering',
    'Mathematics', 'Statistics', 'Psychology', 'Sociology', 'History',
    'Philosophy', 'Economics', 'Finance', 'Management', 'Nursing',
    'Computer Science', 'Information Technology', 'Education'
  ];
  
  const addSpecialization = (spec: string) => {
    if (spec && !selectedSpecializations.includes(spec)) {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };
  
  const removeSpecialization = (spec: string) => {
    setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
  };
  
  const addCustomSpecialization = () => {
    if (newSpecialization.trim()) {
      addSpecialization(newSpecialization.trim());
      setNewSpecialization('');
    }
  };
  
  const addWritingSample = () => {
    setExperience({
      ...experience,
      writingSamples: [
        ...experience.writingSamples,
        { title: '', subject: '', url: '', description: '' }
      ]
    });
  };
  
  const updateWritingSample = (index: number, field: string, value: string) => {
    const updated = [...experience.writingSamples];
    updated[index] = { ...updated[index], [field]: value };
    setExperience({ ...experience, writingSamples: updated });
  };
  
  const removeWritingSample = (index: number) => {
    setExperience({
      ...experience,
      writingSamples: experience.writingSamples.filter((_, i) => i !== index)
    });
  };
  
  const addCertification = () => {
    setExperience({
      ...experience,
      certifications: [
        ...experience.certifications,
        { name: '', issuer: '', dateObtained: '', expiryDate: '' }
      ]
    });
  };
  
  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...experience.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setExperience({ ...experience, certifications: updated });
  };
  
  const removeCertification = (index: number) => {
    setExperience({
      ...experience,
      certifications: experience.certifications.filter((_, i) => i !== index)
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nationalId.trim()) newErrors.nationalId = 'National ID is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!education.level) newErrors.educationLevel = 'Education level is required';
    if (!education.institution.trim()) newErrors.institution = 'Institution is required';
    if (selectedSpecializations.length === 0) newErrors.specializations = 'At least one specialization is required';
    if (!bio.trim() || bio.length < 100) newErrors.bio = 'Bio must be at least 100 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const applicationData: Partial<Writer> = {
      nationalId,
      dateOfBirth,
      gender: gender as Writer['gender'],
      phone,
      address,
      education: {
        ...education,
        level: education.level as Writer['education']['level']
      },
      experience,
      specializations: selectedSpecializations,
      bio,
      status: 'application_submitted',
      applicationSubmittedAt: new Date().toISOString()
    };
    
    onSubmit(applicationData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Writer Application"
      size="2xl"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            Submit Application
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  National ID / Passport Number *
                </label>
                <Input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Enter your ID number"
                  className={errors.nationalId ? 'border-red-500' : ''}
                />
                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254712345678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            
            {/* Address */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                />
                <Input
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className={errors.city ? 'border-red-500' : ''}
                />
                <Input
                  placeholder="State/Province"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                />
                <Input
                  placeholder="ZIP/Postal Code"
                  value={address.zipCode}
                  onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                />
              </div>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Education Level *</label>
                <select
                  value={education.level}
                  onChange={(e) => setEducation({...education, level: e.target.value})}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.educationLevel ? 'border-red-500' : ''}`}
                >
                  <option value="">Select education level</option>
                  <option value="high_school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
                {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Institution *</label>
                <Input
                  value={education.institution}
                  onChange={(e) => setEducation({...education, institution: e.target.value})}
                  placeholder="University/College name"
                  className={errors.institution ? 'border-red-500' : ''}
                />
                {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Field of Study</label>
                <Input
                  value={education.fieldOfStudy}
                  onChange={(e) => setEducation({...education, fieldOfStudy: e.target.value})}
                  placeholder="e.g., Computer Science, Literature"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <Input
                  type="number"
                  value={education.graduationYear}
                  onChange={(e) => setEducation({...education, graduationYear: parseInt(e.target.value)})}
                  placeholder="2023"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">GPA (Optional)</label>
              <Input
                value={education.gpa}
                onChange={(e) => setEducation({...education, gpa: e.target.value})}
                placeholder="e.g., 3.5/4.0 or First Class"
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Writing Specializations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Your Specializations *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                {availableSpecializations.map(spec => (
                  <Button
                    key={spec}
                    variant={selectedSpecializations.includes(spec) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      selectedSpecializations.includes(spec) 
                        ? removeSpecialization(spec)
                        : addSpecialization(spec)
                    }
                    className="justify-start text-xs"
                  >
                    {spec}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom specialization"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSpecialization()}
                />
                <Button onClick={addCustomSpecialization} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedSpecializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSpecializations.map(spec => (
                    <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialization(spec)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              {errors.specializations && <p className="text-red-500 text-xs mt-1">{errors.specializations}</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Writing Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Years of Writing Experience</label>
              <Input
                type="number"
                value={experience.yearsOfWriting}
                onChange={(e) => setExperience({...experience, yearsOfWriting: parseInt(e.target.value) || 0})}
                placeholder="0"
                min="0"
                max="50"
                className="max-w-xs"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bio & Writing Philosophy *</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself, your writing experience, and what makes you a great writer. Minimum 100 characters."
                rows={4}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.bio ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{bio.length}/100 minimum characters</span>
                {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
