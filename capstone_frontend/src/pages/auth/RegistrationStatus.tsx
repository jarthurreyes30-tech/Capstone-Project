import { useSearchParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegistrationStatus() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-2xl">
        <div className="auth-card space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Application submitted!</h1>
              <p className="text-lg text-muted-foreground">
                Your charity registration is under review
              </p>
            </div>
          </div>

          {/* Status Info */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Application received</h3>
                <p className="text-sm text-muted-foreground">
                  We've received your registration and all required documents.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Under review</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is currently reviewing your application and documents. This typically takes 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 opacity-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Verification complete</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email notification once your account is verified.
                </p>
              </div>
            </div>
          </div>

          {/* Registration ID */}
          <div className="p-4 bg-accent/50 border border-accent rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration ID</p>
                <p className="font-mono font-semibold">
                  REG-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          {email && (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Confirmation email sent to{' '}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold mt-0.5">
                  1
                </span>
                <span>
                  Our verification team will review your documents and organization details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold mt-0.5">
                  2
                </span>
                <span>
                  If additional information is needed, we'll reach out via email
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold mt-0.5">
                  3
                </span>
                <span>
                  Once approved, you'll receive login credentials and can access your charity dashboard
                </span>
              </li>
            </ul>
          </div>

          {/* Additional Documents */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Need to upload additional documents?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If our team requests additional documents, you'll receive a secure upload link via email.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Return to home
              </Button>
            </Link>
            <Link to="/auth/login" className="flex-1">
              <Button className="w-full">
                Go to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Questions about your application?{' '}
          <a href="mailto:support@example.org" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
