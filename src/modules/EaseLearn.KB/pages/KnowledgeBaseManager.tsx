import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpenCheck, Plus, Search, Eye, Edit } from 'lucide-react';

export const KnowledgeBaseManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockArticles = [
    {
      id: '1',
      title: 'How to Report a Safety Incident',
      category: 'Safety Procedures',
      lastUpdated: '2024-01-15',
      views: 1245,
      status: 'published',
      author: 'Safety Team'
    },
    {
      id: '2',
      title: 'Emergency Contact Information',
      category: 'Emergency Procedures',
      lastUpdated: '2024-01-10',
      views: 867,
      status: 'published',
      author: 'HR Department'
    },
    {
      id: '3',
      title: 'Equipment Maintenance Guidelines',
      category: 'Maintenance',
      lastUpdated: '2024-01-08',
      views: 432,
      status: 'draft',
      author: 'Maintenance Team'
    }
  ];

  const filteredArticles = mockArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Article
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 published, 1 draft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,544</div>
            <p className="text-xs text-muted-foreground">+156 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">848</div>
            <p className="text-xs text-muted-foreground">Per article</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{article.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Category: {article.category} • Author: {article.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {article.lastUpdated} • {article.views} views
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(article.status)}
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first knowledge base article.'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </div>
      )}
    </div>
  );
};