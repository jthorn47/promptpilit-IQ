import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Users, Zap, CheckCircle, Calendar, Play, MessageCircle, Target, Clock, Award, Star, Phone, Mail, MapPin, FileText, Camera, Package, Globe, Languages, Palette, ShieldCheck, Download, Monitor } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Logo } from "@/components/ui/logo";

export default function EaseLearnStudio() {
  const navigate = useNavigate();

  const scheduleStrategyCall = () => {
    window.open('https://meetings.hubspot.com/jeffrey-thorn?uuid=9addbf01-5b8f-4a1f-ac02-50e96bf8653b', '_blank');
  };

  const viewPortfolio = () => {
    // Placeholder for portfolio link
    window.open('#portfolio', '_self');
  };

  const requestQuote = () => {
    window.open('mailto:hello@easelearn.com?subject=Studio Quote Request', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-border" />
              <Logo size="sm" className="h-8" />
              <div className="h-6 w-px bg-border" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/easeworks')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Easeworks
              </Button>
            </div>
            <Button 
              onClick={scheduleStrategyCall} 
              style={{ backgroundColor: '#655DC6' }}
              className="hover:opacity-90 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Get Strategy Call
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-slate-800 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-amber-600 rounded-full opacity-80"></div>
        <div className="absolute top-16 right-20 w-20 h-20 bg-blue-600 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 left-10 w-12 h-12 bg-purple-600 rounded-full opacity-70"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-purple-700 rounded-full opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-orange-400">Purpose-Built</span>
                  <br />
                  <span className="text-blue-400">for Employee</span>
                  <br />
                  <span className="text-blue-400">Training</span>
                  <br />
                  <span className="text-blue-400">& Compliance</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-300 font-medium">
                  Powered by EaseLearn Studio Platform
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Video creation, employee training, and compliance tracking — all in one place.
                </p>
                
                <p className="text-gray-400 leading-relaxed">
                  Built for modern workplaces. Backed by real HR experts. Trusted by hundreds of employers.
                </p>
              </div>
              
              <Button 
                onClick={scheduleStrategyCall}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
            
            {/* Right Content - Video Preview */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-60 lg:w-96 lg:h-72 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/20 via-purple-500/50 to-purple-700/80 rounded-3xl"></div>
                  
                  {/* Play button */}
                  <Button
                    onClick={viewPortfolio}
                    variant="ghost"
                    size="lg"
                    className="relative z-10 w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-200"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </Button>
                  
                  {/* Users icon */}
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-purple-700/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Professional Training Videos
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From concept to completion, we handle every aspect of your video production
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Avatar Videos</h3>
                <p className="text-muted-foreground">Professional AI avatars that deliver your content with natural speech and expressions</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Custom Scriptwriting & Compliance Scenarios</h3>
                <p className="text-muted-foreground">Expert scriptwriters create engaging content that meets all compliance requirements</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Branded with Your Logo & Colors</h3>
                <p className="text-muted-foreground">Seamlessly integrate your brand identity throughout the entire video</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Languages className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Available in English + Spanish</h3>
                <p className="text-muted-foreground">Reach your entire workforce with professional bilingual content</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Delivered in SCORM, MP4, or Hosted Formats</h3>
                <p className="text-muted-foreground">Get your videos in any format needed for your platform or LMS</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">LMS Integration Available</h3>
                <p className="text-muted-foreground">Seamless integration with your existing learning management system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple Plans for Any Budget
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your training needs. All plans include professional scriptwriting and AI-powered production.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Easy Lab */}
            <Card className="relative border-2 border-border hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
              <CardHeader className="text-center pb-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">Starter Plan</Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Easy Lab
                </CardTitle>
                <div className="text-3xl font-bold text-primary mb-2">
                  $499 – $695
                </div>
                <CardDescription className="text-base">
                  Perfect for quick training modules
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">10 minute video</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Scriptwriting + AI avatar</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Voiceover (English)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">EaseLearn branding</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">1 revision round</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    onClick={scheduleStrategyCall}
                    className="w-full"
                    style={{ backgroundColor: '#655DC6' }}
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Easier Lab */}
            <Card className="relative border-2 border-primary shadow-lg shadow-primary/10 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge style={{ backgroundColor: '#655DC6' }} className="text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">Enhanced Plan</Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Easier Lab
                </CardTitle>
                <div className="text-3xl font-bold text-primary mb-2">
                  $995 – $1,495
                </div>
                <CardDescription className="text-base">
                  Complete training with scenarios
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">15 minutes with scenario design</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Background visuals + music</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Subtitles + thumbnail</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">2 revisions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Professional AI avatar</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    onClick={scheduleStrategyCall}
                    className="w-full"
                    style={{ backgroundColor: '#655DC6' }}
                  >
                    Book Strategy Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Easiest Lab */}
            <Card className="relative border-2 border-border hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
              <CardHeader className="text-center pb-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">Studio Plan</Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Easiest Lab
                </CardTitle>
                <div className="text-3xl font-bold text-primary mb-2">
                  Quote Based
                </div>
                <CardDescription className="text-base">
                  Full production with custom elements
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">15 minute full production</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Custom animation or b-roll</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Branding + intro/outro</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Optional Spanish version</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">3 revisions</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    onClick={requestQuote}
                    variant="outline"
                    className="w-full border-2"
                  >
                    Request a Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add-ons */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-6">Available Add-ons</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 bg-white rounded-lg border">
                <span className="font-medium">Spanish voiceover:</span>
                <div className="text-primary font-semibold">+$150</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <span className="font-medium">Extra minutes:</span>
                <div className="text-primary font-semibold">+$200/min</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <span className="font-medium">LMS embed/setup:</span>
                <div className="text-green-600 font-semibold">Included</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <span className="font-medium">Resale license:</span>
                <div className="text-primary font-semibold">+$500</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Samples Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              See Our Work in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional training videos that engage and educate your workforce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white shadow-lg"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm font-medium">Sample Video</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Workplace Violence Intro
                </h3>
                <p className="text-muted-foreground">
                  Comprehensive introduction to workplace violence prevention and response protocols
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-600 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white shadow-lg"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm font-medium">Sample Video</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  SB 553 Scenario
                </h3>
                <p className="text-muted-foreground">
                  Interactive scenario training for California Senate Bill 553 compliance
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white shadow-lg"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm font-medium">Sample Video</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Explainer – Retail/Healthcare/Cannabis
                </h3>
                <p className="text-muted-foreground">
                  Industry-specific training content tailored for different business sectors
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={viewPortfolio}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg font-semibold border-2"
            >
              <Video className="w-5 h-5 mr-2" />
              View Full Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section 
        className="py-20 text-white relative overflow-hidden"
        style={{ backgroundColor: '#655DC6' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Not sure which plan fits your needs?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 opacity-90">
            Let us help you build something powerful, fast.
          </p>
          <Button 
            onClick={scheduleStrategyCall}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Schedule a Free Strategy Call
          </Button>
        </div>
      </section>
    </div>
  );
}