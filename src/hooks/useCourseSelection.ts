import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  available_for_licensing: boolean;
  license_category: string;
}

interface CompanyAllocation {
  id: string;
  total_seats: number;
  used_seats: number;
  status: string;
}

export const useCourseSelection = () => {
  const [availableCourses, setAvailableCourses] = useState<TrainingModule[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [companyAllocation, setCompanyAllocation] = useState<CompanyAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('id, title, description, available_for_licensing, license_category')
        .eq('available_for_licensing', true)
        .order('title');

      if (error) throw error;
      
      const typedData: TrainingModule[] = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        available_for_licensing: item.available_for_licensing,
        license_category: item.license_category
      })) || [];
      
      setAvailableCourses(typedData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load available courses",
        variant: "destructive",
      });
    }
  };

  const fetchCompanyAllocation = async () => {
    if (!user?.id) return;
    
    try {
      // Get user's company
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.company_id) return;

      // Get company's seat allocation
      const { data, error } = await supabase
        .from('company_seat_allocations')
        .select('id, total_seats, used_seats, status')
        .eq('company_id', profile.company_id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company allocation:', error);
        return;
      }
      
      setCompanyAllocation(data);
    } catch (error) {
      console.error('Error fetching company allocation:', error);
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

      // Get already unlocked courses
      const { data, error } = await supabase
        .from('company_unlocked_courses')
        .select('training_module_id')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      
      const unlockedIds = data?.map(item => item.training_module_id) || [];
      setSelectedCourseIds(unlockedIds);
    } catch (error) {
      console.error('Error fetching unlocked courses:', error);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    const availableSlots = (companyAllocation?.total_seats || 0) - (companyAllocation?.used_seats || 0);
    const currentlySelected = selectedCourseIds.length;
    
    if (selectedCourseIds.includes(courseId)) {
      // Remove from selection
      setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    } else {
      // Add to selection if slots available
      if (currentlySelected < availableSlots) {
        setSelectedCourseIds(prev => [...prev, courseId]);
      } else {
        toast({
          title: "Seat Limit Reached",
          description: `You can only select ${availableSlots} courses with your current plan.`,
          variant: "destructive",
        });
      }
    }
  };

  const submitCourseSelection = async () => {
    if (!user || selectedCourseIds.length === 0) return;

    try {
      setSubmitting(true);

      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      // Clear existing unlocked courses
      await supabase
        .from('company_unlocked_courses')
        .delete()
        .eq('company_id', profile.company_id);

      // Insert new selections
      const courseData = selectedCourseIds.map(courseId => ({
        company_id: profile.company_id,
        training_module_id: courseId,
        unlocked_by: user.id,
        unlocked_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('company_unlocked_courses')
        .insert(courseData);

      if (insertError) throw insertError;

      // Update used seats
      if (companyAllocation) {
        const { error: updateError } = await supabase
          .from('company_seat_allocations')
          .update({ used_seats: selectedCourseIds.length })
          .eq('id', companyAllocation.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Courses Unlocked",
        description: `Successfully unlocked ${selectedCourseIds.length} courses for your team.`,
      });

      return true;
    } catch (error) {
      console.error('Error submitting course selection:', error);
      toast({
        title: "Error",
        description: "Failed to unlock courses. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchAvailableCourses(),
          fetchCompanyAllocation(),
          fetchUnlockedCourses()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  const availableSlots = (companyAllocation?.total_seats || 0) - (companyAllocation?.used_seats || 0);
  const hasCompanyPlan = companyAllocation !== null;

  return {
    availableCourses,
    selectedCourseIds,
    companyAllocation,
    availableSlots,
    hasCompanyPlan,
    loading,
    submitting,
    toggleCourseSelection,
    submitCourseSelection,
    refetch: () => {
      fetchAvailableCourses();
      fetchCompanyAllocation();
      fetchUnlockedCourses();
    }
  };
};