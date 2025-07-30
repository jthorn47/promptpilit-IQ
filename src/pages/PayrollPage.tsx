import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Shield, 
  Users, 
  FileText,
  ArrowLeft,
  Calculator,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const PayrollPage = () => {
  const features = [
    {
      icon: Calculator,
      title: "Automated Calculations",
      description: "Precise payroll calculations with tax compliance built-in"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Weekly, bi-weekly, semi-monthly, or monthly pay periods"
    },
    {
      icon: Shield,
      title: "Tax Compliance",
      description: "Automatic tax filing for federal, state, and local requirements"
    },
    {
      icon: Users,
      title: "Employee Self-Service",
      description: "Online portal for pay stubs, tax forms, and direct deposit setup"
    },
    {
      icon: FileText,
      title: "Detailed Reporting",
      description: "Comprehensive payroll reports and analytics"
    },
    {
      icon: TrendingUp,
      title: "Cost Management",
      description: "Track labor costs and optimize payroll expenses"
    }
  ];

  const benefits = [
    "Save 8+ hours per pay period",
    "99.9% accuracy guarantee",
    "Same-day direct deposit",
    "Mobile app access",
    "24/7 customer support",
    "Integration with HR systems"
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
              <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>
              <p className="text-gray-600">Automated payroll with compliance built-in</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Get Started
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-[#655DC6] to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">Payroll Solution</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Streamlined Payroll Processing for Modern Businesses
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Eliminate payroll headaches with our automated, compliant payroll system. 
                Process payroll in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Professional using payroll software"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Payroll Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage payroll efficiently and stay compliant
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#655DC6]/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Payroll That Works for Your Business
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our payroll solution is designed to save you time, reduce errors, 
                and ensure compliance with all regulations.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
                  Get Started Today
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop" 
                alt="Payroll dashboard interface"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#655DC6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Payroll?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses who trust us with their payroll processing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};