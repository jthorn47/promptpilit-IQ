import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  ArrowLeft,
  Search,
  Shield,
  Target,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const AssessmentPage = () => {
  const assessmentTypes = [
    {
      icon: Search,
      title: "Compliance Risk Assessment",
      description: "Comprehensive review of your compliance posture across all areas",
      includes: ["Policy review", "Process audit", "Documentation check", "Training gaps analysis"]
    },
    {
      icon: Shield,
      title: "Workplace Safety Assessment",
      description: "Detailed evaluation of safety programs and OSHA compliance",
      includes: ["Hazard identification", "Safety program review", "Training assessment", "Incident analysis"]
    },
    {
      icon: Target,
      title: "HR Process Audit",
      description: "Analysis of HR processes for efficiency and compliance",
      includes: ["Recruitment practices", "Performance management", "Employee relations", "Record keeping"]
    },
    {
      icon: TrendingUp,
      title: "Organizational Health Check",
      description: "Overall assessment of HR effectiveness and employee satisfaction",
      includes: ["Culture assessment", "Employee engagement", "Leadership evaluation", "Communication audit"]
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "Discuss your specific needs and concerns with our experts"
    },
    {
      step: "2", 
      title: "Comprehensive Review",
      description: "Thorough examination of policies, procedures, and practices"
    },
    {
      step: "3",
      title: "Risk Analysis",
      description: "Identify potential risks and compliance gaps"
    },
    {
      step: "4",
      title: "Detailed Report",
      description: "Receive comprehensive findings with prioritized recommendations"
    },
    {
      step: "5",
      title: "Action Plan",
      description: "Get a roadmap for addressing identified issues"
    },
    {
      step: "6",
      title: "Implementation Support",
      description: "Ongoing assistance to execute improvements"
    }
  ];

  const benefits = [
    "Identify risks before they become costly problems",
    "Ensure compliance with current regulations",
    "Improve operational efficiency",
    "Protect against lawsuits and penalties",
    "Enhance employee satisfaction and retention",
    "Optimize HR processes and procedures",
    "Receive expert recommendations for improvement",
    "Get peace of mind about your HR practices"
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
              <h1 className="text-2xl font-bold text-gray-900">HR Risk Assessments</h1>
              <p className="text-gray-600">Identify and mitigate workplace risks</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Request Assessment
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-[#655DC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">Risk Assessment</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Proactive Risk Management
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Stay ahead of potential HR issues with comprehensive risk assessments. 
                Identify vulnerabilities and get actionable recommendations from our experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Free Assessment
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop" 
                alt="Business analysis and assessment"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Risk Alert Section */}
      <section className="py-12 bg-orange-50 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="text-xl font-bold text-orange-900">
                72% of businesses have at least one major HR compliance gap
              </h3>
              <p className="text-orange-700">
                Don't wait for a problem to surface - be proactive with regular assessments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Assessment Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of specialized assessments to address your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {assessmentTypes.map((assessment, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#655DC6]/10 flex items-center justify-center mb-4">
                    <assessment.icon className="w-6 h-6 text-[#655DC6]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {assessment.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {assessment.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Assessment Includes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {assessment.includes.map((item, idx) => (
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

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Assessment Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A systematic approach to identifying risks and providing actionable solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-8 h-0.5 bg-gray-300 transform translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">Assessment Benefits</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Regular Assessments Matter
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Proactive risk management is far more cost-effective than reactive problem-solving. 
                Our assessments help you stay ahead of issues.
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
                  Schedule Assessment
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#655DC6]/5 to-orange-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Assessment ROI</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Assessment Cost</span>
                    <span className="font-bold text-[#655DC6]">$2,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Average Lawsuit Cost</span>
                    <span className="font-bold text-red-500">$125,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">OSHA Penalties</span>
                    <span className="font-bold text-red-500">$15,000+</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-semibold">Potential Savings</span>
                      <span className="font-bold text-green-600">$140,000+</span>
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
            Ready for Your Risk Assessment?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Take the first step toward proactive risk management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              <Lightbulb className="w-5 h-5 mr-2" />
              Free Initial Assessment
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Our Experts
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};