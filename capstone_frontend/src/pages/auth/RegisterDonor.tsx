import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { authService, type DonorRegistrationData } from '@/services/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RegisterDonor() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<DonorRegistrationData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    preferred_contact_method: 'email',
    anonymous_giving: false,
    accept_terms: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (!formData.accept_terms) {
      newErrors.accept_terms = 'You must accept the terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // guard against double submit

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.registerDonor(formData);

      toast.success('Registration successful!', {
        description: 'You can now login with your credentials.',
      });

      // Redirect to login page after successful registration
      navigate('/auth/login');
    } catch (error: any) {
      // Parse 422 validation errors from backend if available
      const apiErrors = error?.response?.data?.errors as Record<string, string[]> | undefined;
      if (apiErrors) {
        const flatErrors: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => { flatErrors[k] = v?.[0] ?? 'Invalid'; });
        setErrors(flatErrors);
        toast.error('Registration failed', { description: Object.values(flatErrors)[0] });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
        toast.error('Registration failed', { description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to registration options
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create donor account</h1>
          <p className="text-muted-foreground">
            Join our community and start making a difference
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security</h3>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <PasswordStrengthMeter password={formData.password} />

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Confirm password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    required
                    className={cn(errors.password_confirmation && 'border-destructive', 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferences</h3>

              <div className="space-y-3">
                <Label>Preferred contact method</Label>
                <RadioGroup
                  value={formData.preferred_contact_method}
                  onValueChange={(value) =>
                    handleChange('preferred_contact_method', value as 'email' | 'sms')
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email_contact" />
                    <Label htmlFor="email_contact" className="font-normal cursor-pointer">
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms_contact" />
                    <Label htmlFor="sms_contact" className="font-normal cursor-pointer">
                      SMS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous_giving"
                  checked={formData.anonymous_giving}
                  onCheckedChange={(checked) => handleChange('anonymous_giving', checked === true)}
                />
                <Label htmlFor="anonymous_giving" className="font-normal cursor-pointer">
                  Enable anonymous giving by default
                </Label>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accept_terms"
                  checked={formData.accept_terms}
                  onCheckedChange={(checked) => handleChange('accept_terms', checked === true)}
                  className={cn(errors.accept_terms && 'border-destructive')}
                />
                <div className="space-y-1">
                  <Label htmlFor="accept_terms" className="font-normal cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  {errors.accept_terms && (
                    <p className="text-sm text-destructive">{errors.accept_terms}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
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
