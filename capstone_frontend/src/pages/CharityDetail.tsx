import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Globe, Phone, Mail, CheckCircle, Calendar, Target, Users, Heart, ExternalLink, FileText, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PublicNavbar } from "@/components/PublicNavbar";
import { toast } from "sonner";

interface Charity {
  id: number;
  name: string;
  legal_trading_name?: string;
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
  verification_status: string;
  verified_at?: string;
  owner?: {
    name: string;
  };
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  image?: string;
}

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (id) {
      fetchCharityDetails();
      fetchCampaigns();
      fetchDocuments();
      fetchFollowStatus();
    }
  }, [id]);

  const fetchCharityDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/charities/${id}`);
      if (!response.ok) throw new Error('Charity not found');
      
      const data = await response.json();
      setCharity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charity details');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/charities/${id}/campaigns`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/charities/${id}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return; // not logged in
      const res = await fetch(`${API_URL}/api/charities/${id}/follow-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setIsFollowing(!!data.is_following);
    } catch {
      // ignore
    }
  };

  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) {
        toast.info('Please log in as a donor to follow charities');
        navigate('/auth/login');
        return;
      }
      setFollowLoading(true);
      const res = await fetch(`${API_URL}/api/charities/${id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to update follow');
      const data = await res.json();
      setIsFollowing(!!data.is_following);
      toast.success(data.is_following ? 'You are now following this charity' : 'Unfollowed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to update follow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDonate = (campaignId?: number) => {
    // Navigate to donation page with charity/campaign context
    if (campaignId) {
      navigate(`/auth/register/donor?redirect=/donate?charity=${id}&campaign=${campaignId}`);
    } else {
      navigate(`/auth/register/donor?redirect=/donate?charity=${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading charity details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Charity Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The charity you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/charities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Charities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 overflow-hidden">
          <img
            src={charity.cover_image ? `${import.meta.env.VITE_API_URL}/storage/${charity.cover_image}` : 
                 "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200"}
            alt={charity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Charity Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-6">
              {/* Logo */}
              {charity.logo_path && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white flex-shrink-0">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}`}
                    alt={`${charity.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{charity.name}</h1>
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    className="ml-auto"
                    onClick={toggleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
                {charity.legal_trading_name && charity.legal_trading_name !== charity.name && (
                  <p className="text-white/80 mb-2">Legal name: {charity.legal_trading_name}</p>
                )}
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{charity.municipality && charity.region ? 
                      `${charity.municipality}, ${charity.region}` : 
                      charity.address || 'Philippines'}</span>
                  </div>
                  {charity.category && (
                    <Badge variant="outline" className="text-white border-white/50">
                      {charity.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          className="absolute top-6 left-6 bg-white/90 hover:bg-white"
          onClick={() => navigate('/charities')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Charities
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About {charity.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {charity.mission && (
                  <div>
                    <h3 className="font-semibold mb-2">Our Mission</h3>
                    <p className="text-muted-foreground">{charity.mission}</p>
                  </div>
                )}
                {charity.vision && (
                  <div>
                    <h3 className="font-semibold mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">{charity.vision}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            {campaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>
                    Support our ongoing initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                              <p className="text-muted-foreground text-sm mb-4">{campaign.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>₱{campaign.current_amount.toLocaleString()} / ₱{campaign.target_amount.toLocaleString()}</span>
                              </div>
                              <Progress 
                                value={(campaign.current_amount / campaign.target_amount) * 100} 
                                className="h-2"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                                </div>
                                <Badge variant={campaign.status === 'published' ? 'default' : 'secondary'}>
                                  {campaign.status}
                                </Badge>
                              </div>
                              <Button onClick={() => handleDonate(campaign.id)}>
                                <Heart className="mr-2 h-4 w-4" />
                                Donate Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charity Documents */}
            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Organization Documents
                  </CardTitle>
                  <CardDescription>
                    Official documents and certificates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {documents.map((document) => (
                      <Card key={document.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {document.doc_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Official {document.doc_type.replace('_', ' ')} document
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${API_URL}/storage/${document.file_path}`, '_blank')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Donation CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Support {charity.name}</h3>
                <p className="text-muted-foreground mb-6">
                  Your donation helps us continue our mission and make a lasting impact in the community.
                </p>
                <Button size="lg" onClick={() => handleDonate()}>
                  <Heart className="mr-2 h-5 w-5" />
                  Make a Donation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${charity.contact_email}`} className="text-sm hover:underline">
                    {charity.contact_email}
                  </a>
                </div>
                {charity.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${charity.contact_phone}`} className="text-sm hover:underline">
                      {charity.contact_phone}
                    </a>
                  </div>
                )}
                {charity.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={charity.website.startsWith('http') ? charity.website : `https://${charity.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {charity.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p>{charity.address}</p>
                      {charity.municipality && charity.region && (
                        <p className="text-muted-foreground">{charity.municipality}, {charity.region}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Verified Organization</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This charity has been verified by our team and meets all requirements for transparency and accountability.
                </p>
                {charity.verified_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Verified on {new Date(charity.verified_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Active Campaigns</span>
                  </div>
                  <span className="font-semibold">{campaigns.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Category</span>
                  </div>
                  <Badge variant="outline">{charity.category || 'Community'}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
