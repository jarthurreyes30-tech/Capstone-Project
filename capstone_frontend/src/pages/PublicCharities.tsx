import { useState, useEffect } from "react";
import { Search, Heart, MapPin, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicNavbar } from "@/components/PublicNavbar";
import { useNavigate } from "react-router-dom";

interface Charity {
  id: number;
  name: string;
  mission?: string;
  vision?: string;
  category?: string;
  address?: string;
  region?: string;
  municipality?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  logo_path?: string;
  cover_image?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  owner?: {
    name: string;
  };
}

export default function PublicCharities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities`);
      if (!response.ok) throw new Error('Failed to fetch charities');
      
      const data = await response.json();
      // Only show approved charities
      const approvedCharities = data.filter((charity: Charity) => 
        charity.verification_status === 'approved'
      );
      setCharities(approvedCharities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "Education", "Healthcare", "Environment", "Food Security"];

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || charity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Verified Charities</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover trusted organizations making a real difference
          </p>

          {/* Search and Filter */}
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCharities.length} verified {filteredCharities.length === 1 ? 'charity' : 'charities'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading charities...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCharities}>Try Again</Button>
          </div>
        )}

        {/* Charities Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCharities.map((charity) => (
              <Card key={charity.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/charities/${charity.id}`)}>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={charity.cover_image ? `${import.meta.env.VITE_API_URL}/storage/${charity.cover_image}` : 
                         "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600"}
                    alt={charity.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{charity.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {charity.mission || charity.vision || 'Making a difference in the community'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {charity.municipality && charity.region ? 
                      `${charity.municipality}, ${charity.region}` : 
                      charity.address || 'Philippines'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{charity.category || 'Community'}</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/charities/${charity.id}`);
                    }}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCharities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No verified charities found.</p>
            <p className="text-sm text-muted-foreground">Check back later for new organizations.</p>
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of donors supporting verified charities
            </p>
            <Button size="lg" onClick={() => navigate('/auth/register/donor')}>
              Register as Donor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
