import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReflectionData {
  usefulnessResponse: string;
  confusionResponse: string;
  applicationResponse: string;
  teachingResponse: string;
  allowPeerSharing?: boolean;
}

interface UseReflectionsProps {
  employeeId: string;
  trainingModuleId?: string;
  sceneId?: string;
  assignmentId?: string;
  moduleTopic?: string;
  reflectionType?: 'post_training' | 'post_scenario';
}

export const useLearningReflections = (props: UseReflectionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [peerReflections, setPeerReflections] = useState<any[]>([]);
  const [loadingPeerReflections, setLoadingPeerReflections] = useState(false);

  const submitReflection = async (reflectionData: ReflectionData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('learning_reflections')
        .insert({
          employee_id: props.employeeId,
          training_module_id: props.trainingModuleId,
          scene_id: props.sceneId,
          assignment_id: props.assignmentId,
          reflection_type: props.reflectionType || 'post_training',
          usefulness_response: reflectionData.usefulnessResponse,
          confusion_response: reflectionData.confusionResponse,
          application_response: reflectionData.applicationResponse,
          teaching_response: reflectionData.teachingResponse,
          module_topic: props.moduleTopic,
          allow_peer_sharing: reflectionData.allowPeerSharing || false,
          is_anonymous: true
        });

      if (error) throw error;

      toast.success('Thank you for your reflection! Your insights help improve training for everyone.');
      return true;
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast.error('Failed to submit reflection. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPeerReflections = async () => {
    if (!props.trainingModuleId) return;
    
    setLoadingPeerReflections(true);
    try {
      const { data, error } = await supabase
        .from('learning_reflections')
        .select(`
          usefulness_response,
          confusion_response,
          application_response,
          teaching_response,
          module_topic,
          created_at
        `)
        .eq('training_module_id', props.trainingModuleId)
        .eq('allow_peer_sharing', true)
        .eq('is_anonymous', true)
        .neq('employee_id', props.employeeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPeerReflections(data || []);
    } catch (error) {
      console.error('Error fetching peer reflections:', error);
    } finally {
      setLoadingPeerReflections(false);
    }
  };

  const getReflectionThemes = async () => {
    if (!props.trainingModuleId) return [];
    
    try {
      const { data, error } = await supabase
        .from('reflection_themes_summary')
        .select('*')
        .eq('training_module_id', props.trainingModuleId)
        .gte('week_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('occurrence_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reflection themes:', error);
      return [];
    }
  };

  return {
    submitReflection,
    isSubmitting,
    fetchPeerReflections,
    peerReflections,
    loadingPeerReflections,
    getReflectionThemes
  };
};