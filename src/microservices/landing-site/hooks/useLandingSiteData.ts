import { useState, useEffect } from 'react';
import { landingSiteAPI } from '../services/LandingSiteAPI';

interface LandingSiteData {
  siteName: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
  };
  content: {
    hero: {
      title: string;
      subtitle: string;
      ctaText: string;
    };
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    pricing: {
      enabled: boolean;
      plans: Array<{
        name: string;
        price: string;
        features: string[];
        popular?: boolean;
      }>;
    };
  };
}

export const useLandingSiteData = (customConfig?: any) => {
  const [siteData, setSiteData] = useState<LandingSiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to determine domain-specific config
        const currentDomain = window.location.hostname;
        
        let data: LandingSiteData;
        if (currentDomain !== 'localhost' && currentDomain.includes('.')) {
          data = await landingSiteAPI.fetchSiteDataByDomain(currentDomain);
        } else {
          data = await landingSiteAPI.fetchSiteData(customConfig);
        }

        setSiteData(data);
      } catch (err) {
        console.error('Failed to load landing site data:', err);
        setError('Failed to load site configuration');
        
        // Fallback to default data
        const fallbackData = await landingSiteAPI.fetchSiteData();
        setSiteData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteData();
  }, [customConfig]);

  const trackEvent = async (event: string, properties?: Record<string, any>) => {
    try {
      await landingSiteAPI.trackEvent(event, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const submitContact = async (data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) => {
    try {
      const result = await landingSiteAPI.submitContactForm(data);
      await trackEvent('contact_form_submitted', { email: data.email });
      return result;
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      return {
        success: false,
        message: 'Failed to submit form. Please try again.'
      };
    }
  };

  return {
    siteData: siteData!,
    isLoading,
    error,
    trackEvent,
    submitContact,
  };
};