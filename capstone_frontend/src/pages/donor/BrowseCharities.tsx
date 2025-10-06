import { useState, useEffect } from "react";
import { Search, Heart, MapPin, CheckCircle, Eye, Filter, SortAsc, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/auth";

interface Charity {
  id: number;
  name: string;
  mission?: string;
  vision?: string;
  category?: string;
  region?: string;
  municipality?: string;
  logo_path?: string;
  verification_status: string;
  created_at: string;
}

interface ApiResponse {
  charities: {
    data: Charity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    categories: string[];
    regions: string[];
  };
}

export default function BrowseCharities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filters, setFilters] = useState({ categories: [], regions: [] });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Add missing reset function to avoid runtime ReferenceError
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setRegionFilter("all");
    setSortBy("name");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchCharities();
  }, [searchTerm, categoryFilter, regionFilter, sortBy, currentPage]);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(searchTerm && { q: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(regionFilter !== 'all' && { region: regionFilter }),
        ...(sortBy && { sort: sortBy }),
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch charities');

      const data: ApiResponse = await response.json();
      setCharities(data.charities.data);
      setFilters(data.filters);
      setTotalPages(data.charities.last_page);
    } catch (error) {
      console.error('Error fetching charities:', error);
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (charity: Charity) => {
    setSelectedCharity(charity);
    setIsDetailsOpen(true);
  };

  const [followStatus, setFollowStatus] = useState<{[key: number]: boolean}>({});
  const [followedCharities, setFollowedCharities] = useState<number[]>([]);

  useEffect(() => {
    if (charities.length > 0) {
      fetchFollowStatuses();
    }
  }, [charities]);

  const fetchFollowStatuses = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const statusPromises = charities.map(async (charity) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${charity.id}/follow-status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            return { charityId: charity.id, isFollowing: data.is_following };
          }
        } catch (error) {
          console.error(`Error fetching follow status for charity ${charity.id}:`, error);
        }
        return { charityId: charity.id, isFollowing: false };
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap: {[key: number]: boolean} = {};
      statuses.forEach(status => {
        statusMap[status.charityId] = status.isFollowing;
      });
      setFollowStatus(statusMap);
    } catch (error) {
      console.error('Error fetching follow statuses:', error);
    }
  };

  const handleToggleFollow = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to follow charities');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${charityId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update follow status');
      }

      const data = await response.json();
      setFollowStatus(prev => ({
        ...prev,
        [charityId]: data.is_following
      }));

      toast.success(data.message);

    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Browse Charities</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover verified organizations making a difference
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
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
                  <SelectItem value="all">All Categories</SelectItem>
                  {filters.categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {filters.regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="total_received">Most Raised</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Results Count and Loading */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${charities.length} of ${filters.categories.length > 0 ? 'many' : '0'} charities`}
          </p>
          {charities.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Charities Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity) => (
              <Card key={charity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={charity.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}` : "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600"}
                    alt={charity.name}
                    className="w-full h-full object-cover"
                  />
                  {charity.verification_status === 'approved' && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{charity.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {charity.mission || 'Making a difference in our community'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {charity.region && charity.municipality ? `${charity.municipality}, ${charity.region}` : charity.region || 'Location not specified'}
                  </div>
                  {charity.category && (
                    <Badge variant="outline">{charity.category}</Badge>
                  )}
                  <div className="text-sm">
                    <p className="text-muted-foreground">Verified</p>
                    <p className="text-lg font-bold text-green-600">
                      {charity.verification_status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDonate(charity.id)}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Donate
                    </Button>
                    <Button
                      variant={followStatus[charity.id] ? "default" : "outline"}
                      onClick={() => handleToggleFollow(charity.id)}
                    >
                      {followStatus[charity.id] ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/donor/charities/${charity.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && charities.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No charities found matching your criteria. Try adjusting your search or filters.
            </p>
          </Card>
        )}
      </div>

      {/* Charity Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCharity?.name}</DialogTitle>
            <DialogDescription>
              {selectedCharity?.verification_status === 'approved' && (
                <Badge className="bg-green-600 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified Organization
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedCharity && (
            <div className="space-y-6">
              <img
                src={selectedCharity.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${selectedCharity.logo_path}` : "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600"}
                alt={selectedCharity.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-2">Mission</h3>
                    <p className="text-muted-foreground">{selectedCharity.mission || 'Mission statement not available'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Vision</h3>
                    <p className="text-muted-foreground">{selectedCharity.vision || 'Vision statement not available'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCharity.category && (
                      <div>
                        <h3 className="font-semibold mb-2">Category</h3>
                        <Badge variant="outline">{selectedCharity.category}</Badge>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedCharity.region && selectedCharity.municipality ? `${selectedCharity.municipality}, ${selectedCharity.region}` : selectedCharity.region || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-2">Verification Status</h3>
                    <p className="text-muted-foreground">
                      {selectedCharity.verification_status === 'approved'
                        ? 'This charity has been verified and approved by our administrators.'
                        : 'This charity is pending verification.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Member Since</h3>
                    <p className="text-muted-foreground">
                      {new Date(selectedCharity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p className="text-muted-foreground">
                      Contact details are available to verified donors.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" onClick={() => {
                  handleDonate(selectedCharity.id);
                  setIsDetailsOpen(false);
                }}>
                  <Heart className="mr-2 h-4 w-4" />
                  Donate Now
                </Button>
                <Button
                  variant={followStatus[selectedCharity.id] ? "default" : "outline"}
                  onClick={() => {
                    handleToggleFollow(selectedCharity.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  {followStatus[selectedCharity.id] ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
