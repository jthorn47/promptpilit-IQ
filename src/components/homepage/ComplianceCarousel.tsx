import React from 'react';
import { Shield, FileCheck, Heart, DollarSign, Users, Lock } from 'lucide-react';

export const ComplianceCarousel = () => {
  const complianceItems = [
    {
      icon: Shield,
      title: 'SB 553',
      subtitle: 'Workplace Violence Prevention',
      description: 'California workplace safety compliance training'
    },
    {
      icon: Heart,
      title: 'HIPAA',
      subtitle: 'Healthcare Privacy',
      description: 'Medical information protection training'
    },
    {
      icon: DollarSign,
      title: 'AML',
      subtitle: 'Anti-Money Laundering',
      description: 'Financial compliance and detection training'
    },
    {
      icon: FileCheck,
      title: 'OSHA',
      subtitle: 'Occupational Safety',
      description: 'Workplace safety and health standards'
    },
    {
      icon: Users,
      title: 'Harassment Prevention',
      subtitle: 'Workplace Respect',
      description: 'Creating inclusive work environments'
    },
    {
      icon: Lock,
      title: 'Data Security',
      subtitle: 'Information Protection',
      description: 'Cybersecurity awareness and protocols'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SCORM-Compliant
            </span> Training Library
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Industry-leading compliance courses, ready to deploy
          </p>
        </div>
        
        {/* Scrollable carousel */}
        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
            {complianceItems.map((item, index) => (
              <div 
                key={index}
                className="w-80 bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-primary-glow/20 p-4 mb-4 group-hover:from-primary/30 group-hover:to-primary-glow/30 transition-colors duration-300">
                  <item.icon className="w-full h-full text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <h4 className="text-sm text-primary font-semibold mb-3">{item.subtitle}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                
                {/* Learn more link */}
                <div className="mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">← Scroll to explore all compliance topics →</p>
        </div>
      </div>
    </section>
  );
};