import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .eq('is_public', true);

        if (error) {
          console.error('Error fetching system settings:', error);
        } else {
          const settingsMap = data.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {} as Record<string, any>);
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    getSettingValue: (key: string, defaultValue?: any) => {
      return settings[key] || defaultValue;
    }
  };
};