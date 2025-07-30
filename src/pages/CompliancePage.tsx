import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  Clock,
  ArrowLeft,
  Scale,
  BookOpen,
  Users,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const CompliancePage = () => {
  const complianceAreas = [
    {
      icon: FileCheck,
      title: "Employment Law Compliance",
      description: "Stay current with federal, state, and local employment regulations",
      areas: ["FLSA", "FMLA", "ADA", "EEO", "State-specific laws"]
    },
    {
      icon: Scale,
      title: "Wage & Hour Compliance",
      description: "Ensure proper classification and payment of all employees",
      areas: ["Overtime rules", "Meal breaks", "Rest periods", "Minimum wage", "Exempt/Non-exempt"]
    },
    {
      icon: BookOpen,
      title: "Policy Development",
      description: "Create and maintain compliant workplace policies",
      areas: ["Employee handbook", "Anti-harassment", "Safety policies", "Remote work", "Code of conduct"]
    },
    {
      icon: Users,
      title: "Training & Education",
      description: "Mandatory compliance training for managers and employees",
      areas: ["Sexual harassment", "Diversity & inclusion", "Safety training", "Manager training", "New hire orientation"]
    },
    {
      icon: Building,
      title: "Workplace Safety",
      description: "OSHA compliance and workplace safety programs",
      areas: ["Safety plans", "Incident reporting", "Record keeping", "Training programs", "Risk assessments"]
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: "Identify and mitigate compliance risks before they become issues",
      areas: ["Audit preparation", "Policy review", "Risk analysis", "Corrective actions", "Ongoing monitoring"]
    }
  ];

  const californiaSpecific = [
    "SB 553 Workplace Violence Prevention",
    "California Family Rights Act (CFRA)",
    "Fair Employment and Housing Act (FEHA)",
    "Unruh Civil Rights Act",
    "California Consumer Privacy Act (CCPA)",
    "Secure Choice Retirement Savings Program",
    "Paid Sick Leave Requirements",
    "Ban the Box Legislation"
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
              <h1 className="text-2xl font-bold text-gray-900">Workplace Compliance</h1>
              <p className="text-gray-600">Stay current with all employment regulations</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Get Assessment
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-[#655DC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">Compliance Solutions</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Stay Compliant, Stay Protected
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Navigate complex employment laws with confidence. Our compliance experts 
                help you avoid costly violations and protect your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <Shield className="w-5 h-5 mr-2" />
                  Free Compliance Audit
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop" 
                alt="Legal compliance documents"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Risk Alert */}
      <section className="py-12 bg-red-50 border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-xl font-bold text-red-900">
                Did you know? The average employment lawsuit costs $125,000
              </h3>
              <p className="text-red-700">
                Proactive compliance is far less expensive than reactive legal defense
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Areas Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Compliance Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We monitor and help you comply with all relevant employment laws and regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceAreas.map((area, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#655DC6]/10 flex items-center justify-center mb-4">
                    <area.icon className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {area.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Key Areas:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {area.areas.map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* California Specific Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-600 text-white mb-4">California Focus</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                California Employment Law Expertise
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                California has some of the most complex employment laws in the nation. 
                We specialize in helping businesses navigate these requirements.
              </p>
              
              <div className="space-y-3">
                {californiaSpecific.map((law, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{law}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  California Compliance Audit
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Timeline</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Initial Audit</h4>
                      <p className="text-gray-600">Comprehensive review of current practices</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Action Plan</h4>
                      <p className="text-gray-600">Prioritized list of compliance improvements</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Implementation</h4>
                      <p className="text-gray-600">Execute changes with our expert guidance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ongoing Monitoring</h4>
                      <p className="text-gray-600">Continuous compliance management</p>
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
            Don't Risk Non-Compliance
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get a free compliance assessment and protect your business today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              Free Compliance Audit
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Experts
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};