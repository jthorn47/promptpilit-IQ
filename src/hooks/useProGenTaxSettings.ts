import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TaxSettings {
  fica_employer_rate: number;
  fica_wage_cap: number;
  medicare_employer_rate: number;
  futa_gross_rate: number;
  futa_wage_base: number;
  futa_credit_reduction: number;
  futa_net_rate: number;
}

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  fica_employer_rate: 6.2,
  fica_wage_cap: 176100,
  medicare_employer_rate: 1.45,
  futa_gross_rate: 6.0,
  futa_wage_base: 7000,
  futa_credit_reduction: 5.4,
  futa_net_rate: 0.6,
};

export const useProGenTaxSettings = () => {
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .eq('category', 'propgen')
          .eq('is_public', false);

        if (error) {
          console.error('Error fetching PropGEN tax settings:', error);
          setError('Failed to load tax settings');
          return;
        }

        if (data && data.length > 0) {
          const settings = data.reduce((acc, setting) => {
            const key = setting.key as keyof TaxSettings;
            if (key in DEFAULT_TAX_SETTINGS) {
              acc[key] = parseFloat(String(setting.value)) || DEFAULT_TAX_SETTINGS[key];
            }
            return acc;
          }, {} as Partial<TaxSettings>);

          setTaxSettings({ ...DEFAULT_TAX_SETTINGS, ...settings });
        }
      } catch (err) {
        console.error('Error fetching PropGEN tax settings:', err);
        setError('Failed to load tax settings');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxSettings();
  }, []);

  const getTaxRate = (key: keyof TaxSettings): number => {
    return taxSettings[key];
  };

  const getWageCap = (taxType: 'fica' | 'futa'): number => {
    return taxType === 'fica' ? taxSettings.fica_wage_cap : taxSettings.futa_wage_base;
  };

  return {
    taxSettings,
    loading,
    error,
    getTaxRate,
    getWageCap,
  };
};