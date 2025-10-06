import { useEffect, useState } from "react";
import { Heart, TrendingUp, History, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    charitiesSupported: 0,
    impactScore: 0
  });

  // Mock featured charities
  const featuredCharities = [
    {
      id: 1,
      name: "Hope Foundation",
      mission: "Providing education to underprivileged children",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
      verified: true
    },
    {
      id: 2,
      name: "Green Earth Initiative",
      mission: "Environmental conservation and sustainability",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
      verified: true
    },
    {
      id: 3,
      name: "Health for All",
      mission: "Providing healthcare to rural communities",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      verified: true
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome Back, {user?.name?.split(' ')[0] || 'Donor'}!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your generosity is making a real difference in people's lives
          </p>
          <div className="flex gap-4">
            <Button size="lg" onClick={() => navigate('/donor/donate')}>
              <Heart className="mr-2 h-5 w-5" />
              Make a Donation
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/donor/charities')}>
              Browse Charities
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              All time contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Donated to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charities Supported</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.charitiesSupported}</div>
            <p className="text-xs text-muted-foreground">
              Organizations helped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.impactScore}%</div>
            <p className="text-xs text-muted-foreground">
              Transparency rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your next donation</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate('/donor/donate')}>
            <Heart className="mr-2 h-4 w-4" />
            Make a Donation
          </Button>
          <Button variant="outline" onClick={() => navigate('/donor/charities')}>
            Browse Charities
          </Button>
          <Button variant="outline" onClick={() => navigate('/donor/news-feed')}>
            News Feed
          </Button>
          <Button variant="outline" onClick={() => navigate('/donor/history')}>
            View History
          </Button>
        </CardContent>
      </Card>

      {/* Featured Charities removed: will show real data on Browse Charities */}
      </div>
    </div>
  );
}
