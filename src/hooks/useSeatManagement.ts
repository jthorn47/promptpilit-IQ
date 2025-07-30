import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SeatPlanConfiguration {
  id: string;
  plan_name: string;
  included_seats: number;
  price_per_additional_seat: number;
  allow_additional_seats: boolean;
  max_total_seats: number | null;
  auto_unlock_on_purchase: boolean;
  is_active: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  available_for_licensing: boolean;
  license_category: string;
  requires_special_approval: boolean;
  seat_price_override: number | null;
  visibility_level: string;
  is_active: boolean;
}

interface CompanyAllocation {
  id: string;
  company_id: string;
  company_name: string;
  package_name: string;
  total_seats: number;
  used_seats: number;
  purchased_seats: number;
  status: string;
}

export const useSeatManagement = () => {
  const [seatConfigs, setSeatConfigs] = useState<SeatPlanConfiguration[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [companyAllocations, setCompanyAllocations] = useState<CompanyAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSeatConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_plan_configurations')
        .select('*')
        .order('plan_name');

      if (error) throw error;
      setSeatConfigs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch seat configurations",
        variant: "destructive",
      });
    }
  };

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('id, title, description, available_for_licensing, license_category, requires_special_approval, seat_price_override, visibility_level')
        .order('title');

      if (error) throw error;
      
      const formattedData = data?.map((module: any) => ({
        ...module,
        is_active: true, // Since we're only getting active modules
      })) || [];
      
      setTrainingModules(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch training modules",
        variant: "destructive",
      });
    }
  };

  const fetchCompanyAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_seat_allocations')
        .select(`
          *,
          company_settings!inner(company_name),
          course_packages!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((allocation: any) => ({
        id: allocation.id,
        company_id: allocation.company_id,
        company_name: allocation.company_settings.company_name,
        package_name: allocation.course_packages.name,
        total_seats: allocation.total_seats,
        used_seats: allocation.used_seats,
        purchased_seats: allocation.purchased_seats,
        status: allocation.status,
      })) || [];

      setCompanyAllocations(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch company allocations",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSeatConfigs(),
      fetchTrainingModules(),
      fetchCompanyAllocations(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    seatConfigs,
    trainingModules,
    companyAllocations,
    loading,
    refetch: fetchData,
  };
};