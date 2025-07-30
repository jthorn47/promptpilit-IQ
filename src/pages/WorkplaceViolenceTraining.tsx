import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, Clock, Users, BookOpen, Award, ArrowRight, Download, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

const WorkplaceViolenceTraining: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTraining = () => {
    navigate('/auth/signup');
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@example.com?subject=Workplace Violence Prevention Training Inquiry';
  };

  const trainingModules = [
    {
      title: "Understanding Workplace Violence",
      duration: "15 min",
      description: "Learn to identify different types of workplace violence and recognize warning signs"
    },
    {
      title: "Legal Requirements & SB 553",
      duration: "20 min", 
      description: "Understand California's workplace violence prevention law and compliance requirements"
    },
    {
      title: "Prevention Strategies",
      duration: "25 min",
      description: "Develop effective strategies to prevent workplace violence incidents"
    },
    {
      title: "Emergency Response Procedures",
      duration: "15 min",
      description: "Learn proper response protocols during violent incidents"
    },
    {
      title: "Creating a Safety Plan",
      duration: "20 min",
      description: "Build comprehensive workplace violence prevention plans"
    }
  ];

  const complianceRequirements = [
    "Conduct workplace violence hazard assessments",
    "Develop written workplace violence prevention plans", 
    "Provide employee training on violence prevention",
    "Establish incident reporting procedures",
    "Maintain records of training and incidents",
    "Review and update plans annually"
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Safety",
      description: "Create a safer work environment for all employees"
    },
    {
      icon: CheckCircle,
      title: "Legal Compliance",
      description: "Meet all California SB 553 requirements and avoid penalties"
    },
    {
      icon: Users,
      title: "Employee Confidence",
      description: "Build trust through comprehensive safety measures"
    },
    {
      icon: Award,
      title: "Professional Recognition",
      description: "Demonstrate commitment to workplace safety standards"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Workplace Violence Prevention Training | California SB 553 Compliance"
        description="Comprehensive workplace violence prevention training to meet California SB 553 requirements. Protect your workplace and ensure legal compliance."
        keywords="workplace violence prevention, California SB 553, safety training, compliance training"
      />

      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Shield className="h-16 w-16 text-white" />
                  <AlertTriangle className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Workplace Violence Prevention Training
              </h1>
              
              <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
                Stay compliant with California SB 553 and protect your workplace with our comprehensive violence prevention training program
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  onClick={handleStartTraining}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-3 text-lg"
                >
                  Start Training Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  onClick={handleContactSales}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  Contact Sales
                  <Phone className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Urgency Banner */}
              <div className="bg-yellow-500 text-black py-3 px-6 rounded-lg inline-block">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Compliance Deadline: July 1, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Overview */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Training Program
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our workplace violence prevention training covers all aspects of SB 553 compliance with engaging, interactive content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainingModules.map((module, index) => (
                <Card key={index} className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="mb-2">
                        Module {index + 1}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {module.duration}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {module.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* SB 553 Compliance Requirements */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  California SB 553 Requirements
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  California's new workplace violence prevention law requires all employers to implement comprehensive safety measures. Our training ensures full compliance.
                </p>
                
                <div className="space-y-4">
                  {complianceRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Why This Training Matters
                </h3>
                
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 bg-red-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Wait - Start Your Training Today
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Protect your workplace, ensure compliance, and give your employees the safety training they deserve
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartTraining}
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-3 text-lg"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={() => window.open('/workplace-violence-prevention-guide.pdf', '_blank')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Download Free Guide
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-red-500">
              <p className="text-red-100">
                Questions? Contact us at{' '}
                <a href="mailto:support@example.com" className="text-white font-semibold hover:underline">
                  support@example.com
                </a>{' '}
                or{' '}
                <a href="tel:+1-555-0123" className="text-white font-semibold hover:underline">
                  (555) 012-3456
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkplaceViolenceTraining;