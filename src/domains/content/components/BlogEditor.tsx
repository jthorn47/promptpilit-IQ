import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Save, X, Eye, Loader2 } from "lucide-react";

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
}

interface BlogCategory {
  id: string;
  name: string;
  color: string;
}

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

export const BlogEditor = ({ post, onSave, onCancel }: BlogEditorProps) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
    featured: false,
    category_id: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    tags: [] as string[],
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    
    if (post) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        status: post.status || "draft",
        featured: post.featured || false,
        category_id: post.category_id || "",
        slug: post.slug || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        tags: post.tags || [],
      });
    }
  }, [post]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateWithAI = async (type: 'full-post' | 'title' | 'outline' | 'excerpt') => {
    if (!formData.title && type !== 'title') {
      toast({
        title: "Title Required",
        description: "Please enter a title first to generate content with AI",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          type,
          title: formData.title,
          excerpt: formData.excerpt,
          category: categories.find(c => c.id === formData.category_id)?.name,
          existingContent: formData.content
        }
      });

      if (error) throw error;

      switch (type) {
        case 'full-post':
          setFormData(prev => ({
            ...prev,
            content: data.content,
            excerpt: data.excerpt || prev.excerpt,
          }));
          break;
        case 'title':
          setFormData(prev => ({
            ...prev,
            title: data.title,
            slug: generateSlug(data.title),
          }));
          break;
        case 'outline':
          setFormData(prev => ({
            ...prev,
            content: data.content,
          }));
          break;
        case 'excerpt':
          setFormData(prev => ({
            ...prev,
            excerpt: data.excerpt,
          }));
          break;
      }

      toast({
        title: "AI Content Generated",
        description: `${type.replace('-', ' ')} generated successfully`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content with AI",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const postData = {
        ...formData,
        author_id: user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
      };

      if (post) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Blog post ${post ? 'updated' : 'created'} successfully`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: `Failed to ${post ? 'update' : 'create'} blog post`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600">Use AI to help generate content and optimize your blog post</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Title & Content
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateWithAI('title')}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  AI Title
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter your blog post title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateWithAI('excerpt')}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    AI Excerpt
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of your post..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateWithAI('outline')}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      AI Outline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateWithAI('full-post')}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      AI Full Post
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog post content here..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="Add tags (press Enter)"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagRemove(tag)}>
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};