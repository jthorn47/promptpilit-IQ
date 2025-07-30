import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features,
  theme
}) => {
  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Icons.Star;
  };

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, manage, and deliver exceptional learning experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = getIcon(feature.icon);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 mb-6 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                  <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/20"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Enterprise-Ready Platform
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Built for scale with enterprise-grade security, compliance features, 
              and dedicated support to ensure your organization's success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['SOC 2 Compliant', 'GDPR Ready', '99.9% Uptime', '24/7 Support'].map((badge, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};