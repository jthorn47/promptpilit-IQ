import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  CheckCircle, 
  Shield, 
  Users, 
  FileText,
  ArrowLeft,
  Handshake,
  TrendingDown,
  Award,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const PEOPage = () => {
  const services = [
    {
      icon: Users,
      title: "HR Administration",
      description: "Complete HR management including employee relations and policy development"
    },
    {
      icon: Shield,
      title: "Benefits Administration",
      description: "Comprehensive health, dental, vision, and retirement benefit packages"
    },
    {
      icon: FileText,
      title: "Compliance Management",
      description: "Stay current with employment laws and regulatory requirements"
    },
    {
      icon: TrendingDown,
      title: "Risk Management",
      description: "Workers' compensation and liability insurance coverage"
    },
    {
      icon: Award,
      title: "Employee Training",
      description: "Professional development and compliance training programs"
    },
    {
      icon: Globe,
      title: "Multi-State Support",
      description: "Expand your business across state lines with confidence"
    }
  ];

  const benefits = [
    "Access to Fortune 500-level benefits",
    "Reduced HR administrative burden",
    "Lower workers' compensation costs",
    "Compliance expertise and support",
    "Dedicated HR professionals",
    "Employee handbook development",
    "Performance management systems",
    "Unemployment claims management"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Link to="/easeworks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PEO/ASO Support</h1>
              <p className="text-gray-600">Full HR outsourcing and co-employment solutions</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Get Quote
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-[#655DC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">PEO Services</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Professional Employer Organization Services
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Partner with us for comprehensive HR outsourcing. We handle the complexities 
                so you can focus on growing your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <Handshake className="w-5 h-5 mr-2" />
                  Partner With Us
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop" 
                alt="Professional business meeting"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is PEO Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What is a Professional Employer Organization?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              A PEO is a strategic partnership where we become your co-employer, sharing specific 
              employer responsibilities and liabilities while allowing you to maintain control 
              over your business operations and employee management.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                How PEO Partnership Works
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Co-Employment Agreement</h4>
                    <p className="text-gray-600">We enter into a co-employment relationship where we share specific employer responsibilities.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">HR Services Delivery</h4>
                    <p className="text-gray-600">We handle payroll, benefits, compliance, and HR administration while you manage daily operations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ongoing Partnership</h4>
                    <p className="text-gray-600">Continuous support and expertise to help your business grow and stay compliant.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop" 
                alt="Business collaboration"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive PEO Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Full-service HR support to help your business operate efficiently and compliantly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#655DC6]/10 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Partnership Benefits</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Partner with Our PEO
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Gain access to enterprise-level HR resources and expertise without 
                the overhead of building an internal HR department.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
                  Schedule Consultation
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#655DC6]/5 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Cost Savings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">HR Staff Salary</span>
                    <span className="font-bold text-red-500">-$80,000/year</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Benefits Admin</span>
                    <span className="font-bold text-red-500">-$30,000/year</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Compliance Risk</span>
                    <span className="font-bold text-red-500">-$50,000/year</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-semibold">Total Savings</span>
                      <span className="font-bold text-green-600">$160,000/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#655DC6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let's discuss how our PEO services can transform your HR operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};