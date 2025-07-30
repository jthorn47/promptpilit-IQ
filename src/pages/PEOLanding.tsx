import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, UserCheck, ShieldCheck, ArrowRight, Users, Award, Headphones, Star, Mail } from 'lucide-react';

export const PEOLanding: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    console.log('Email submitted:', email);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground leading-[0.9] tracking-tight">
                  Scalable HR solutions to 
                  <span className="block gradient-text bg-gradient-to-r from-primary via-orange to-warning bg-clip-text text-transparent"> 
                    run & grow 
                  </span>
                  your business wherever you hire
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                  Easeworks' modern, intuitive PEO platform with expert support, payroll, and benefits access means fewer HR headaches, more time focusing on your business, and delivering the best to your employees.
                </p>
              </div>

              {/* Email Capture Form */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Input
                  type="email"
                  placeholder="What's your email?"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 text-lg px-6 border-2 border-gray-200 focus:border-primary rounded-xl"
                  required
                />
                <Button 
                  type="submit" 
                  className="h-14 px-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{ background: 'var(--gradient-cta)' }}
                >
                  Get Started
                </Button>
              </form>

              {/* Social Proof */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange text-orange" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-strong relative">
                <img 
                  src="/lovable-uploads/3a5fc00b-c13f-4d32-88c3-48b2be926444.png" 
                  alt="Professional woman in modern office environment showcasing Easeworks PEO solutions"
                  className="w-full h-full object-cover"
                />
                {/* Feature Overlays */}
                <div className="absolute top-6 right-6 space-y-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-medium border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-success" />
                      </div>
                      <span className="font-semibold text-gray-800">Compliance Support</span>
                    </div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-medium border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-warning" />
                      </div>
                      <span className="font-semibold text-gray-800">Competitive Benefits</span>
                    </div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-medium border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-gray-800">International Hires</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Every Business Starts Small Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Every Business Starts Small</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're a bit obsessed with the entrepreneurs we get to help every day (and night). See how Easeworks partners with small businesses of all shapes and sizes.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="card-elevated hover-lift">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Client Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg">
                New to Easeworks PEO? Sign up as a Client Admin to start your onboarding process, or sign in to continue where you left off.
              </p>
              <ul className="text-left space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Complete onboarding sections</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Upload required documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Manage employee setup</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Track progress and milestones</span>
                </li>
              </ul>
              <div className="space-y-3">
                <Button asChild className="w-full text-lg py-3">
                  <Link to="/auth">
                    Get Started - Sign Up/Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  First time? Choose "Client Admin" when signing up
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-secondary-accent/20 rounded-2xl">
                  <UserCheck className="h-10 w-10 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Onboarding Manager</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg">
                Easeworks staff portal for managing client onboarding processes, reviewing submissions, and providing support.
              </p>
              <ul className="text-left space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange rounded-full"></div>
                  <span>Monitor client progress</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange rounded-full"></div>
                  <span>Review and approve sections</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange rounded-full"></div>
                  <span>Respond to client questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange rounded-full"></div>
                  <span>Generate reports and analytics</span>
                </li>
              </ul>
              <Button asChild variant="secondary" className="w-full text-lg py-3">
                <Link to="/auth">
                  Staff Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-12">Why Choose Easeworks PEO?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="p-4 bg-success/10 rounded-2xl w-fit mx-auto">
                <ShieldCheck className="h-8 w-8 text-success" />
              </div>
              <h4 className="text-xl font-semibold">Compliant & Secure</h4>
              <p className="text-muted-foreground text-lg">
                Industry-leading security and compliance with all regulatory requirements to keep your business protected.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Scalable Solutions</h4>
              <p className="text-muted-foreground text-lg">
                Grow your business with our flexible PEO services that scale with you from startup to enterprise.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 bg-orange/10 rounded-2xl w-fit mx-auto">
                <Headphones className="h-8 w-8 text-orange" />
              </div>
              <h4 className="text-xl font-semibold">Expert Support</h4>
              <p className="text-muted-foreground text-lg">
                Dedicated onboarding managers and 24/7 support to guide you through every step of your journey.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-24 text-center">
          <div className="relative rounded-3xl p-12 text-white overflow-hidden" style={{ background: 'var(--gradient-cta)' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-12 right-8 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            
            <div className="relative max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold">Ready to Transform Your HR?</h3>
              <p className="text-xl opacity-90 leading-relaxed">
                Join thousands of businesses who trust Easeworks PEO for their HR needs. Get started today and see the difference.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="What's your email?"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm"
                  required
                />
                <Button type="submit" className="px-8 bg-white text-gray-800 hover:bg-white/90 font-semibold">
                  Get Started
                </Button>
              </form>
              <p className="text-sm opacity-75">
                No setup fees • Cancel anytime • 24/7 support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};