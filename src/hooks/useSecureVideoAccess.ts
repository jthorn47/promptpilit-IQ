import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSeat {
  id: string;
  total_seats: number;
  used_seats: number;
  remaining_seats: number;
  purchased_at: string;
  status: string;
  expires_at?: string;
  course_packages: {
    id: string;
    name: string;
    description: string;
    course_count: number;
  };
}

export interface UnlockedCourse {
  id: string;
  training_module_id: string;
  unlocked_at: string;
  last_accessed_at?: string;
  certificate_generated: boolean;
  training_modules: {
    title: string;
    description: string;
    thumbnail_url?: string;
    estimated_duration?: number;
  };
}

export const useSecureVideoAccess = () => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<UserSeat[]>([]);
  const [unlockedCourses, setUnlockedCourses] = useState<UnlockedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { action: 'get_user_seats' }
      });

      if (error) throw error;

      if (data.success) {
        setSeats(data.seats || []);
        setUnlockedCourses(data.unlocked_courses || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your course data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const unlockCourse = useCallback(async (moduleId: string, moduleTitle: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { 
          action: 'unlock_course',
          trainingModuleId: moduleId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`🎉 Course "${moduleTitle}" unlocked successfully!`);
        await fetchUserData(); // Refresh data
        return true;
      } else {
        throw new Error(data.error || 'Failed to unlock course');
      }
    } catch (error) {
      console.error('Error unlocking course:', error);
      toast.error(`Failed to unlock course: ${error.message}`);
      return false;
    }
  }, [user, fetchUserData]);

  const generateVideoToken = useCallback(async (moduleId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { 
          action: 'generate_video_token',
          trainingModuleId: moduleId
        }
      });

      if (error) throw error;

      if (data.success) {
        return {
          video_token: data.video_token,
          session_token: data.session_token,
          expires_at: data.expires_at,
          watermark_data: data.watermark_data
        };
      } else {
        throw new Error(data.error || 'Failed to generate access token');
      }
    } catch (error) {
      console.error('Error generating video token:', error);
      toast.error(`Failed to access course: ${error.message}`);
      return null;
    }
  }, [user]);

  const getTotalRemainingSeats = useCallback(() => {
    return seats.reduce((total, seat) => total + seat.remaining_seats, 0);
  }, [seats]);

  const isModuleUnlocked = useCallback((moduleId: string) => {
    return unlockedCourses.some(course => course.training_module_id === moduleId);
  }, [unlockedCourses]);

  const getUnlockedCourse = useCallback((moduleId: string) => {
    return unlockedCourses.find(course => course.training_module_id === moduleId);
  }, [unlockedCourses]);

  const purchaseSeats = useCallback(async (packageId: string, seatCount: number) => {
    if (!user) return false;

    try {
      // This would integrate with Stripe for payment processing
      // For now, we'll just create a seat package directly
      const { data, error } = await supabase
        .from('user_course_seats')
        .insert({
          user_id: user.id,
          package_id: packageId,
          total_seats: seatCount,
          status: 'active'
        })
        .select();

      if (error) throw error;

      toast.success(`Successfully purchased ${seatCount} course seats!`);
      await fetchUserData();
      return true;
    } catch (error) {
      console.error('Error purchasing seats:', error);
      toast.error('Failed to purchase course seats');
      return false;
    }
  }, [user, fetchUserData]);

  // Real-time updates for seat changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-seats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_course_seats',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 Seat data changed, refreshing...');
          fetchUserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_course_access',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 Course access changed, refreshing...');
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserData]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  return {
    seats,
    unlockedCourses,
    loading,
    refreshing,
    fetchUserData,
    unlockCourse,
    generateVideoToken,
    getTotalRemainingSeats,
    isModuleUnlocked,
    getUnlockedCourse,
    purchaseSeats
  };
};