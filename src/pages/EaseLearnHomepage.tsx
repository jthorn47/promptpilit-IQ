import React from 'react';
import { HeroSection } from '@/components/homepage/HeroSection';
import { ComparisonGrid } from '@/components/homepage/ComparisonGrid';
import { HowItWorks } from '@/components/homepage/HowItWorks';
import { ComplianceCarousel } from '@/components/homepage/ComplianceCarousel';
import { EaseLearnXSection } from '@/components/homepage/EaseLearnXSection';
import { ClientLogos } from '@/components/homepage/ClientLogos';
import { Testimonials } from '@/components/homepage/Testimonials';
import { CallToActionFooter } from '@/components/homepage/CallToActionFooter';
import { NeuralBackground } from '@/components/homepage/NeuralBackground';

export const EaseLearnHomepage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Neural network background animation */}
      <NeuralBackground />
      
      {/* Page content */}
      <div className="relative z-10">
        <HeroSection />
        <ComparisonGrid />
        <HowItWorks />
        <ComplianceCarousel />
        <EaseLearnXSection />
        <ClientLogos />
        <Testimonials />
        <CallToActionFooter />
      </div>
    </div>
  );
};