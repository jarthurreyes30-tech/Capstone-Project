import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Contains lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Contains number',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { strength, score, checks } = useMemo(() => {
    const checks = requirements.map((req) => ({
      label: req.label,
      met: req.test(password),
    }));

    const score = checks.filter((c) => c.met).length;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 4) strength = 'good';
    else if (score >= 3) strength = 'fair';

    return { strength, score, checks };
  }, [password]);

  const strengthColors = {
    weak: 'bg-destructive',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            'font-medium',
            strength === 'weak' && 'text-destructive',
            strength === 'fair' && 'text-orange-500',
            strength === 'good' && 'text-yellow-600',
            strength === 'strong' && 'text-green-600'
          )}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                bar <= score ? strengthColors[strength] : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm transition-colors duration-200"
          >
            {check.met ? (
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              'transition-colors',
              check.met ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
