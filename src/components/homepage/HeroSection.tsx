import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Shield, Brain, Rocket, CheckCircle, Users, Award } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-ambient opacity-50"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-neural rounded-full animate-float opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-primary rounded-full animate-float [animation-delay:2s] opacity-20"></div>
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/20 rounded-full animate-glow [animation-delay:1s]"></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-primary-glow/30 rounded-full animate-halo-pulse [animation-delay:3s]"></div>
      
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 glass-strong px-6 py-3 rounded-full mb-8 animate-scale-in">
          <Award className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Enterprise-Grade Training Platform</span>
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 animate-slide-up">
          <div className="flex flex-col items-center gap-4">
            <span className="text-gradient leading-tight">Transform Your</span>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="text-foreground">Workforce</span>
              <div className="relative">
                <Brain className="w-16 h-16 text-primary animate-neural-pulse" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-primary/30 rounded-full animate-ping"></div>
              </div>
            </div>
            <span className="text-gradient">Training</span>
          </div>
        </h1>
        
        {/* Enhanced Subheading with Icons */}
        <div className="mb-12 animate-fade-in [animation-delay:0.3s]">
          <p className="text-2xl sm:text-3xl text-muted-foreground mb-6 max-w-4xl mx-auto font-light">
            The only LMS that combines <span className="text-primary font-semibold">AI intelligence</span>, 
            <span className="text-primary font-semibold"> regulatory compliance</span>, and 
            <span className="text-primary font-semibold"> engagement mastery</span>
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Brain, text: "AI-Powered Learning" },
              { icon: Shield, text: "Cal/OSHA Compliant" },
              { icon: CheckCircle, text: "SCORM Ready" },
              { icon: Rocket, text: "Instant Deployment" }
            ].map((feature, index) => (
              <div
                key={feature.text}
                className="inline-flex items-center gap-2 card-halo px-4 py-2 animate-scale-in"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced CTA Section */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in [animation-delay:0.6s]">
          <button className="btn-halo text-lg px-10 py-4 group hover-magnetic">
            <Rocket className="mr-3 h-5 w-5 group-hover:animate-bounce" />
            Start Free Trial
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Video will be embedded by user - no placeholder button */}
        </div>

        {/* Social Proof */}
        <div className="animate-fade-in [animation-delay:0.8s]">
          <p className="text-sm text-muted-foreground mb-4">Trusted by leading organizations</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <Users className="w-4 h-4" />
            <span>10,000+ employees trained</span>
            <span>•</span>
            <CheckCircle className="w-4 h-4" />
            <span>99.9% compliance rate</span>
            <span>•</span>
            <Award className="w-4 h-4" />
            <span>Industry certified</span>
          </div>
        </div>
      </div>

      {/* Floating Interactive Elements */}
      <div className="absolute top-32 right-20 animate-float [animation-delay:1s]">
        <div className="card-halo p-4 hover-glow cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">AI Analytics</div>
              <div className="text-xs text-muted-foreground">Real-time insights</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 left-20 animate-float [animation-delay:2.5s]">
        <div className="card-halo p-4 hover-glow cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Compliance</div>
              <div className="text-xs text-muted-foreground">100% Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};