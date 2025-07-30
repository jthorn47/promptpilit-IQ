import React from 'react';
import { Shield, Award, CheckCircle, Star } from 'lucide-react';

export const ClientLogos = () => {
  const certifications = [
    { icon: Shield, text: 'SOC 2 Certified' },
    { icon: Award, text: 'SCORM Compliant' },
    { icon: CheckCircle, text: 'Cal/OSHA Approved' },
    { icon: Star, text: 'ISO 27001' }
  ];

  const clientLogos = [
    'Fortune 500 Companies',
    'Healthcare Systems',
    'Financial Institutions',
    'Manufacturing Leaders',
    'Government Agencies',
    'Educational Institutions'
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Industry Certifications */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-muted-foreground">
            Trusted by Industry Leaders
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {certifications.map((cert, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 p-4 group-hover:from-primary/30 group-hover:to-primary-glow/30 transition-colors duration-300">
                  <cert.icon className="w-full h-full text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground text-center">
                  {cert.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Client Categories */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Serving diverse industries with specialized compliance training
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {clientLogos.map((category, index) => (
              <div 
                key={index}
                className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
              >
                <span className="text-sm font-medium text-muted-foreground text-center block">
                  {category}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 inline-flex items-center space-x-2 text-primary">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold">4.9/5 Customer Satisfaction</span>
            <Star className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
};