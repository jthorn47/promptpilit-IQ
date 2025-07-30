import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Tag, 
  Users, 
  TrendingUp,
  Star,
  Clock,
  MessageSquare,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  user_roles: string[];
  usage_count: number;
  helpfulness_score: number;
  created_at: string;
  last_updated_at: string;
}

interface SarahWikiProps {
  companyId: string;
  userRole?: string;
  onAskWiki?: (query: string) => Promise<WikiArticle[]>;
}

const categoryIcons = {
  compliance: '⚖️',
  conflict: '🤝',
  documentation: '📄',
  safety: '🛡️',
  leadership: '👑',
  general: '📚'
};

export const SarahWiki: React.FC<SarahWikiProps> = ({
  companyId,
  userRole = 'learner',
  onAskWiki
}) => {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch articles
  useEffect(() => {
    fetchArticles();
    fetchTrendingTopics();
  }, [companyId, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('wiki_articles')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('usage_count', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      if (searchQuery) {
        // Use full-text search
        query = query.textSearch('title,content', searchQuery);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load wiki articles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const { data } = await supabase
        .from('wiki_articles')
        .select('tags')
        .eq('company_id', companyId)
        .gte('usage_count', 5)
        .limit(10);

      if (data) {
        const allTags = data.flatMap(article => article.tags || []);
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const trending = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([tag]) => tag);

        setTrendingTopics(trending);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    }
  };

  const handleSearch = () => {
    fetchArticles();
  };

  const handleArticleClick = async (article: WikiArticle) => {
    // Log usage
    await supabase.from('wiki_usage_logs').insert({
      article_id: article.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      company_id: companyId,
      user_role: userRole,
      access_type: 'browse',
      search_query: searchQuery || null
    });
  };

  const handleAskWiki = async () => {
    if (!onAskWiki || !searchQuery) return;
    
    try {
      const results = await onAskWiki(searchQuery);
      setArticles(results);
      
      // Log search
      await supabase.from('wiki_usage_logs').insert({
        article_id: results[0]?.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        company_id: companyId,
        user_role: userRole,
        access_type: 'search',
        search_query: searchQuery
      });
    } catch (error) {
      console.error('Error asking wiki:', error);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: '📚' },
    { value: 'compliance', label: 'Compliance', icon: '⚖️' },
    { value: 'conflict', label: 'Conflict Resolution', icon: '🤝' },
    { value: 'documentation', label: 'Documentation', icon: '📄' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'leadership', label: 'Leadership', icon: '👑' },
    { value: 'general', label: 'General', icon: '📚' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Organization Knowledge Base</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {onAskWiki && (
              <Button variant="outline" onClick={handleAskWiki}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Wiki
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trending Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map(topic => (
                <Badge 
                  key={topic} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setSearchQuery(topic);
                    handleSearch();
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categoryOptions.map(category => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="whitespace-nowrap"
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : articles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No articles found for your search.' : 'No articles available yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card 
              key={article.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleArticleClick(article)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    <span className="mr-2">
                      {categoryIcons[article.category as keyof typeof categoryIcons]}
                    </span>
                    {article.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {article.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {article.usage_count}
                    </span>
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {article.helpfulness_score.toFixed(1)}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(article.last_updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};