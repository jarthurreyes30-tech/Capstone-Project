import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (verifyToken: string) => {
    setStatus('verifying');
    try {
      await authService.verifyEmail(verifyToken);
      setStatus('success');
      toast.success('Email verified!', {
        description: 'Your account has been successfully verified.',
      });
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Verification email sent!', {
        description: 'Please check your inbox.',
      });
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to resend email', {
          description: error.message,
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="auth-card text-center space-y-6">
          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verifying your email</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Email verified!</h2>
                <p className="text-muted-foreground">
                  Your account has been successfully verified. You can now sign in.
                </p>
              </div>
              <Button onClick={() => navigate('/auth/login')} className="w-full" size="lg">
                Continue to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verification failed</h2>
                <p className="text-muted-foreground">
                  {errorMessage || 'The verification link is invalid or has expired.'}
                </p>
              </div>
              {email && (
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>
              )}
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </>
          )}

          {/* Pending State (waiting for user to check email) */}
          {status === 'pending' && !token && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-muted-foreground">
                  We've sent a verification link to
                </p>
                {email && <p className="font-medium">{email}</p>}
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
                <p>
                  Didn't receive the email? Check your spam folder or{' '}
                  {email && (
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending || resendCooldown > 0}
                      className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending
                        ? 'sending...'
                        : resendCooldown > 0
                        ? `resend in ${resendCooldown}s`
                        : 'resend it'}
                    </button>
                  )}
                </p>
              </div>
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
