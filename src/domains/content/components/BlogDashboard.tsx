import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit, TrendingUp } from "lucide-react";
import { useBlogMetrics } from '../hooks/useBlogMetrics';

export const BlogDashboard = () => {
  const { metrics, loading, error } = useBlogMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading blog metrics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              All blog posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.published_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Live on website
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics?.draft_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Work in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reading Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.average_reading_time || 0}min</div>
            <p className="text-xs text-muted-foreground">
              Per article
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Most popular blog post categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics?.top_categories && metrics.top_categories.length > 0 ? (
              metrics.top_categories.map((category, index) => (
                <div key={category.name} className="flex justify-between items-center">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary">{category.count} posts</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No categories found
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Blog performance overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Views</span>
              <Badge variant="outline">{metrics?.total_views || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Publication Rate</span>
              <Badge variant="outline">
                {metrics?.total_posts ? Math.round((metrics.published_posts / metrics.total_posts) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Content Health</span>
              <Badge variant="outline" className="text-green-600">Good</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};