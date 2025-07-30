import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogMetrics } from '../types';

export const useBlogMetrics = () => {
  const [metrics, setMetrics] = useState<BlogMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch blog posts with categories
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (name)
        `);

      if (postsError) throw postsError;

      const totalPosts = posts?.length || 0;
      const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
      const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;

      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      posts?.forEach(post => {
        if (post.blog_categories?.name) {
          categoryCount[post.blog_categories.name] = (categoryCount[post.blog_categories.name] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const calculatedMetrics: BlogMetrics = {
        total_posts: totalPosts,
        published_posts: publishedPosts,
        draft_posts: draftPosts,
        total_views: 0, // Would need to track views separately
        average_reading_time: 5, // Estimated
        top_categories: topCategories
      };

      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};