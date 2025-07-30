import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogCategory } from '../types';

export const useBlogCategories = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      return { data: null, error: errorMessage };
    }
  };

  const updateCategory = async (id: string, updates: Partial<BlogCategory>) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => prev.map(category => category.id === id ? data : category));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    refetch: fetchCategories
  };
};