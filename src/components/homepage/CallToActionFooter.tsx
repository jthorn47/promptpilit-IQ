import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Mail, Phone } from 'lucide-react';

export const CallToActionFooter = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-accent/10">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Train Smarter</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join the future of workplace learning. Start your free trial today and see why industry leaders choose EaseLearn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-accent transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-10 py-5 text-lg font-semibold border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Book a Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
            <span>✓ Free 30-day trial</span>
            <span>✓ Setup in under 5 minutes</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
        
        {/* Contact options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Get In Touch</h3>
            <p className="text-muted-foreground mb-4">
              Have questions? Our team is here to help you get started.
            </p>
            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center">
            <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Talk to an Expert</h3>
            <p className="text-muted-foreground mb-4">
              Schedule a personalized demo with our learning specialists.
            </p>
            <Button variant="outline" className="w-full">
              Schedule Call
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 EaseLearn. All rights reserved. | 
            <span className="ml-2">Transforming workplace learning through AI</span>
          </p>
        </div>
      </div>
    </section>
  );
};