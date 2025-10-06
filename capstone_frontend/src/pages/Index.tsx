import { Link } from 'react-router-dom';
import { Heart, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/PublicNavbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navbar */}
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 pt-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Brand Area */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">CharityConnect</h2>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Making a difference,
              <span className="text-primary"> together</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect donors with verified charities. Support meaningful causes and create lasting
              impact in your community.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth/register">
              <Button size="lg" className="min-w-[200px]">
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-16">
            <div className="p-8 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Donors</h3>
              <p className="text-muted-foreground mb-4">
                Discover verified charities, track your giving impact, and make secure donations to
                causes you care about.
              </p>
              <Link to="/auth/register/donor">
                <Button variant="ghost" className="group">
                  Register as Donor
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Charities</h3>
              <p className="text-muted-foreground mb-4">
                Build your organization's profile, connect with donors, and manage campaigns on our
                trusted platform.
              </p>
              <Link to="/auth/register/charity">
                <Button variant="ghost" className="group">
                  Register as Charity
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CharityConnect. Built with purpose.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
