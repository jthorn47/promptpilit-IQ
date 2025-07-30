/**
 * LandingSite API Service
 * 
 * Handles data fetching for the landing site microservice
 * Supports dynamic content management and theming
 */

interface LandingSiteContent {
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

class LandingSiteAPIService {
  private defaultContent: LandingSiteContent = {
    siteName: 'EaseLearn',
    theme: {
      primaryColor: 'hsl(var(--primary))',
      secondaryColor: 'hsl(var(--secondary))',
    },
    content: {
      hero: {
        title: 'Transform Your Workforce with Intelligent Learning',
        subtitle: 'Empower your team with AI-driven training, seamless compliance management, and data-driven insights that drive real business results.',
        ctaText: 'Start Free Trial'
      },
      features: [
        {
          title: 'AI-Powered Learning',
          description: 'Personalized learning paths that adapt to each learner\'s pace and style for maximum engagement and retention.',
          icon: 'Brain'
        },
        {
          title: 'Compliance Made Easy',
          description: 'Automated compliance tracking and reporting that keeps your organization audit-ready at all times.',
          icon: 'Shield'
        },
        {
          title: 'Advanced Analytics',
          description: 'Deep insights into learning performance, completion rates, and business impact with real-time dashboards.',
          icon: 'BarChart3'
        },
        {
          title: 'Mobile Learning',
          description: 'Learn anywhere, anytime with our responsive mobile platform that works seamlessly across all devices.',
          icon: 'Smartphone'
        },
        {
          title: 'Integration Ready',
          description: 'Connect with your existing HR, CRM, and business systems through our robust API and pre-built integrations.',
          icon: 'Zap'
        },
        {
          title: 'Enterprise Security',
          description: 'Bank-level security with SOC 2 compliance, GDPR readiness, and enterprise-grade data protection.',
          icon: 'Lock'
        }
      ],
      pricing: {
        enabled: true,
        plans: [
          {
            name: 'Starter',
            price: '$29',
            features: [
              'Up to 50 learners',
              'Core training modules',
              'Basic analytics',
              'Email support',
              'Mobile access',
              'Basic integrations'
            ]
          },
          {
            name: 'Professional',
            price: '$79',
            popular: true,
            features: [
              'Up to 500 learners',
              'Advanced AI features',
              'Custom branding',
              'Advanced analytics',
              'Priority support',
              'All integrations',
              'Compliance tracking',
              'Custom content'
            ]
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited learners',
              'White-label solution',
              'Dedicated success manager',
              'Custom development',
              'SSO integration',
              'Advanced security',
              'SLA guarantee',
              'On-premise options'
            ]
          }
        ]
      }
    }
  };

  /**
   * Fetch landing site configuration
   * In a real implementation, this would fetch from a CMS or API
   */
  async fetchSiteData(customConfig?: any): Promise<LandingSiteContent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Merge custom config with defaults
    if (customConfig) {
      return this.mergeConfig(this.defaultContent, customConfig);
    }

    return this.defaultContent;
  }

  /**
   * Fetch site data by domain (for white-label support)
   */
  async fetchSiteDataByDomain(domain: string): Promise<LandingSiteContent> {
    // Simulate domain-specific config lookup
    const domainConfigs: Record<string, any> = {
      'haloiq.com': {
        siteName: 'HaaLO IQ',
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
        },
        content: {
          hero: {
            title: 'Intelligent HR & Workforce Management',
            subtitle: 'Streamline your HR operations with AI-powered tools for recruitment, training, and workforce optimization.',
            ctaText: 'Get Started'
          }
        }
      },
      'easelearn.com': {
        siteName: 'EaseLearn',
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#06b6d4',
        }
      }
    };

    const domainConfig = domainConfigs[domain] || {};
    return this.fetchSiteData(domainConfig);
  }

  /**
   * Submit contact form
   */
  async submitContactForm(data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Contact form submitted:', data);
    
    return {
      success: true,
      message: 'Thank you for your message. We\'ll get back to you soon!'
    };
  }

  /**
   * Track analytics events
   */
  async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    // In production, this would send to analytics service
    console.log('Landing site event:', event, properties);
  }

  private mergeConfig(defaultConfig: LandingSiteContent, customConfig: any): LandingSiteContent {
    return {
      ...defaultConfig,
      ...customConfig,
      theme: {
        ...defaultConfig.theme,
        ...customConfig.theme,
      },
      content: {
        ...defaultConfig.content,
        ...customConfig.content,
        hero: {
          ...defaultConfig.content.hero,
          ...customConfig.content?.hero,
        },
        features: customConfig.content?.features || defaultConfig.content.features,
        pricing: {
          ...defaultConfig.content.pricing,
          ...customConfig.content?.pricing,
        },
      },
    };
  }
}

export const landingSiteAPI = new LandingSiteAPIService();