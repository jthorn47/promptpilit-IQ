import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assessment } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessment])
        .select()
        .single();

      if (error) throw error;
      
      setAssessments(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Assessment created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAssessment = async (id: string, updates: Partial<Assessment>) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAssessments(prev => 
        prev.map(assessment => assessment.id === id ? data : assessment)
      );
      
      toast({
        title: "Success",
        description: "Assessment updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return {
    assessments,
    loading,
    fetchAssessments,
    createAssessment,
    updateAssessment,
  };
};