import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Shield, 
  Zap, 
  Users, 
  Star,
  Play,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  GraduationCap,
  HardHat,
  BarChart3,
  Video,
  Building,
  Award,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Building2,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const EaseworksLanding = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you!",
      description: "We'll be in touch with your free HR assessment soon.",
    });
    setEmail('');
  };

  const services = [
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description: "Automated payroll with compliance built-in",
      href: "/payroll"
    },
    {
      icon: Building,
      title: "PEO/ASO Support", 
      description: "Full HR outsourcing and co-employment",
      href: "/peo"
    },
    {
      icon: Shield,
      title: "Workplace Compliance",
      description: "Stay current with all regulations",
      href: "/compliance"
    },
    {
      icon: GraduationCap,
      title: "LMS & Training",
      description: "Custom training content and delivery",
      href: "/training"
    },
    {
      icon: BarChart3,
      title: "HR Risk Assessments",
      description: "Identify and mitigate workplace risks",
      href: "/assessment"
    },
    {
      icon: HardHat,
      title: "Workers' Comp & Safety",
      description: "Comprehensive safety program management",
      href: "/safety"
    }
  ];

  const clientLogos = [
    "Company A", "Company B", "Company C", "Company D", "Company E", "Company F"
  ];

  const testimonial = {
    quote: "Easeworks transformed our HR operations and helped us stay compliant across all California regulations. Their team is incredibly responsive.",
    author: "Sarah Chen",
    title: "HR Director, TechFlow Solutions",
    company: "150 employees"
  };

  const handleRiskAssessment = () => {
    toast({
      title: "Risk Assessment",
      description: "Redirecting to HR Risk Assessment form...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header - Sticky Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/cced9ec4-0488-4940-92e7-dfae920dce83.png" 
                alt="Easeworks - Empowering Growth. Enhancing Productivity." 
                className="h-12 w-auto"
              />
            </div>

            {/* Center Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#products" className="text-gray-700 hover:text-primary font-medium transition-colors">Products</a>
              <a href="#solutions" className="text-gray-700 hover:text-primary font-medium transition-colors">Solutions</a>
              <a href="#partners" className="text-gray-700 hover:text-primary font-medium transition-colors">Partners</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary font-medium transition-colors">Pricing</a>
              <a href="#resources" className="text-gray-700 hover:text-primary font-medium transition-colors">Resources</a>
            </nav>

            {/* CTA Button */}
            <Button 
              onClick={handleRiskAssessment}
              className="px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ background: 'var(--gradient-cta)' }}
            >
              Get Free HR Assessment
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[0.9] tracking-tight">
                  PROTECT YOUR PEOPLE.<br />
                  POWER YOUR BUSINESS.
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                  End-to-end HR, Payroll, and Compliance support — trusted by California 
                  employers to reduce risk, manage costs, and stay audit-ready.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Button 
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Your Free HR Assessment
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-slate-900"
                >
                  See Our Platform
                </Button>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <div className="flex items-center space-x-2 bg-slate-800 rounded-full px-4 py-2 border border-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">SB 553 COMPLIANT</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800 rounded-full px-4 py-2 border border-slate-700">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">PAGA PROTECTION</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">COMPLIANCE DASHBOARD</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Policies</span>
                    <div className="flex-1 mx-4 bg-slate-700 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Trainings</span>
                    <div className="flex-1 mx-4 bg-slate-700 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Audits</span>
                    <div className="flex-1 mx-4 bg-slate-700 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Worker Image */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src="/lovable-uploads/0b3a62a0-8dd6-4921-9277-741d4b4764c8.png" 
                  alt="Safety worker" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview - Icon Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Complete HR Suite</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive HR solutions designed to keep your business compliant, efficient, and protected.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link key={index} to={service.href}>
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#655DC6] to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#655DC6] transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center text-[#655DC6] font-medium">
                      Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EaseLearn & Studio Promo Section */}
      <section className="py-20 bg-gradient-to-br from-[#655DC6]/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Featured Solutions</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                SB 553 Workplace Violence Plan Wizard & Custom Video Creation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Build compliant workplace violence prevention plans with our guided wizard, and create custom training videos through EaseLearn Studio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-[#655DC6] hover:bg-[#5a52b8] text-white"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Explore EaseLearn
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[#655DC6] text-[#655DC6] hover:bg-[#655DC6] hover:text-white"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Build Your Plan
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-[#655DC6] rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">SB 553 Compliance</h3>
                    <p className="text-gray-600">Automated plan generation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Risk assessment included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Custom policy templates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Training materials provided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Band */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Employers Across California</h3>
            <p className="text-gray-600">Join hundreds of companies who rely on Easeworks for their HR needs</p>
          </div>

          {/* Client Logos */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60 mb-16">
            {clientLogos.map((logo, index) => (
              <div key={index} className="text-center">
                <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">{logo}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-[#655DC6]/5 to-blue-50">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl lg:text-2xl font-medium text-gray-900 text-center mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600">{testimonial.title}</p>
                <p className="text-gray-500 text-sm">{testimonial.company}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Dashboard Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#655DC6]/10 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold">LMS Dashboard</h4>
                    <Badge className="bg-[#655DC6]/10 text-[#655DC6]">Active</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Workplace Violence Training</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Sexual Harassment Prevention</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Safety Protocol Update</span>
                      <Badge className="bg-gray-100 text-gray-800 text-xs">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Feature List */}
            <div className="space-y-8">
              <div>
                <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Platform Features</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Powerful Tools for Complete Compliance
                </h2>
                <p className="text-lg text-gray-600">
                  Everything you need to maintain workplace compliance and protect your business.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#655DC6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Plan Builder</h3>
                    <p className="text-gray-600">Create compliant workplace policies with our guided wizard and templates.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#655DC6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">SCORM-Compliant Training</h3>
                    <p className="text-gray-600">Deliver training that meets all industry standards and compliance requirements.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#655DC6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Help Desk Access</h3>
                    <p className="text-gray-600">Get expert HR support when you need it with our dedicated help desk team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet / CTA Band */}
      <section className="py-20 bg-gradient-to-r from-[#655DC6] to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              How Compliant Is Your Workplace?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Take our comprehensive 10-minute assessment to identify potential risks and get a personalized compliance score for your business.
            </p>
            <Button 
              size="lg"
              onClick={handleRiskAssessment}
              className="bg-white text-[#655DC6] hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Take the 10-Minute HR Risk Score
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Free assessment • Instant results • No commitment required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><Link to="/payroll" className="text-gray-300 hover:text-white transition-colors">Payroll Processing</Link></li>
                <li><Link to="/peo" className="text-gray-300 hover:text-white transition-colors">PEO/ASO Support</Link></li>
                <li><Link to="/compliance" className="text-gray-300 hover:text-white transition-colors">Compliance</Link></li>
                <li><Link to="/training" className="text-gray-300 hover:text-white transition-colors">Training & LMS</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/resources" className="text-gray-300 hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/webinars" className="text-gray-300 hover:text-white transition-colors">Webinars</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/security" className="text-gray-300 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/compliance-docs" className="text-gray-300 hover:text-white transition-colors">Compliance Docs</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 mb-6">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/news" className="text-gray-300 hover:text-white transition-colors">News</Link></li>
                <li><Link to="/partners" className="text-gray-300 hover:text-white transition-colors">Partners</Link></li>
              </ul>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-300">support@easeworks.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-gray-300">California, USA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <img 
                  src="/lovable-uploads/cced9ec4-0488-4940-92e7-dfae920dce83.png" 
                  alt="Easeworks" 
                  className="h-8 w-auto brightness-0 invert"
                />
                <span className="text-gray-400">© 2024 Easeworks. All rights reserved.</span>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal Placeholder */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Easeworks Overview</h3>
              <Button 
                variant="ghost" 
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video player would be embedded here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};