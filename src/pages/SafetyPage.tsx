import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HardHat, 
  CheckCircle, 
  Shield, 
  AlertTriangle, 
  FileText,
  ArrowLeft,
  Users,
  Clipboard,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const SafetyPage = () => {
  const services = [
    {
      icon: Shield,
      title: "Safety Program Development",
      description: "Comprehensive safety programs tailored to your industry and risks"
    },
    {
      icon: Clipboard,
      title: "Workers' Compensation Management",
      description: "Complete claims management and cost control strategies"
    },
    {
      icon: FileText,
      title: "OSHA Compliance",
      description: "Stay compliant with all OSHA regulations and standards"
    },
    {
      icon: Users,
      title: "Safety Training Programs",
      description: "Engaging safety training for all levels of your organization"
    },
    {
      icon: Activity,
      title: "Incident Management",
      description: "Efficient incident reporting, investigation, and prevention"
    },
    {
      icon: TrendingDown,
      title: "Risk Reduction Strategies",
      description: "Proactive approaches to minimize workplace hazards"
    }
  ];

  const complianceAreas = [
    "General Industry Standards (29 CFR 1910)",
    "Construction Standards (29 CFR 1926)", 
    "Hazard Communication (GHS)",
    "Personal Protective Equipment (PPE)",
    "Lockout/Tagout (LOTO) Procedures",
    "Machine Guarding Requirements",
    "Emergency Action Plans",
    "Bloodborne Pathogens Standard",
    "Respiratory Protection Programs",
    "Fall Protection Systems"
  ];

  const benefits = [
    "Reduce workplace injuries by up to 60%",
    "Lower workers' compensation costs",
    "Improve employee morale and retention",
    "Avoid OSHA penalties and citations",
    "Minimize liability and insurance costs",
    "Increase operational efficiency",
    "Enhance company reputation",
    "Meet customer safety requirements"
  ];

  const industryStats = [
    {
      stat: "2.8M",
      label: "Workplace injuries annually",
      description: "Don't let your business become a statistic"
    },
    {
      stat: "$171B",
      label: "Annual cost of workplace injuries",
      description: "Prevention is far less expensive than treatment"
    },
    {
      stat: "14x",
      label: "ROI on safety investments",
      description: "Every $1 spent on safety returns $14"
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Workers' Comp & Safety</h1>
              <p className="text-gray-600">Comprehensive safety program management</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Get Safety Audit
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-600 to-[#655DC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">Safety Solutions</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Protect Your People, Protect Your Business
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Comprehensive workplace safety programs and workers' compensation management 
                to keep your employees safe and your business protected.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <HardHat className="w-5 h-5 mr-2" />
                  Safety Assessment
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Workers' Comp Quote
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Workplace safety training"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Workplace Safety by the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Understanding the importance of workplace safety
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {industryStats.map((item, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="text-4xl font-bold text-[#655DC6] mb-2">
                    {item.stat}
                  </div>
                  <div className="text-xl font-semibold text-gray-900 mb-2">
                    {item.label}
                  </div>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Safety Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From program development to claims management, we provide complete safety solutions
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

      {/* OSHA Compliance Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-red-600 text-white mb-4">OSHA Compliance</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Stay OSHA Compliant
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Navigate complex OSHA regulations with confidence. We help you maintain 
                compliance and avoid costly penalties.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {complianceAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{area}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  OSHA Compliance Audit
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">OSHA Penalty Ranges</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Other-than-serious</span>
                    <span className="font-bold text-orange-500">Up to $16,131</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Serious violation</span>
                    <span className="font-bold text-red-500">Up to $16,131</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Willful/Repeated</span>
                    <span className="font-bold text-red-600">Up to $161,323</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-semibold">Prevention Cost</span>
                      <span className="font-bold text-green-600">$5,000/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workers' Comp Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Workers' Compensation Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Protect your employees and control costs with expert workers' compensation management
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-blue-600 mx-auto flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Claims Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Expert handling of all workers' compensation claims from injury to resolution
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 24/7 claim reporting</li>
                  <li>• Medical provider networks</li>
                  <li>• Return-to-work programs</li>
                  <li>• Fraud investigation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-green-600 mx-auto flex items-center justify-center mb-4">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Cost Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Strategic approaches to minimize workers' compensation costs
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Experience modification factor management</li>
                  <li>• Premium audits</li>
                  <li>• Safety incentive programs</li>
                  <li>• Cost containment strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-purple-600 mx-auto flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Prevention Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Proactive programs to prevent workplace injuries
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Safety training programs</li>
                  <li>• Ergonomic assessments</li>
                  <li>• Job hazard analysis</li>
                  <li>• Wellness initiatives</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop" 
                alt="Safe workplace environment"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Program Benefits</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                The Business Case for Safety
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Investing in workplace safety delivers measurable returns through reduced costs, 
                improved productivity, and enhanced reputation.
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
                  Start Safety Program
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#655DC6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Improve Workplace Safety?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let us help you create a safer workplace and reduce workers' compensation costs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              <HardHat className="w-5 h-5 mr-2" />
              Free Safety Assessment
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Workers' Comp Quote
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};