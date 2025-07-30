import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  BarChart3, 
  DollarSign,
  Building,
  GraduationCap,
  Shield,
  Heart,
  Laptop,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const Home: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b sticky top-0 z-50">{/* Updated navigation with Easeworks link and Resources dropdown */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Easeworks</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              <Link to="/solutions" className="text-white hover:text-gray-300 transition-colors">Solutions</Link>
              <Link to="/easelearn-studio" className="text-white hover:text-gray-300 transition-colors">Studio</Link>
              <div className="relative group">
                <button className="text-white hover:text-gray-300 transition-colors flex items-center">
                  Resources
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link to="/resources" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">All Resources</Link>
                    <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">Blog</Link>
                    <Link to="/faq" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">FAQ</Link>
                  </div>
                </div>
              </div>
              <Link to="/contact" className="text-white hover:text-gray-300 transition-colors">Contact</Link>
              <Link to="/easeworks" className="text-white hover:text-gray-300 transition-colors">Easeworks</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:text-gray-300" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-gray-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Complete HR Solutions for Modern Businesses
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Streamline payroll, manage compliance, train employees, and scale your business with our all-in-one Professional Employer Organization platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" asChild>
                  <Link to="/auth">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300" asChild>
                  <Link to="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Easeworks Platform Dashboard"
                  className="rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">99.9% Uptime</p>
                      <p className="text-xs text-gray-600">Enterprise Reliable</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From payroll processing to compliance management, we provide comprehensive HR solutions that grow with your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Payroll Services</CardTitle>
                <CardDescription className="text-gray-600">
                  Automated payroll processing, tax filing, and direct deposit management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">PEO Services</CardTitle>
                <CardDescription className="text-gray-600">
                  Complete professional employer organization services and co-employment solutions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Training Programs</CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered training modules and compliance education for your workforce.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Risk & Compliance</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive risk assessment and regulatory compliance management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Benefits Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Employee benefits administration and healthcare plan management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Laptop className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Technology Platform</CardTitle>
                <CardDescription className="text-gray-600">
                  Modern, cloud-based platform with seamless integrations and mobile access.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                One Platform, Endless Possibilities
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our intuitive dashboard gives you complete visibility into your HR operations, from real-time payroll insights to compliance tracking and employee engagement metrics.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Real-time analytics and reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Automated compliance monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Mobile-first design for on-the-go access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Seamless integrations with popular tools</span>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link to="/demo">
                  Explore Platform <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Platform Interface"
                className="rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Client Logos */}
          <div className="text-center mb-16">
            <p className="text-gray-600 mb-8">Trusted by 500+ companies worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              {['TechCorp', 'BuildCo', 'ServicePro', 'MediCare', 'EduTech', 'RetailMax'].map((company) => (
                <div key={company} className="text-center">
                  <div className="bg-gray-200 h-12 w-32 mx-auto rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 font-semibold text-sm">{company}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Easeworks has transformed our HR operations. The platform is intuitive and the support team is exceptional."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">HR Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The compliance tracking features have saved us countless hours and eliminated our regulatory concerns."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Mike Chen</p>
                    <p className="text-sm text-gray-600">CEO, BuildCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Best investment we've made for our growing business. Highly recommend Easeworks to any company."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Lisa Rodriguez</p>
                    <p className="text-sm text-gray-600">COO, ServicePro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Get Your Free HR Assessment
            </h2>
            <p className="text-xl text-purple-100">
              Discover how Easeworks can streamline your HR operations and save you time and money.
            </p>
          </div>

          <Card className="bg-white">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your HR challenges
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your current HR pain points..."
                    rows={4}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Get My Free Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-8 w-8 text-white" />
                <span className="text-2xl font-bold">Easeworks</span>
              </div>
              <p className="text-gray-300">
                Complete HR solutions for modern businesses. Streamline operations, ensure compliance, and scale with confidence.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">hello@easeworks.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">123 Business Ave, Suite 100</span>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><Link to="/payroll" className="text-gray-300 hover:text-white transition-colors">Payroll Services</Link></li>
                <li><Link to="/peo" className="text-gray-300 hover:text-white transition-colors">PEO Services</Link></li>
                <li><Link to="/training" className="text-gray-300 hover:text-white transition-colors">Training Programs</Link></li>
                <li><Link to="/compliance" className="text-gray-300 hover:text-white transition-colors">Risk & Compliance</Link></li>
                <li><Link to="/benefits" className="text-gray-300 hover:text-white transition-colors">Benefits Management</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/case-studies" className="text-gray-300 hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link to="/guides" className="text-gray-300 hover:text-white transition-colors">HR Guides</Link></li>
                <li><Link to="/webinars" className="text-gray-300 hover:text-white transition-colors">Webinars</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/partners" className="text-gray-300 hover:text-white transition-colors">Partners</Link></li>
                <li><Link to="/support" className="text-gray-300 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Easeworks. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};