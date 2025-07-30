import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Calendar, User } from "lucide-react";
import { BlogEditor } from "./BlogEditor";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  author_id: string;
  category_id: string | null;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
  blog_categories?: {
    name: string;
    color: string;
  };
}

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handlePostSaved = () => {
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showEditor) {
    return (
      <BlogEditor 
        post={editingPost}
        onSave={handlePostSaved}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage your blog posts with AI assistance</p>
        </div>
        <Button onClick={handleNewPost} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No blog posts yet</p>
                <p className="text-sm">Create your first blog post to get started</p>
              </div>
              <Button onClick={handleNewPost} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-gray-600">
                      {post.excerpt}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {post.featured && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Featured
                      </Badge>
                    )}
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.published_at 
                          ? format(new Date(post.published_at), 'MMM d, yyyy')
                          : format(new Date(post.created_at), 'MMM d, yyyy')
                        }
                      </span>
                    </div>
                    {post.blog_categories && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: post.blog_categories.color }}
                        />
                        <span>{post.blog_categories.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};