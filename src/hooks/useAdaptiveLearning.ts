import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdaptiveLearningJourney {
  id: string;
  employee_id: string;
  role_title: string;
  industry: string;
  org_size_category: string;
  hr_risk_score?: number;
  risk_areas: string[];
  suggested_modules: string[];
  priority_scenarios: string[];
  coachgpt_personality: string;
  context_rules: any;
  current_module_index: number;
  completion_rate: number;
  performance_metrics: any;
  created_at: string;
  updated_at: string;
}

export interface RoleLearningProfile {
  id: string;
  role_title: string;
  industry: string;
  org_size_category: string;
  priority_areas: string[];
  focus_topics: string[];
  recommended_modules: string[];
  scenario_types: string[];
  coaching_style: string;
  context_prompts: string[];
  role_specific_examples: string[];
}

interface UseAdaptiveLearningProps {
  employeeId?: string;
}

export const useAdaptiveLearning = ({ employeeId }: UseAdaptiveLearningProps = {}) => {
  const [journey, setJourney] = useState<AdaptiveLearningJourney | null>(null);
  const [profiles, setProfiles] = useState<RoleLearningProfile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch existing journey for employee
  const fetchJourney = async (empId: string) => {
    if (!empId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('adaptive_learning_journeys')
        .select('*')
        .eq('employee_id', empId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setJourney(data);
    } catch (error) {
      console.error('Error fetching adaptive learning journey:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available role profiles
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('role_learning_profiles')
        .select('*')
        .eq('is_active', true)
        .order('role_title');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching role profiles:', error);
    }
  };

  // Generate adaptive learning journey
  const generateJourney = async (params: {
    employeeId: string;
    roleTitle: string;
    industry: string;
    orgSize: 'small' | 'medium' | 'large' | 'enterprise';
    hrRiskScore?: number;
    riskAreas?: string[];
    additionalContext?: string;
  }) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-learning-generator', {
        body: params
      });

      if (error) throw error;

      if (data.success) {
        setJourney(data.journey);
        toast.success('Adaptive learning journey generated successfully!');
        return data.journey;
      } else {
        throw new Error(data.error || 'Failed to generate learning journey');
      }
    } catch (error) {
      console.error('Error generating adaptive learning journey:', error);
      toast.error('Failed to generate learning journey. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Update journey progress
  const updateProgress = async (journeyId: string, updates: {
    current_module_index?: number;
    completion_rate?: number;
    performance_metrics?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('adaptive_learning_journeys')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId)
        .select()
        .single();

      if (error) throw error;
      setJourney(data);
      return data;
    } catch (error) {
      console.error('Error updating journey progress:', error);
      throw error;
    }
  };

  // Adapt journey based on performance
  const adaptJourney = async (journeyId: string, adaptationReason: string) => {
    try {
      // This could trigger a re-generation with updated parameters
      const { data, error } = await supabase
        .from('adaptive_learning_journeys')
        .update({
          last_adaptation_date: new Date().toISOString()
        })
        .eq('id', journeyId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Learning journey adapted based on your progress!');
      return data;
    } catch (error) {
      console.error('Error adapting journey:', error);
      throw error;
    }
  };

  // Get recommendations for role/industry
  const getRecommendations = async (roleTitle: string, industry: string) => {
    try {
      const { data, error } = await supabase
        .from('role_learning_profiles')
        .select('*')
        .or(`role_title.ilike.%${roleTitle}%,industry.eq.${industry}`)
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchJourney(employeeId);
    }
    fetchProfiles();
  }, [employeeId]);

  return {
    journey,
    profiles,
    loading,
    isGenerating,
    generateJourney,
    updateProgress,
    adaptJourney,
    getRecommendations,
    fetchJourney,
    fetchProfiles
  };
};