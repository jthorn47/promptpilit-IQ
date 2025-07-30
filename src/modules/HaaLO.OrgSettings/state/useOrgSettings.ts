import { useState, useEffect } from 'react';
import { OrgSettingsService, OrganizationSettings } from '../services/OrgSettingsService';
import { useToast } from '@/hooks/use-toast';

const orgSettingsService = new OrgSettingsService();

export const useOrgSettings = (companyId: string) => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      loadSettings();
    }
  }, [companyId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await orgSettingsService.getSettings(companyId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<OrganizationSettings>) => {
    setSaving(true);
    try {
      const success = await orgSettingsService.updateSettings(companyId, newSettings);
      if (success) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
        toast({
          title: "Success",
          description: "Organization settings updated successfully",
        });
        return true;
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setSaving(true);
    try {
      const logoUrl = await orgSettingsService.uploadLogo(companyId, file);
      if (logoUrl) {
        await updateSettings({ logo_url: logoUrl });
        return logoUrl;
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    uploadLogo,
    refetch: loadSettings
  };
};