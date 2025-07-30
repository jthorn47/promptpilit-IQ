import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyData = () => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get user's company_id from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (profile?.company_id) {
          // Get company details
          const { data: company } = await supabase
            .from('company_settings')
            .select('company_name, company_logo_url')
            .eq('id', profile.company_id)
            .single();

          if (company) {
            setCompanyName(company.company_name);
            setCompanyLogo(company.company_logo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  return {
    companyLogo,
    companyName,
    loading,
  };
};