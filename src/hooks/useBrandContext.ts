import { useState, useEffect } from 'react';
import { BrandService } from '@/services/BrandService';
import { BrandIdentity, BrandConfig } from '@/types/brand';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBrandContext = () => {
  const [userBrand, setUserBrand] = useState<BrandIdentity | null>(null);
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserBrand = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const brand = await BrandService.getUserBrandIdentity(user.id);
        setUserBrand(brand);
        
        if (brand) {
          const config = await BrandService.getBrandConfigWithDomain(brand);
          setBrandConfig(config);
          
          // Brand context will be handled at the application level for now
          console.log('Loaded brand context:', brand);
        }
      } catch (error) {
        console.error('Error loading user brand context:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserBrand();
  }, [user?.id]);

  const getBrandedEmailAddress = async (context?: string, emailType: string = 'noreply') => {
    if (!userBrand) return `${emailType}@easeworks.com`; // Fallback
    return BrandService.getBrandedEmailAddress(userBrand, context, emailType);
  };

  const isUserSuperAdmin = () => {
    // This would typically check user roles from auth context
    return user?.user_metadata?.role === 'super_admin';
  };

  return {
    userBrand,
    brandConfig,
    loading,
    getBrandedEmailAddress,
    isUserSuperAdmin,
    refreshBrandContext: () => {
      if (user?.id) {
        setLoading(true);
        // Reload brand context
      }
    }
  };
};