import React from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { useLandingSiteData } from './hooks/useLandingSiteData';

interface LandingSiteConfig {
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
      }>;
    };
  };
}

interface LandingSiteModuleProps {
  config?: Partial<LandingSiteConfig>;
  onNavigateToAuth?: () => void;
  onGetStarted?: () => void;
}

/**
 * LandingSite Microservice - Public Marketing Site
 * 
 * Features:
 * - Self-contained public marketing site
 * - No dependencies on core system or user state
 * - Supports dynamic theming for white-label use cases
 * - Modular content management
 * - Built with Tailwind + Framer Motion
 */
export const LandingSiteModule: React.FC<LandingSiteModuleProps> = ({
  config,
  onNavigateToAuth,
  onGetStarted
}) => {
  const { siteData, isLoading } = useLandingSiteData(config);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5"
      style={{
        '--landing-primary': siteData.theme.primaryColor,
        '--landing-secondary': siteData.theme.secondaryColor,
      } as React.CSSProperties}
    >
      <HeroSection 
        config={siteData.content.hero}
        theme={siteData.theme}
        onNavigateToAuth={onNavigateToAuth}
        onGetStarted={onGetStarted}
      />
      
      <FeaturesSection 
        features={siteData.content.features}
        theme={siteData.theme}
      />
      
      {siteData.content.pricing.enabled && (
        <PricingSection 
          plans={siteData.content.pricing.plans}
          theme={siteData.theme}
          onGetStarted={onGetStarted}
        />
      )}
    </motion.div>
  );
};

// Module registration metadata
export const LandingSiteModuleMetadata = {
  id: 'landing-site',
  name: 'Landing Site',
  version: '1.0.0',
  type: 'microservice' as const,
  category: 'public',
  description: 'Public-facing marketing site with dynamic theming',
  routes: ['/'],
  permissions: [], // No auth required - public module
  dependencies: [],
  apis: ['LandingSiteAPI'],
  config: {
    isPublic: true,
    selfHostable: true,
    supportsDynamicTheming: true,
    supportsWhiteLabel: true,
  }
};