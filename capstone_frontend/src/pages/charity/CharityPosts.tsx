import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, MoreVertical, Trash2, Edit, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { authService } from "@/services/auth";

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

export default function CharityPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [postStatus, setPostStatus] = useState<'draft' | 'published'>('published');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/my-posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setCreating(true);
    try {
      const token = authService.getToken();
      console.log('Token exists:', !!token);
      console.log('API URL:', import.meta.env.VITE_API_URL);

      if (!token) {
        toast.error('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('title', newPostTitle);
      formData.append('content', newPostContent);
      formData.append('status', postStatus);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it automatically with boundary
        },
        body: formData
      });

      console.log('API Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error details:', errorData);
        throw new Error(errorData.error || errorData.message || `Failed to create post (${response.status})`);
      }

      const newPost = await response.json();
      console.log('Post created successfully:', newPost);
      setPosts([newPost, ...posts]);
      
      // Reset form
      setNewPostTitle("");
      setNewPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
      
      toast.success(`Post ${postStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
      console.error('Full error details:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter(post => post.id !== id));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Posts & Updates</h1>
        <p className="text-muted-foreground text-sm">
          Share events, campaigns, and donation updates with your supporters
        </p>
      </div>

      {/* Create Post Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">Create New Post</p>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={postStatus === 'published' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostStatus('published')}
                >
                  Publish
                </Button>
                <Button
                  variant={postStatus === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostStatus('draft')}
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Title</label>
            <input
              type="text"
              placeholder="Enter post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Share an update with your supporters..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 w-full object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImage(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <input
                type="file"
                id="post-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <label htmlFor="post-image">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add Photo
                  </span>
                </Button>
              </label>
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={!newPostTitle.trim() || !newPostContent.trim() || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {postStatus === 'published' ? 'Publishing...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {postStatus === 'published' ? 'Publish Post' : 'Save Draft'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>HF</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.charity?.name || 'Your Charity'}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {post.published_at ? 
                          new Date(post.published_at).toLocaleDateString() : 
                          new Date(post.created_at).toLocaleDateString()
                        }
                      </p>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {post.image_path && (
                <img 
                  src={`${import.meta.env.VITE_API_URL}/storage/${post.image_path}`}
                  alt={post.title}
                  className="rounded-lg w-full object-cover max-h-96"
                />
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t pt-3">
                <Button variant="ghost" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Like
                </Button>
                <Button variant="ghost" className="flex-1">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Comment
                </Button>
                <Button variant="ghost" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No posts yet. Create your first post to engage with your supporters!</p>
        </Card>
      )}
    </div>
  );
}
