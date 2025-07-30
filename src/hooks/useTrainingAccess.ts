import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingAccessInfo {
  hasAccess: boolean;
  reason?: string;
  canPurchaseAdditionalSeat?: boolean;
  seatPrice?: number;
}

interface CompanySeatInfo {
  total_seats: number;
  used_seats: number;
  price_per_additional_seat: number;
  allow_additional_seats: boolean;
}

export const useTrainingAccess = () => {
  const [companySeatInfo, setCompanySeatInfo] = useState<CompanySeatInfo | null>(null);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const { user } = useAuth();

  const fetchCompanySeatInfo = async () => {
    try {
      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) return;

      // Get company's seat allocation and pricing info
      const { data, error } = await supabase
        .from('company_seat_allocations')
        .select(`
          total_seats,
          used_seats,
          course_packages!inner(price_per_additional_seat, allow_additional_seats)
        `)
        .eq('company_id', profile.company_id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCompanySeatInfo({
          total_seats: data.total_seats,
          used_seats: data.used_seats,
          price_per_additional_seat: data.course_packages.price_per_additional_seat,
          allow_additional_seats: data.course_packages.allow_additional_seats
        });
      }
    } catch (error) {
      console.error('Error fetching company seat info:', error);
    }
  };

  const fetchUnlockedCourses = async () => {
    try {
      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) return;

      // Get unlocked courses for the company
      const { data, error } = await supabase
        .from('company_unlocked_courses')
        .select('training_module_id')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      
      const courseIds = data?.map(item => item.training_module_id) || [];
      setUnlockedCourses(courseIds);
    } catch (error) {
      console.error('Error fetching unlocked courses:', error);
    }
  };

  const checkTrainingAccess = (trainingModuleId: string): TrainingAccessInfo => {
    // If no seat info available, allow access (fallback to old system)
    if (!companySeatInfo) {
      return { hasAccess: true };
    }

    // Check if course is unlocked
    const isUnlocked = unlockedCourses.includes(trainingModuleId);
    
    if (isUnlocked) {
      return { hasAccess: true };
    }

    // Course is locked - check if additional seats can be purchased
    const hasAvailableSeats = companySeatInfo.used_seats < companySeatInfo.total_seats;
    
    if (hasAvailableSeats) {
      return {
        hasAccess: false,
        reason: 'Course not unlocked - available seats can be used',
        canPurchaseAdditionalSeat: false
      };
    }

    // No available seats - check if additional seats can be purchased
    return {
      hasAccess: false,
      reason: 'All seats used - additional seat required',
      canPurchaseAdditionalSeat: companySeatInfo.allow_additional_seats,
      seatPrice: companySeatInfo.price_per_additional_seat
    };
  };

  const logAccessAttempt = async (trainingModuleId: string, accessGranted: boolean, reason?: string) => {
    try {
      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) return;

      // Log the access attempt
      const { error: logError } = await supabase
        .from('seat_access_logs')
        .insert({
          company_id: profile.company_id,
          training_module_id: trainingModuleId,
          user_id: user?.id,
          access_granted: accessGranted,
          reason: reason || null,
          attempted_at: new Date().toISOString()
        });
      
      if (logError) {
        console.error('Error logging access attempt:', logError);
      }
    } catch (error) {
      console.error('Error logging access attempt:', error);
    }
  };

  const unlockCourseWithAdditionalSeat = async (trainingModuleId: string) => {
    try {
      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      // Add the course to unlocked courses
      const { error: unlockError } = await supabase
        .from('company_unlocked_courses')
        .insert({
          company_id: profile.company_id,
          training_module_id: trainingModuleId,
          unlocked_by: user?.id,
          unlocked_at: new Date().toISOString()
        });

      if (unlockError) throw unlockError;

      // Update used seats count
      if (companySeatInfo) {
        const { error: updateError } = await supabase
          .from('company_seat_allocations')
          .update({ 
            used_seats: companySeatInfo.used_seats + 1,
            total_seats: companySeatInfo.total_seats + 1 // Add the purchased seat
          })
          .eq('company_id', profile.company_id)
          .eq('status', 'active');

        if (updateError) throw updateError;
      }

      // Refresh data
      await Promise.all([fetchCompanySeatInfo(), fetchUnlockedCourses()]);

      return true;
    } catch (error) {
      console.error('Error unlocking course with additional seat:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompanySeatInfo();
      fetchUnlockedCourses();
    }
  }, [user]);

  return {
    companySeatInfo,
    unlockedCourses,
    checkTrainingAccess,
    logAccessAttempt,
    unlockCourseWithAdditionalSeat,
    refetch: () => {
      fetchCompanySeatInfo();
      fetchUnlockedCourses();
    }
  };
};