import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DisclaimerSettings {
  id: string;
  training_module_id: string;
  legal_disclaimer_text?: string;
  legal_disclaimer_enabled: boolean;
  legal_disclaimer_position: 'start' | 'end' | 'both';
  acknowledgment_disclaimer_text?: string;
  acknowledgment_disclaimer_enabled: boolean;
}

interface AcknowledmentStatus {
  legal_disclaimer_acknowledged: boolean;
  acknowledgment_disclaimer_acknowledged: boolean;
  legal_disclaimer_acknowledged_at?: string;
  acknowledgment_disclaimer_acknowledged_at?: string;
}

export const useTrainingDisclaimers = (moduleId: string) => {
  const [disclaimerSettings, setDisclaimerSettings] = useState<DisclaimerSettings | null>(null);
  const [acknowledgmentStatus, setAcknowledmentStatus] = useState<AcknowledmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (moduleId && user) {
      fetchDisclaimerData();
    }
  }, [moduleId, user]);

  const fetchDisclaimerData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch disclaimer settings for the module
      const { data: settings, error: settingsError } = await supabase
        .from('training_disclaimers')
        .select('*')
        .eq('training_module_id', moduleId)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setDisclaimerSettings(settings ? {
        ...settings,
        legal_disclaimer_position: settings.legal_disclaimer_position as 'start' | 'end' | 'both'
      } : null);

      // Fetch user's acknowledgment status for this module
      const { data: acknowledgment, error: acknowledgmentError } = await supabase
        .from('training_acknowledgments')
        .select('legal_disclaimer_acknowledged, acknowledgment_disclaimer_acknowledged, legal_disclaimer_acknowledged_at, acknowledgment_disclaimer_acknowledged_at')
        .eq('training_module_id', moduleId)
        .eq('learner_id', user.id)
        .maybeSingle();

      if (acknowledgmentError && acknowledgmentError.code !== 'PGRST116') {
        throw acknowledgmentError;
      }

      setAcknowledmentStatus(acknowledgment || {
        legal_disclaimer_acknowledged: false,
        acknowledgment_disclaimer_acknowledged: false
      });

    } catch (error) {
      console.error('Error fetching disclaimer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const needsLegalDisclaimer = (position: 'start' | 'end') => {
    if (!disclaimerSettings || !disclaimerSettings.legal_disclaimer_enabled) return false;
    if (!acknowledgmentStatus?.legal_disclaimer_acknowledged) return false;
    
    return disclaimerSettings.legal_disclaimer_position === position || 
           disclaimerSettings.legal_disclaimer_position === 'both';
  };

  const needsAcknowledmentDisclaimer = () => {
    if (!disclaimerSettings || !disclaimerSettings.acknowledgment_disclaimer_enabled) return false;
    return !acknowledgmentStatus?.acknowledgment_disclaimer_acknowledged;
  };

  const canProceedWithTraining = () => {
    if (!disclaimerSettings) return true;

    // Check if acknowledgment disclaimer is required but not acknowledged
    if (disclaimerSettings.acknowledgment_disclaimer_enabled && 
        !acknowledgmentStatus?.acknowledgment_disclaimer_acknowledged) {
      return false;
    }

    return true;
  };

  const recordAcknowledment = async (type: 'legal' | 'acknowledgment') => {
    if (!user) return false;

    try {
      const updateData: any = {
        training_module_id: moduleId,
        learner_id: user.id,
        user_agent: navigator.userAgent,
      };

      if (type === 'legal') {
        updateData.legal_disclaimer_acknowledged = true;
        updateData.legal_disclaimer_acknowledged_at = new Date().toISOString();
      } else {
        updateData.acknowledgment_disclaimer_acknowledged = true;
        updateData.acknowledgment_disclaimer_acknowledged_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('training_acknowledgments')
        .upsert(updateData, {
          onConflict: 'training_module_id,learner_id'
        });

      if (error) throw error;

      // Refresh acknowledgment status
      await fetchDisclaimerData();
      return true;
    } catch (error) {
      console.error('Error recording acknowledgment:', error);
      return false;
    }
  };

  return {
    disclaimerSettings,
    acknowledgmentStatus,
    loading,
    needsLegalDisclaimer,
    needsAcknowledmentDisclaimer,
    canProceedWithTraining,
    recordAcknowledment,
    refetch: fetchDisclaimerData
  };
};