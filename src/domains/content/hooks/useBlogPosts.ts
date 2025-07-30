import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '../types';

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            id,
            name,
            slug,
            color,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      setPosts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      return { data: null, error: errorMessage };
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPosts(prev => prev.map(post => post.id === id ? data : post));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      return { data: null, error: errorMessage };
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(prev => prev.filter(post => post.id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts
  };
};