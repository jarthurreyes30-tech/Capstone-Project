import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, MapPin, Globe, Phone, Mail, Calendar, Award, Users, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authService } from "@/services/auth";

interface CharityProfile {
  id: number;
  name: string;
  acronym?: string;
  mission: string;
  vision?: string;
  goals?: string;
  category?: string;
  region?: string;
  municipality?: string;
  logo_path?: string;
  cover_image?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  verification_status: string;
  verified_at?: string;
  total_received?: number;
  documents?: any[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  image_path?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  charity?: {
    id: number;
    name: string;
    logo_path?: string;
  };
}

export default function CharityProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [charity, setCharity] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      loadCharityProfile();
      loadCharityPosts();
    }
  }, [id]);

  const loadCharityProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCharity(data);
      }
    } catch (error) {
      console.error('Error loading charity profile:', error);
      toast.error('Failed to load charity profile');
    }
  };

  const loadCharityPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${id}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading charity posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to follow charities');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading charity profile...</p>
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Charity Not Found</h1>
          <p className="text-muted-foreground">The charity you're looking for doesn't exist or isn't available.</p>
          <Button className="mt-4" onClick={() => navigate('/donor/charities')}>
            Back to Charities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/20 to-secondary/20">
        {charity.cover_image && (
          <img
            src={`${import.meta.env.VITE_API_URL}/storage/${charity.cover_image}`}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Header */}
      <div className="relative px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-background p-2">
                {charity.logo_path ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}`}
                    alt={charity.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {charity.acronym || charity.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Charity Info */}
            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{charity.name}</h1>
                  {charity.acronym && (
                    <p className="text-lg text-muted-foreground">{charity.acronym}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {charity.verification_status === 'approved' && (
                      <Badge className="bg-green-600">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {charity.category && (
                      <Badge variant="outline">{charity.category}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleFollowToggle}>
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₱{charity.total_received?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Active Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{charity.mission}</p>
              </CardContent>
            </Card>

            {charity.vision && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{charity.vision}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {charity.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{charity.contact_email}</span>
                  </div>
                )}
                {charity.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{charity.contact_phone}</span>
                  </div>
                )}
                {charity.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={charity.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {charity.website}
                    </a>
                  </div>
                )}
                {charity.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{charity.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {charity.documents && charity.documents.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents & Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {charity.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.doc_type}</p>
                        <p className="text-sm text-muted-foreground">Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Tab */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest updates and campaigns from {charity.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No posts yet. Check back later for updates!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={charity.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}` : undefined} />
                            <AvatarFallback>{charity.acronym || charity.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{charity.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-2">{post.title}</h3>
                        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                        {post.image_path && (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/storage/${post.image_path}`}
                            alt={post.title}
                            className="mt-3 rounded-lg max-h-64 w-full object-cover"
                          />
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                          <Button variant="ghost" size="sm">
                            <Heart className="w-4 h-4 mr-2" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
