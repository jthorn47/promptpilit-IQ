import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Users, TrendingUp, CheckCircle, AlertTriangle, Clock, Star, Award, BarChart3,
  ArrowRight, Lock, Phone, Calendar, FileText, Zap
} from "lucide-react";
import { useBreakpoint } from "@/hooks/use-mobile";
import easeworksLogo from '@/assets/easeworks-logo.png';

import { SEOHead } from "@/components/SEOHead";
import { CompanyInfoFormFields } from "@/components/forms/CompanyInfoFormFields";
import { CompanyInfo } from "@/components/forms/types";
import { useCompanyInfoValidation } from "@/hooks/useFormValidation";

interface CompanyInfoFormProps {
  onComplete: (info: CompanyInfo) => void;
}

export type { CompanyInfo };

export const CompanyInfoForm = ({ onComplete }: CompanyInfoFormProps) => {
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoint();
  
  const [formData, setFormData] = useState<CompanyInfo>({
    company_name: "",
    company_email: "",
    company_size: "",
    industry: ""
  });
  const [showStickyButton, setShowStickyButton] = useState(false);

  const { errors, validateForm } = useCompanyInfoValidation();

  const handleUpdate = (updates: Partial<CompanyInfo>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm(formData)) {
      onComplete(formData);
    }
  };

  // Sticky CTA logic
  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById('assessment-form');
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        setShowStickyButton(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Immediately update meta tags for social sharing before component renders
  if (typeof window !== 'undefined') {
    // Update title immediately
    document.title = "HR Risk Assessment | Easeworks";
    
    // Remove all existing EaseLearn meta tags and replace with Easeworks
    const oldMetas = document.querySelectorAll('meta[property*="og:"], meta[name*="twitter:"], meta[name="description"]');
    oldMetas.forEach(meta => meta.remove());
    
    // Create fresh meta tags with correct Easeworks branding
    const metaTags = [
      { name: 'description', content: 'Take the free 10-minute HR Risk Assessment from Easeworks. Uncover hidden compliance risks and qualify for a custom HR Blueprint designed to protect your business.' },
      { property: 'og:title', content: 'Free HR Risk Assessment – Get Your Score' },
      { property: 'og:description', content: 'Uncover hidden HR compliance gaps and inefficiencies. Take the 10-minute Risk Assessment and qualify for a customized HR Blueprint from Easeworks.' },
      { property: 'og:image', content: 'https://easeworks.com/assets/og-score-thumbnail.png' },
      { property: 'og:url', content: 'https://score.easeworks.com' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Free HR Risk Assessment – Get Your Score' },
      { name: 'twitter:description', content: 'Find out your HR Risk Score in 10 minutes. Fix compliance issues and build a better HR model with Easeworks.' },
      { name: 'twitter:image', content: 'https://easeworks.com/assets/og-score-thumbnail.png' },
      { name: 'twitter:url', content: 'https://score.easeworks.com' }
    ];
    
    metaTags.forEach(({ property, name, content }) => {
      const meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
    
    console.log('✅ Easeworks meta tags updated for social sharing');
  }

  console.log('🎯 CompanyInfoForm loading on domain:', window.location.hostname);
  
  return (
    <>
      <SEOHead
        title="HR Risk Assessment | Easeworks"
        description="Take the free 10-minute HR Risk Assessment from Easeworks. Uncover hidden compliance risks and qualify for a custom HR Blueprint designed to protect your business."
        keywords="HR risk assessment, compliance audit, workplace safety, employment law, HR consulting, business risk management, HR Blueprint, Easeworks"
        ogTitle="Free HR Risk Assessment – Get Your Score"
        ogDescription="Uncover hidden HR compliance gaps and inefficiencies. Take the 10-minute Risk Assessment and qualify for a customized HR Blueprint from Easeworks."
        twitterTitle="Free HR Risk Assessment – Get Your Score"
        twitterDescription="Find out your HR Risk Score in 10 minutes. Fix compliance issues and build a better HR model with Easeworks."
        ogImage="https://easeworks.com/assets/og-score-thumbnail.png"
        canonicalUrl="https://score.easeworks.com"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "applicationCategory": "BusinessApplication",
          "name": "HR Risk Assessment Tool",
          "url": "https://score.easeworks.com",
          "description": "Free 10-minute HR Risk Assessment to uncover compliance gaps and inefficiencies",
          "provider": {
            "@type": "Organization",
            "name": "Easeworks",
            "url": "https://easeworks.com"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free HR Risk Assessment with customized action plan"
          }
        }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section - Mobile optimized */}
        <section className="relative bg-gradient-to-br from-[#655DC6]/5 via-background to-background">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className={`relative max-w-7xl mx-auto px-4 ${isMobile ? 'py-8' : 'py-16'}`}>
            
            {/* Header with Logo - Mobile optimized */}
            <div className={`flex justify-between items-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <div className="flex items-center gap-3">
                <img 
                  src={easeworksLogo}
                  alt="Easeworks"
                  className={`w-auto cursor-pointer hover:opacity-80 transition-opacity ${isMobile ? 'h-8' : 'h-10'}`}
                />
              </div>
              {!isMobile && (
                <Badge variant="secondary" className="hidden sm:flex">
                  <Clock className="w-3 h-3 mr-1" />
                  Only 10 minutes
                </Badge>
              )}
            </div>

            {/* Main Content Grid - Mobile optimized */}
            <div className={`grid items-start ${isMobile ? 'grid-cols-1 gap-4' : 'lg:grid-cols-12 gap-8'}`}>
              
              {/* Left Column - Risk Statistics & Social Proof - Hidden on mobile */}
              {!isMobile && (
                <motion.div 
                  className="lg:col-span-3 space-y-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    HR Risk Reality
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { stat: "78%", label: "Non-compliant Companies", desc: "Face regulatory penalties", color: "destructive", bg: "destructive/5" },
                      { stat: "15hrs", label: "Weekly Time Lost", desc: "To HR inefficiencies", color: "amber-500", bg: "amber-500/5" },
                      { stat: "$50K", label: "Average Violation Cost", desc: "Single compliance issue", color: "red-500", bg: "red-500/5" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Card className={`p-4 border-${item.color}/20 bg-${item.bg} hover:shadow-md transition-shadow`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${item.color}/20 flex items-center justify-center`}>
                              <span className={`text-sm font-bold text-${item.color === 'destructive' ? 'destructive' : item.color}`}>
                                {item.stat}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <motion.div 
                  className="bg-muted/30 rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-foreground">4.9/5 Rating</span>
                  </div>
                  <blockquote className="text-sm text-muted-foreground italic mb-2">
                    "Easeworks identified critical compliance gaps we never knew existed. Saved us from potential $80K in penalties."
                  </blockquote>
                  <cite className="text-xs font-medium text-foreground">Sarah M., Operations Director</cite>
                </motion.div>
              </motion.div>
              )}

              {/* Center Column - Main Form - Mobile optimized */}
              <motion.div
                className={isMobile ? '' : 'lg:col-span-6'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                id="assessment-form"
              >
                <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
                  <h1 className={`font-bold text-foreground leading-tight ${
                    isMobile ? 'text-2xl mb-3' : 'text-4xl md:text-5xl mb-4'
                  }`}>
                    Is Your HR Strategy 
                    <span className="text-[#655DC6]"> Putting You at Risk?</span>
                  </h1>
                  <p className={`text-muted-foreground max-w-2xl mx-auto ${
                    isMobile ? 'text-lg' : 'text-xl'
                  }`}>
                    Take the 10-minute assessment to uncover hidden compliance gaps and inefficiencies.
                  </p>
                </div>

                <Card className="shadow-xl border-[#655DC6]/20 bg-white/50 backdrop-blur-sm">
                  <CardContent className={isMobile ? 'p-4' : 'p-8'}>
                    <div className={isMobile ? 'mb-4' : 'mb-6'}>
                      <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                        <h2 className={`font-semibold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>Start Your Assessment</h2>
                        <Badge style={{ backgroundColor: '#655DC6' }} className={`text-white ${isMobile ? 'text-xs' : ''}`}>
                          Free • 10 min
                        </Badge>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full">
                        <div className="h-1 w-1/4 rounded-full transition-all duration-500" style={{ backgroundColor: '#655DC6' }}></div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-6'}>
                      <CompanyInfoFormFields 
                        formData={formData}
                        errors={errors}
                        onUpdate={handleUpdate}
                      />
                      
                      <Button 
                        type="submit" 
                        className={`w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                          isMobile ? 'h-12 text-base' : 'h-14 text-lg'
                        }`}
                        style={{ backgroundColor: '#655DC6' }}
                      >
                        Start My HR Risk Assessment
                        <ArrowRight className={`ml-2 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      </Button>
                    </form>

                    <div className={`pt-4 border-t border-border ${isMobile ? 'mt-4' : 'mt-6 pt-6'}`}>
                      <div className={`flex items-center justify-center text-muted-foreground ${
                        isMobile ? 'gap-3 text-xs flex-wrap' : 'gap-6 text-sm'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Lock className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                          <span>Secure{isMobile ? '' : ' & Private'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                          <span>Free{isMobile ? '' : ' Consultation'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                          <span>Instant{isMobile ? '' : ' Results'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Column - Value Proposition - Hidden on mobile */}
              {!isMobile && (
                <motion.div 
                  className="lg:col-span-3 space-y-6"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    What You'll Receive
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { icon: BarChart3, title: "HR Risk Score", desc: "Comprehensive risk analysis across 12 key areas", color: "green" },
                      { icon: Users, title: "Expert Consultation", desc: "30-min call with certified HR Blueprint Specialist", color: "blue" },
                      { icon: FileText, title: "Custom Action Plan", desc: "Prioritized roadmap with implementation timeline", color: "purple" },
                      { icon: Calendar, title: "Follow-up Support", desc: "90-day check-in to track your progress", color: "orange" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Card className={`p-4 border-${item.color}-500/20 bg-${item.color}-500/5 hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Company Logos */}
                <motion.div 
                  className="bg-muted/30 rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <p className="text-xs text-muted-foreground text-center mb-3">Trusted by 500+ growing companies</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="text-center py-2 bg-background/50 rounded">TechCorp</div>
                    <div className="text-center py-2 bg-background/50 rounded">MedGroup</div>
                    <div className="text-center py-2 bg-background/50 rounded">BuildCo</div>
                    <div className="text-center py-2 bg-background/50 rounded">RetailPlus</div>
                  </div>
                </motion.div>
              </motion.div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
        >
          <Button 
            onClick={() => document.getElementById('assessment-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300"
            style={{ backgroundColor: '#655DC6' }}
          >
            Start Assessment
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </>
  );
};