import { Link } from 'react-router-dom';
import { Users, Building2, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Join our community</h1>
          <p className="text-lg text-muted-foreground">
            Choose how you'd like to make a difference
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Donor Card */}
          <Link to="/auth/register/donor" className="group">
            <div className="auth-card h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 hover:border-primary">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-10 w-10 text-primary" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">Register as Donor</h2>
                  <p className="text-muted-foreground">
                    Support meaningful causes and make a direct impact in your community
                  </p>
                </div>

                <ul className="text-sm text-left space-y-2 w-full">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Secure donation processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Track your giving impact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Optional anonymous giving</span>
                  </li>
                </ul>

                <Button className="w-full" size="lg">
                  Continue as Donor
                </Button>
              </div>
            </div>
          </Link>

          {/* Charity Card */}
          <Link to="/auth/register/charity" className="group">
            <div className="auth-card h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 hover:border-secondary">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Building2 className="h-10 w-10 text-secondary" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">Register as Charity</h2>
                  <p className="text-muted-foreground">
                    Connect with donors and grow your organization's reach
                  </p>
                </div>

                <ul className="text-sm text-left space-y-2 w-full">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Verified organization profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Donor management tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Campaign creation & tracking</span>
                  </li>
                </ul>

                <Button variant="secondary" className="w-full" size="lg">
                  Continue as Charity
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Join over 10,000+ members making a difference</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
