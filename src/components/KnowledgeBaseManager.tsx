import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { useAuth } from "@/contexts/AuthContext";
import { sampleArticles } from "@/scripts/populateKnowledgeBase";
import { addCaseManagementGuide } from "@/scripts/addCaseManagementGuide";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Eye, 
  Clock, 
  Tag, 
  Edit, 
  Trash2, 
  Star,
  FileText,
  Bookmark,
  TrendingUp,
  Filter,
  Download,
  Database
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sort_order: number;
  article_count?: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  status: string;
  featured: boolean;
  tags: string[];
  target_roles?: string[];
  view_count: number;
  last_viewed_at?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  author_id: string;
  category_id?: string | null;
  category?: Category;
}

export const KnowledgeBaseManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { userRoles, isSuperAdmin, isCompanyAdmin } = useAuth();
  const { canManageSystem, canViewUsers } = usePermissionContext();

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: '',
    status: 'draft',
    featured: false,
    target_roles: ['all'] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with article counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('knowledge_base_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch articles with category information and role-based filtering
      const { data: articlesData, error: articlesError } = await supabase
        .from('knowledge_base_articles')
        .select(`
          *,
          knowledge_base_categories (
            id, name, color, icon, description, sort_order
          )
        `)
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;
      
      // Filter articles based on user roles
      const filteredArticles = (articlesData || []).filter(article => {
        const targetRoles = article.target_roles || ['all'];
        
        // If article is for 'all' users, show it
        if (targetRoles.includes('all')) return true;
        
        // If user has system management access, show all articles including admin-only content
        if (canManageSystem) return true;
        
        // If user can view users (admin role), show company admin and general content
        if (canViewUsers && targetRoles.includes('company_admin')) return true;
        
        // Check if user has any of the required roles
        return userRoles.some(role => targetRoles.includes(role));
      });
      
      const transformedArticles = filteredArticles.map(article => ({
        ...article,
        category: article.knowledge_base_categories,
        tags: article.tags || []
      }));
      
      setArticles(transformedArticles);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async () => {
    try {
      setCreating(true);

      const slug = newArticle.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const articleData = {
        ...newArticle,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        slug,
        tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        published_at: newArticle.status === 'published' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .insert([articleData])
        .select(`
          *,
          knowledge_base_categories (
            id, name, color, icon, description, sort_order
          )
        `)
        .single();

      if (error) throw error;

      const newArticleWithCategory = {
        ...data,
        category: data.knowledge_base_categories,
        tags: data.tags || []
      };

      setArticles(prev => [newArticleWithCategory, ...prev]);
      setShowCreateDialog(false);
      setNewArticle({
        title: '',
        content: '',
        excerpt: '',
        category_id: '',
        tags: '',
        status: 'draft',
        featured: false,
        target_roles: ['all']
      });

      toast({
        title: "Success",
        description: "Article created successfully"
      });

    } catch (error: any) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      setArticles(prev => prev.filter(a => a.id !== articleId));
      
      toast({
        title: "Success",
        description: "Article deleted successfully"
      });

    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (article: Article) => {
    try {
      const { error } = await supabase
        .from('knowledge_base_articles')
        .update({ featured: !article.featured })
        .eq('id', article.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, featured: !a.featured } : a
      ));

      toast({
        title: "Success",
        description: `Article ${!article.featured ? 'featured' : 'unfeatured'}`
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive"
      });
    }
  };

  const importSampleData = async () => {
    try {
      setCreating(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const articlesToImport = [];
      
      for (const sampleArticle of sampleArticles) {
        // Find category by name
        const category = categories.find(cat => cat.name === sampleArticle.category_name);
        
        const slug = sampleArticle.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');

        articlesToImport.push({
          title: sampleArticle.title,
          content: sampleArticle.content,
          excerpt: sampleArticle.excerpt,
          slug,
          category_id: category?.id || null,
          tags: sampleArticle.tags,
          featured: sampleArticle.featured,
          status: sampleArticle.status,
          author_id: user.data.user.id,
          published_at: sampleArticle.status === 'published' ? new Date().toISOString() : null
        });
      }

      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .insert(articlesToImport)
        .select(`
          *,
          knowledge_base_categories (
            id, name, color, icon, description, sort_order
          )
        `);

      if (error) throw error;

      // Transform and add to state
      const newArticles = (data || []).map(article => ({
        ...article,
        category: article.knowledge_base_categories,
        tags: article.tags || []
      }));

      setArticles(prev => [...newArticles, ...prev]);

      toast({
        title: "Success",
        description: `Imported ${data?.length || 0} sample articles successfully!`
      });

    } catch (error: any) {
      console.error('Error importing sample data:', error);
      toast({
        title: "Error",
        description: "Failed to import sample data",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category_id === selectedCategory;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">Organize and share documentation, SOPs, and guides</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isSuperAdmin && (
            <>
              <Button 
                variant="outline" 
                onClick={async () => {
                  setCreating(true);
                  const result = await addCaseManagementGuide();
                  if (result.success) {
                    toast({
                      title: "Success",
                      description: `Case Management Guide ${result.action} successfully!`
                    });
                    fetchData(); // Refresh the articles list
                  } else {
                    toast({
                      title: "Error",
                      description: result.error || "Failed to add guide",
                      variant: "destructive"
                    });
                  }
                  setCreating(false);
                }}
                disabled={creating}
              >
                <FileText className="w-4 h-4 mr-2" />
                {creating ? "Adding..." : "Add Case Management Guide"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={async () => {
                  setCreating(true);
                  const { addPulseGuide } = await import('@/scripts/addPulseGuide');
                  const result = await addPulseGuide();
                  if (result.success) {
                    toast({
                      title: "Success",
                      description: `Pulse Complete Guide ${result.action} successfully!`
                    });
                    fetchData(); // Refresh the articles list
                  } else {
                    toast({
                      title: "Error",
                      description: result.error || "Failed to add Pulse guide",
                      variant: "destructive"
                    });
                  }
                  setCreating(false);
                }}
                disabled={creating}
              >
                <FileText className="w-4 h-4 mr-2" />
                {creating ? "Adding..." : "Add Pulse Complete Guide"}
              </Button>
            </>
          )}
          
          {articles.length === 0 && (
            <Button 
              variant="outline" 
              onClick={importSampleData}
              disabled={creating}
            >
              <Database className="w-4 h-4 mr-2" />
              {creating ? "Importing..." : "Import Sample Data"}
            </Button>
          )}
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Knowledge Base Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newArticle.excerpt}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the article"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newArticle.category_id}
                  onValueChange={(value) => setNewArticle(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="sop, procedure, training"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>
              
              {/* Role-based access control - only show for super admins */}
              {isSuperAdmin && (
                <div>
                  <Label htmlFor="target_roles">Target Audience</Label>
                  <Select
                    value={newArticle.target_roles.includes('super_admin') ? 'super_admin' : 'all'}
                    onValueChange={(value) => setNewArticle(prev => ({ 
                      ...prev, 
                      target_roles: value === 'super_admin' ? ['super_admin'] : ['all']
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="super_admin">Super Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Super Admin articles are only visible to super administrators
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newArticle.featured}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <Label htmlFor="featured">Featured article</Label>
                </div>
                
                <Select
                  value={newArticle.status}
                  onValueChange={(value: any) => setNewArticle(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createArticle} disabled={creating || !newArticle.title}>
                  {creating ? "Creating..." : "Create Article"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{articles.filter(a => a.status === 'published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{articles.filter(a => a.featured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{articles.reduce((sum, a) => sum + a.view_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    {article.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.view_count} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    {article.category && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                      >
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className={getStatusColor(article.status)}>
                    {article.status}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(article)}
                  >
                    <Star className={`w-4 h-4 ${article.featured ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteArticle(article.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' 
                ? "Try adjusting your filters or search terms."
                : "Create your first knowledge base article to get started."
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};