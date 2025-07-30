import { useState, useEffect } from 'react';
import { ContentSettings } from '../types';

// Mock content settings for now
const defaultSettings: ContentSettings = {
  auto_publish: false,
  seo_optimization: true,
  social_sharing: true,
  comment_moderation: true,
  email_notifications: true
};

export const useContentSettings = () => {
  const [settings, setSettings] = useState<ContentSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = async (newSettings: Partial<ContentSettings>) => {
    try {
      setLoading(true);
      // In a real implementation, this would save to the database
      setSettings(prev => ({ ...prev, ...newSettings }));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings
  };
};