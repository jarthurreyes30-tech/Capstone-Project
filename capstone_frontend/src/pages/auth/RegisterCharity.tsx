import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { FileUploader, type UploadedFile } from '@/components/auth/FileUploader';
import { authService, type CharityRegistrationData } from '@/services/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, name: 'Organization Details', description: 'Basic information about your charity' },
  { id: 2, name: 'Profile & Mission', description: 'Tell us about your mission' },
  { id: 3, name: 'Documents & Compliance', description: 'Upload required documents' },
  { id: 4, name: 'Review & Submit', description: 'Confirm your information' },
];

const NONPROFIT_CATEGORIES = [
  'Education',
  'Healthcare',
  'Environment',
  'Human Rights',
  'Animal Welfare',
  'Arts & Culture',
  'Community Development',
  'Disaster Relief',
  'Other',
];

export default function RegisterCharity() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<CharityRegistrationData>>({
    organization_name: '',
    legal_trading_name: '',
    registration_number: '',
    tax_id: '',
    website: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
    password: '',
    password_confirmation: '',
    address: '',
    region: '',
    municipality: '',
    nonprofit_category: '',
    mission_statement: '',
    description: '',
    accept_terms: false,
    confirm_truthfulness: false,
  });

  // Document uploads
  const [documents, setDocuments] = useState<{
    registration_cert: UploadedFile[];
    tax_registration: UploadedFile[];
    financial_statement: UploadedFile[];
    representative_id: UploadedFile[];
    additional_docs: UploadedFile[];
  }>({
    registration_cert: [],
    tax_registration: [],
    financial_statement: [],
    representative_id: [],
    additional_docs: [],
  });

  // Logo and cover image
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Logo uploaded');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Cover image uploaded');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.organization_name) newErrors.organization_name = 'Required';
      if (!formData.registration_number) newErrors.registration_number = 'Required';
      if (!formData.tax_id) newErrors.tax_id = 'Required';
      if (!formData.contact_person_name) newErrors.contact_person_name = 'Required';
      if (!formData.contact_email) newErrors.contact_email = 'Required';
      if (!formData.contact_phone) newErrors.contact_phone = 'Required';
      if (!formData.password || (formData.password as string).length < 6) newErrors.password = 'Min 6 characters';
      if (!formData.password_confirmation) newErrors.password_confirmation = 'Required';
      if (formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
      if (!formData.address) newErrors.address = 'Required';
      if (!formData.region) newErrors.region = 'Required';
      if (!formData.municipality) newErrors.municipality = 'Required';
      if (!formData.nonprofit_category) newErrors.nonprofit_category = 'Required';
    }

    if (step === 2) {
      if (!formData.mission_statement) newErrors.mission_statement = 'Required';
      if (!formData.description) newErrors.description = 'Required';
    }

    if (step === 3) {
      if (documents.registration_cert.length === 0)
        newErrors.registration_cert = 'Registration certificate is required';
      if (documents.tax_registration.length === 0)
        newErrors.tax_registration = 'Tax registration is required';
      if (documents.representative_id.length === 0)
        newErrors.representative_id = 'Representative ID is required';
    }

    if (step === 4) {
      if (!formData.accept_terms) newErrors.accept_terms = 'You must accept the terms';
      if (!formData.confirm_truthfulness)
        newErrors.confirm_truthfulness = 'You must confirm truthfulness';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Save draft to localStorage (excluding file objects)
      localStorage.setItem('charity_draft', JSON.stringify({ 
        formData, 
        hasLogo: !!logo,
        hasCover: !!coverImage
      }));
      toast.success('Draft saved', {
        description: 'You can continue your registration later.',
      });
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    try {
      // Prepare FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      // Add logo and cover image
      if (logo) {
        submitData.append('logo', logo);
      }
      if (coverImage) {
        submitData.append('cover_image', coverImage);
      }

      // Add document files
      documents.registration_cert.forEach((file) => {
        submitData.append('documents[]', file.file);
        submitData.append('doc_types[]', 'registration_cert');
      });
      documents.tax_registration.forEach((file) => {
        submitData.append('documents[]', file.file);
        submitData.append('doc_types[]', 'tax_registration');
      });
      documents.financial_statement.forEach((file) => {
        submitData.append('documents[]', file.file);
        submitData.append('doc_types[]', 'financial_statement');
      });
      documents.representative_id.forEach((file) => {
        submitData.append('documents[]', file.file);
        submitData.append('doc_types[]', 'representative_id');
      });
      documents.additional_docs.forEach((file) => {
        submitData.append('documents[]', file.file);
        submitData.append('doc_types[]', 'additional_docs');
      });

      await authService.registerCharity(submitData as any);

      // Clear draft after successful submission
      localStorage.removeItem('charity_draft');

      toast.success('Registration submitted!', {
        description: 'Your application is under review. We\'ll notify you by email.',
      });

      // Redirect to login page
      navigate('/auth/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Registration failed', { description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to registration options
          </Link>
          <h1 className="text-3xl font-bold mb-2">Register your charity</h1>
          <p className="text-muted-foreground">Complete the steps below to join our platform</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                      currentStep > step.id && 'bg-primary text-primary-foreground',
                      currentStep === step.id && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      currentStep < step.id && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 mx-2 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="auth-card">
          {/* Step 1: Organization Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Organization Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization_name">
                    Organization name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    className={cn(errors.organization_name && 'border-destructive')}
                  />
                  {errors.organization_name && (
                    <p className="text-sm text-destructive">{errors.organization_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_trading_name">Legal trading name (if different)</Label>
                  <Input
                    id="legal_trading_name"
                    value={formData.legal_trading_name}
                    onChange={(e) => handleChange('legal_trading_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    Registration number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                    className={cn(errors.registration_number && 'border-destructive')}
                  />
                  {errors.registration_number && (
                    <p className="text-sm text-destructive">{errors.registration_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">
                    Tax ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                    className={cn(errors.tax_id && 'border-destructive')}
                  />
                  {errors.tax_id && (
                    <p className="text-sm text-destructive">{errors.tax_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={cn(errors.password && 'border-destructive')}
                    placeholder="At least 6 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={formData.password_confirmation || ''}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    className={cn(errors.password_confirmation && 'border-destructive')}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.org"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Primary Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_name">
                      Contact person name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_person_name"
                      value={formData.contact_person_name}
                      onChange={(e) => handleChange('contact_person_name', e.target.value)}
                      className={cn(errors.contact_person_name && 'border-destructive')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                      className={cn(errors.contact_email && 'border-destructive')}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact_phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                      className={cn(errors.contact_phone && 'border-destructive')}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={cn(errors.address && 'border-destructive')}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">
                        Region <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        className={cn(errors.region && 'border-destructive')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="municipality">
                        Municipality <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) => handleChange('municipality', e.target.value)}
                        className={cn(errors.municipality && 'border-destructive')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nonprofit_category">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="nonprofit_category"
                        value={formData.nonprofit_category}
                        onChange={(e) => handleChange('nonprofit_category', e.target.value)}
                        className={cn(
                          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          errors.nonprofit_category && 'border-destructive'
                        )}
                      >
                        <option value="">Select category</option>
                        {NONPROFIT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profile & Mission */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Profile & Mission</h2>

              <div className="space-y-2">
                <Label htmlFor="mission_statement">
                  Mission statement <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="mission_statement"
                  value={formData.mission_statement}
                  onChange={(e) => handleChange('mission_statement', e.target.value)}
                  rows={3}
                  placeholder="A brief statement of your organization's purpose and goals..."
                  className={cn(errors.mission_statement && 'border-destructive')}
                />
                {errors.mission_statement && (
                  <p className="text-sm text-destructive">{errors.mission_statement}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Detailed description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  placeholder="Tell us more about your organization, programs, and impact..."
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Media (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your organization's logo and cover image to enhance your profile.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Organization Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {logoPreview ? (
                        <div className="space-y-2">
                          <img src={logoPreview} alt="Logo preview" className="h-32 w-32 object-cover rounded-lg mx-auto" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogo(null);
                              setLogoPreview(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <Save className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium">Upload Logo</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {coverPreview ? (
                        <div className="space-y-2">
                          <img src={coverPreview} alt="Cover preview" className="h-32 w-full object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCoverImage(null);
                              setCoverPreview(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="cover-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverUpload}
                          />
                          <label htmlFor="cover-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <Save className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium">Upload Cover</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Documents & Compliance</h2>
                <p className="text-muted-foreground">
                  Upload the required documents. All files are securely processed with SHA-256
                  checksums.
                </p>
              </div>

              <FileUploader
                label="Registration certificate / SEC equivalent"
                description="Official registration document from the relevant authority"
                required
                files={documents.registration_cert}
                onChange={(files) =>
                  setDocuments((prev) => ({ ...prev, registration_cert: files }))
                }
              />
              {errors.registration_cert && (
                <p className="text-sm text-destructive -mt-2">{errors.registration_cert}</p>
              )}

              <FileUploader
                label="Tax registration (BIR) or Tax ID"
                description="Tax registration document or proof of tax-exempt status"
                required
                files={documents.tax_registration}
                onChange={(files) =>
                  setDocuments((prev) => ({ ...prev, tax_registration: files }))
                }
              />
              {errors.tax_registration && (
                <p className="text-sm text-destructive -mt-2">{errors.tax_registration}</p>
              )}

              <FileUploader
                label="Latest audited financial statement"
                description="Most recent financial report or accountant's summary (if available)"
                files={documents.financial_statement}
                onChange={(files) =>
                  setDocuments((prev) => ({ ...prev, financial_statement: files }))
                }
              />

              <FileUploader
                label="Representative ID (Government-issued ID)"
                description="Valid government ID of the authorized representative"
                required
                files={documents.representative_id}
                onChange={(files) =>
                  setDocuments((prev) => ({ ...prev, representative_id: files }))
                }
              />
              {errors.representative_id && (
                <p className="text-sm text-destructive -mt-2">{errors.representative_id}</p>
              )}

              <FileUploader
                label="Additional supporting documents"
                description="Any other relevant documents to support your application"
                multiple
                files={documents.additional_docs}
                onChange={(files) =>
                  setDocuments((prev) => ({ ...prev, additional_docs: files }))
                }
              />
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Review & Submit</h2>

              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Organization Details</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">Organization:</dt>
                    <dd className="font-medium">{formData.organization_name}</dd>
                    <dt className="text-muted-foreground">Registration #:</dt>
                    <dd className="font-medium">{formData.registration_number}</dd>
                    <dt className="text-muted-foreground">Tax ID:</dt>
                    <dd className="font-medium">{formData.tax_id}</dd>
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd className="font-medium">{formData.nonprofit_category}</dd>
                  </dl>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">Contact person:</dt>
                    <dd className="font-medium">{formData.contact_person_name}</dd>
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="font-medium">{formData.contact_email}</dd>
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd className="font-medium">{formData.contact_phone}</dd>
                  </dl>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Uploaded Documents</h3>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Registration certificate ({documents.registration_cert.length})
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Tax registration ({documents.tax_registration.length})
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Representative ID ({documents.representative_id.length})
                    </li>
                    {documents.financial_statement.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Financial statement ({documents.financial_statement.length})
                      </li>
                    )}
                    {documents.additional_docs.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Additional documents ({documents.additional_docs.length})
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="confirm_truthfulness"
                      checked={formData.confirm_truthfulness}
                      onCheckedChange={(checked) =>
                        handleChange('confirm_truthfulness', checked === true)
                      }
                      className={cn(errors.confirm_truthfulness && 'border-destructive')}
                    />
                    <Label htmlFor="confirm_truthfulness" className="font-normal cursor-pointer">
                      I confirm that all information provided is truthful and accurate to the best
                      of my knowledge. <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {errors.confirm_truthfulness && (
                    <p className="text-sm text-destructive ml-6">{errors.confirm_truthfulness}</p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="accept_terms"
                      checked={formData.accept_terms}
                      onCheckedChange={(checked) => handleChange('accept_terms', checked === true)}
                      className={cn(errors.accept_terms && 'border-destructive')}
                    />
                    <Label htmlFor="accept_terms" className="font-normal cursor-pointer">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                  </div>
                  {errors.accept_terms && (
                    <p className="text-sm text-destructive ml-6">{errors.accept_terms}</p>
                  )}
                </div>

                <div className="p-4 bg-accent/50 border border-accent rounded-lg">
                  <p className="text-sm">
                    <strong>Next steps:</strong> After submission, your application will be
                    reviewed by our team. This typically takes 3-5 business days. We'll notify you
                    by email once your review is complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save draft
                  </>
                )}
              </Button>
            </div>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit application'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
