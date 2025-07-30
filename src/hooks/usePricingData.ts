import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoursePackage {
  id: string;
  name: string;
  description: string;
  course_count: number;
  display_order: number;
}

export interface PricingTier {
  id: string;
  min_users: number;
  max_users: number;
}

export interface PricingMatrix {
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
  return useQuery({
    queryKey: ['pricing-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_matrix')
        .select(`
          *,
          pricing_tier:pricing_tiers(*),
          course_package:course_packages(*)
        `);

      if (error) throw error;
      return data as PricingMatrix[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCoursePackages = () => {
  return useQuery({
    queryKey: ['course-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as CoursePackage[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const calculatePricing = (
  employeeCount: number,
  packageId: string,
  termYears: 1 | 3,
  pricingData: PricingMatrix[]
) => {
  // Find the appropriate pricing tier
  const applicablePricing = pricingData.find(
    (item) =>
      employeeCount >= item.pricing_tier.min_users &&
      employeeCount <= item.pricing_tier.max_users &&
      item.course_package_id === packageId
  );

  if (!applicablePricing) return null;

  const annualPricePerUser = applicablePricing.price_per_user;
  const baseAnnualPrice = annualPricePerUser * employeeCount;
  const discountPercentage = termYears === 3 
    ? applicablePricing.three_year_discount_percentage 
    : 0;
  
  const discountAmount = (baseAnnualPrice * discountPercentage) / 100;
  const annualPrice = baseAnnualPrice - discountAmount;
  const totalPrice = annualPrice * termYears;

  return {
    basePrice: baseAnnualPrice,
    monthlyPrice: annualPrice / 12, // For display purposes
    totalPrice,
    annualPrice,
    discountAmount,
    discountPercentage,
    pricePerUser: annualPricePerUser,
    savings: termYears === 3 ? discountAmount * 3 : 0
  };
};