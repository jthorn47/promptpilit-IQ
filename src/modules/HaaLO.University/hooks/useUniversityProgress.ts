import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProgressData {
  [sectionId: string]: {
    completed: boolean;
    completedAt?: string;
  };
}

export function useUniversityProgress() {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load progress from user_profiles
  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('training_progress')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading progress:', error);
          return;
        }

        if (data?.training_progress) {
          setProgress(data.training_progress as ProgressData);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Update progress for a specific section
  const updateProgress = async (sectionId: string, completed: boolean) => {
    if (!user) return;

    try {
      const newProgress = {
        ...progress,
        [sectionId]: {
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        }
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          training_progress: newProgress
        });

      if (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update progress');
        return;
      }

      setProgress(newProgress);
      
      if (completed) {
        toast.success('Section marked as completed!');
      } else {
        toast.success('Section marked as incomplete');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  return {
    progress,
    updateProgress,
    isLoading
  };
}