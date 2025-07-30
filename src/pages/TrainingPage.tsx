import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  CheckCircle, 
  Play, 
  Monitor, 
  Users,
  ArrowLeft,
  BookOpen,
  Award,
  BarChart3,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const TrainingPage = () => {
  const features = [
    {
      icon: Video,
      title: "Custom Video Creation",
      description: "AI-powered video generation for your specific training needs"
    },
    {
      icon: BookOpen,
      title: "Course Library",
      description: "Extensive library of pre-built compliance and skills training"
    },
    {
      icon: Users,
      title: "Interactive Learning",
      description: "Engaging content with quizzes, scenarios, and assessments"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Detailed analytics and reporting on learning outcomes"
    },
    {
      icon: Award,
      title: "Certification Management",
      description: "Automated certificate generation and tracking"
    },
    {
      icon: Monitor,
      title: "Mobile-Friendly Platform",
      description: "Learn anywhere, anytime on any device"
    }
  ];

  const courseCategories = [
    {
      title: "Compliance Training",
      courses: [
        "Sexual Harassment Prevention",
        "Diversity & Inclusion",
        "Workplace Safety",
        "Data Privacy & Security",
        "Anti-Discrimination Training"
      ]
    },
    {
      title: "Management Development",
      courses: [
        "Leadership Skills",
        "Performance Management",
        "Conflict Resolution",
        "Team Building",
        "Communication Skills"
      ]
    },
    {
      title: "Technical Skills",
      courses: [
        "Software Training",
        "Industry-Specific Certifications",
        "Process Improvement",
        "Quality Management",
        "Project Management"
      ]
    }
  ];

  const benefits = [
    "Reduce training costs by 60%",
    "Improve completion rates by 40%",
    "Automated compliance tracking",
    "Custom content creation",
    "Multi-language support",
    "SCORM compatibility",
    "Integration with HRIS systems",
    "24/7 technical support"
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
              <h1 className="text-2xl font-bold text-gray-900">LMS & Training</h1>
              <p className="text-gray-600">Custom training content and delivery platform</p>
            </div>
          </div>
          <Button className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
            Start Free Trial
          </Button>
        </div>
      </PageHeader>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-[#655DC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-4">EaseLearn LMS</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Transform Your Training Programs
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Deliver engaging, effective training with our comprehensive Learning Management System. 
                Create custom content, track progress, and ensure compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Free Trial
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Online learning platform"
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
              Powerful Learning Management Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, deliver, and track effective training programs
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

      {/* Course Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Course Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from hundreds of pre-built courses or create your own custom content
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {courseCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 text-center">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.courses.map((course, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{course}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EaseLearn Studio Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#655DC6]/10 text-[#655DC6] mb-4">EaseLearn Studio</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Video Creation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create professional training videos in minutes with our AI-powered studio. 
                No filming, no editing - just script to video.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">AI avatars and voiceovers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Professional templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Multi-language support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Brand customization</span>
                </div>
              </div>

              <Button size="lg" className="bg-[#655DC6] hover:bg-[#5a52b8] text-white">
                <Video className="w-5 h-5 mr-2" />
                Try Studio Free
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#655DC6] to-blue-600 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    From Script to Video in Minutes
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <span className="text-gray-700">Write your script</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <span className="text-gray-700">Choose avatar & voice</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#655DC6] text-white flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <span className="text-gray-700">Generate video</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <span className="text-gray-700 font-semibold">Ready to deploy!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop" 
                alt="Team learning together"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <Badge className="bg-green-600 text-white mb-4">Platform Benefits</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Choose EaseLearn
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform delivers measurable results while reducing training costs and complexity.
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
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  Schedule Demo
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
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start with a free trial and see the difference EaseLearn makes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#655DC6] hover:bg-gray-50">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};