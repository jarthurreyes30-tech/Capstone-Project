import { Heart, Shield, TrendingUp, Users, CheckCircle, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function About() {
  const features = [
    {
      icon: Shield,
      title: "Verified Charities",
      description: "All charities are thoroughly verified and vetted before being listed on our platform"
    },
    {
      icon: TrendingUp,
      title: "Full Transparency",
      description: "Track exactly how your donations are being used with detailed fund usage reports"
    },
    {
      icon: Heart,
      title: "Easy Donations",
      description: "Simple and secure donation process with multiple payment options"
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Join thousands of donors making a real difference in communities"
    }
  ];

  const stats = [
    { label: "Total Donations", value: "₱50M+", icon: Heart },
    { label: "Verified Charities", value: "150+", icon: Shield },
    { label: "Active Donors", value: "10,000+", icon: Users },
    { label: "Lives Impacted", value: "100,000+", icon: TrendingUp }
  ];

  const values = [
    {
      title: "Transparency",
      description: "We believe in complete transparency. Every donation is tracked, and charities must provide detailed reports on fund usage."
    },
    {
      title: "Accountability",
      description: "Charities are held accountable for their actions. We verify their legitimacy and monitor their activities."
    },
    {
      title: "Impact",
      description: "We focus on creating real, measurable impact in communities. Your donations directly help those in need."
    },
    {
      title: "Trust",
      description: "Building trust between donors and charities is our priority. We ensure every transaction is secure and legitimate."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Badge className="mb-4">About CharityHub</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Connecting Generous Hearts with Worthy Causes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            CharityHub is a transparent donation platform that connects donors with verified charities,
            ensuring your contributions make a real difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Start Donating
            </Button>
            <Button size="lg" variant="outline">
              Browse Charities
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To create a transparent and trustworthy platform that empowers individuals to support
                  verified charitable organizations, ensuring every donation creates meaningful impact
                  in communities across the Philippines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A future where charitable giving is transparent, accessible, and impactful for everyone.
                  We envision a society where donors can confidently support causes they care about,
                  knowing their contributions are making a real difference.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose CharityHub?</h2>
          <p className="text-xl text-muted-foreground">
            We make charitable giving transparent, secure, and impactful
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Simple steps to make a difference
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Browse Charities</h3>
            <p className="text-muted-foreground">
              Explore our list of verified charities and their active campaigns
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Make a Donation</h3>
            <p className="text-muted-foreground">
              Choose your amount and payment method. Upload proof of payment
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Track Impact</h3>
            <p className="text-muted-foreground">
              See exactly how your donation is being used through transparency reports
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-xl mb-8 opacity-90">
            We're here to help. Get in touch with our team for any inquiries.
          </p>
          <Button size="lg" variant="secondary">
            <Mail className="mr-2 h-5 w-5" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
