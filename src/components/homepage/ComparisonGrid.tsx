import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonGrid = () => {
  const features = [
    { feature: 'AI-Powered Learning Paths', legacy: false, easelearn: true },
    { feature: 'Real-time Analytics', legacy: false, easelearn: true },
    { feature: 'SCORM 2004 Compliance', legacy: true, easelearn: true },
    { feature: 'Mobile-First Design', legacy: false, easelearn: true },
    { feature: 'Automated Compliance Tracking', legacy: false, easelearn: true },
    { feature: 'Custom Branding', legacy: false, easelearn: true },
    { feature: 'One-Click Reports', legacy: false, easelearn: true },
    { feature: 'Legacy Interface', legacy: true, easelearn: false },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Why Settle for <span className="text-muted-foreground line-through">Legacy LMS</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare outdated systems with EaseLearn's intelligent platform
          </p>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/30">
            <div className="p-6 text-center font-semibold text-muted-foreground">
              Feature
            </div>
            <div className="p-6 text-center font-semibold text-muted-foreground border-l border-border/50">
              Legacy LMS
            </div>
            <div className="p-6 text-center font-semibold bg-gradient-to-r from-primary/10 to-primary-glow/10 border-l border-border/50">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent font-bold">
                EaseLearn
              </span>
            </div>
          </div>
          
          {/* Features */}
          {features.map((item, index) => (
            <div 
              key={index} 
              className="grid grid-cols-3 border-t border-border/50 hover:bg-muted/20 transition-colors duration-200"
            >
              <div className="p-6 font-medium text-foreground">
                {item.feature}
              </div>
              <div className="p-6 text-center border-l border-border/50">
                {item.legacy ? (
                  <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-destructive mx-auto" />
                )}
              </div>
              <div className="p-6 text-center border-l border-border/50 bg-gradient-to-r from-primary/5 to-primary-glow/5">
                {item.easelearn ? (
                  <Check className="h-5 w-5 text-primary mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground mx-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};