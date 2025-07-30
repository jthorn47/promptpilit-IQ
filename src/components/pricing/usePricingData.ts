import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoursePackage {
  id: string;
  name: string;
  description: string;
  course_count: number;
  display_order: number;
  is_active: boolean;
}

interface PricingTier {
  id: string;
  min_users: number;
  max_users: number;
  is_active: boolean;
}

interface PricingMatrix {
  id: string;
  pricing_tier_id: string;
  course_package_id: string;
  price_per_user: number;
  annual_discount_percentage: number;
  three_year_discount_percentage: number;
  pricing_tier: PricingTier;
  course_package: CoursePackage;
}

export const usePricingData = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [matrix, setMatrix] = useState<PricingMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch course packages
      const { data: packagesData } = await supabase
        .from('course_packages')
        .select('*')
        .order('display_order');
      
      // Fetch pricing tiers
      const { data: tiersData } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('min_users');

      // Fetch pricing matrix with relationships
      const { data: matrixData } = await supabase
        .from('pricing_matrix')
        .select(`
          *,
          pricing_tier:pricing_tiers(*),
          course_package:course_packages(*)
        `);

      setPackages(packagesData || []);
      setTiers(tiersData || []);
      setMatrix(matrixData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pricing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (id: string, data: Partial<CoursePackage>) => {
    try {
      const { error } = await supabase
        .from('course_packages')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Package updated successfully" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    }
  };

  const updatePricingMatrix = async (id: string, data: Partial<PricingMatrix>) => {
    try {
      const { error } = await supabase
        .from('pricing_matrix')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Pricing updated successfully" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    packages,
    tiers,
    matrix,
    loading,
    fetchData,
    updatePackage,
    updatePricingMatrix
  };
};