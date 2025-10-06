import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CharityPost {
  id: number;
  title: string;
  content: string;
  image_path?: string;
  published_at: string;
  charity: {
    id: number;
    name: string;
    logo_path?: string;
    category?: string;
    municipality?: string;
    region?: string;
  };
}

export default function NewsFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (charityId: number) => {
    navigate(`/charities/${charityId}`);
  };

  const handleViewCharity = (charityId: number) => {
    navigate(`/charities/${charityId}`);
  };

  const handleLike = (postId: number) => {
    toast.success('Thanks for the love!');
  };

  const handleComment = (postId: number) => {
    toast.info('Comments coming soon.');
  };

  const handleShare = async (post: CharityPost) => {
    try {
      const shareText = `${post.title} — ${post.charity.name}`;
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Post details copied to clipboard');
      }
    } catch {
      toast.error('Unable to share right now');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchPosts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Charity News Feed</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news and updates from verified charities
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No posts available yet.</p>
            <p className="text-sm text-muted-foreground">
              Check back later for updates from verified charities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={post.charity.logo_path ? 
                          `${import.meta.env.VITE_API_URL}/storage/${post.charity.logo_path}` : 
                          undefined
                        } 
                      />
                      <AvatarFallback>
                        {post.charity.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold hover:underline cursor-pointer"
                          onClick={() => handleViewCharity(post.charity.id)}>
                        {post.charity.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        {post.charity.municipality && post.charity.region && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{post.charity.municipality}, {post.charity.region}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {post.charity.category && (
                    <Badge variant="outline">{post.charity.category}</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.image_path && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/storage/${post.image_path}`}
                      alt={post.title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                      <Heart className="mr-2 h-4 w-4" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCharity(post.charity.id)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Charity
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDonate(post.charity.id)}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Donate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
