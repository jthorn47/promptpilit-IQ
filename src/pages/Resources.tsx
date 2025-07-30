import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Download, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const Resources = () => {
  const navigate = useNavigate();

  const resourceCategories = [
    {
      title: "Training Guides",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      resources: [
        { name: "Workplace Violence Prevention Best Practices", type: "PDF", size: "2.4 MB", popular: true },
        { name: "Sexual Harassment Prevention Implementation Guide", type: "PDF", size: "1.8 MB", popular: true },
        { name: "Creating a Safe Workplace Culture", type: "PDF", size: "3.1 MB" },
        { name: "Manager's Guide to Conflict Resolution", type: "PDF", size: "2.2 MB" },
        { name: "Employee Handbook Templates", type: "ZIP", size: "5.4 MB" }
      ]
    },
    {
      title: "Compliance Checklists",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      resources: [
        { name: "OSHA Compliance Checklist", type: "PDF", size: "1.2 MB", popular: true },
        { name: "State-by-State Harassment Training Requirements", type: "PDF", size: "4.8 MB" },
        { name: "Workplace Safety Audit Template", type: "DOC", size: "892 KB" },
        { name: "Training Record Keeping Guide", type: "PDF", size: "1.5 MB" },
        { name: "Legal Documentation Templates", type: "ZIP", size: "3.2 MB" }
      ]
    },
    {
      title: "Video Resources",
      icon: <Video className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
      resources: [
        { name: "Introduction to Workplace Violence Prevention", type: "MP4", size: "45 min", popular: true },
        { name: "Bystander Intervention Techniques", type: "MP4", size: "28 min" },
        { name: "De-escalation Strategies", type: "MP4", size: "32 min" },
        { name: "Creating Inclusive Workplaces", type: "MP4", size: "38 min" },
        { name: "Leadership in Crisis Management", type: "MP4", size: "41 min" }
      ]
    },
    {
      title: "Industry Reports",
      icon: <FileText className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-600",
      resources: [
        { name: "2024 Workplace Safety Trends Report", type: "PDF", size: "8.2 MB", popular: true },
        { name: "Cost of Workplace Violence Study", type: "PDF", size: "3.7 MB" },
        { name: "Remote Work Safety Guidelines", type: "PDF", size: "2.9 MB" },
        { name: "Industry Benchmarking Report", type: "PDF", size: "5.1 MB" },
        { name: "Legal Update Quarterly", type: "PDF", size: "2.3 MB" }
      ]
    }
  ];

  const webinars = [
    {
      title: "Preventing Workplace Violence: A Comprehensive Approach",
      date: "December 15, 2024",
      duration: "60 minutes",
      presenter: "Dr. Sarah Mitchell, Workplace Safety Expert",
      status: "upcoming"
    },
    {
      title: "Building Effective Anti-Harassment Programs",
      date: "November 28, 2024", 
      duration: "45 minutes",
      presenter: "Jennifer Adams, Employment Attorney",
      status: "completed"
    },
    {
      title: "Managing Difficult Conversations at Work",
      date: "November 10, 2024",
      duration: "50 minutes", 
      presenter: "Michael Roberts, HR Consultant",
      status: "completed"
    }
  ];

  const faqs = [
    {
      question: "How often should employees complete workplace violence training?",
      answer: "Most states require annual training, but we recommend refresher training every 6-12 months depending on your industry risk level and any workplace incidents."
    },
    {
      question: "What documentation do I need to maintain for compliance?",
      answer: "You should keep records of who completed training, when it was completed, test scores, and certificates issued. Our platform automatically maintains these records for you."
    },
    {
      question: "Can training be customized for our industry?",
      answer: "Yes! Our training modules can be customized with industry-specific scenarios, your company policies, and branded with your organization's materials."
    },
    {
      question: "What happens if an employee fails the training?",
      answer: "Employees can retake assessments multiple times. Our platform provides additional resources and support materials to help them succeed."
    },
    {
      question: "How do I track employee progress across my organization?",
      answer: "Our admin dashboard provides real-time tracking of completion rates, scores, and compliance status across all departments and locations."
    }
  ];

  const resourcesSchemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Training Resources & Support - EaseLearn",
    "description": "Access our comprehensive library of workplace safety resources, training materials, and expert guidance to build safer, more compliant workplaces.",
    "url": "https://easelearn.com/resources",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Training Resources",
      "itemListElement": [
        {
          "@type": "CreativeWork",
          "@id": "training-guides",
          "name": "Training Guides",
          "description": "Comprehensive workplace violence prevention and harassment training guides"
        },
        {
          "@type": "CreativeWork", 
          "@id": "compliance-checklists",
          "name": "Compliance Checklists",
          "description": "OSHA compliance and legal documentation templates"
        },
        {
          "@type": "VideoObject",
          "@id": "video-resources", 
          "name": "Video Resources",
          "description": "Training videos on workplace violence prevention and de-escalation techniques"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Training Resources & Support - Workplace Safety Materials | EaseLearn"
        description="Access our comprehensive library of workplace safety resources, training materials, and expert guidance to build safer, more compliant workplaces. Free downloads and expert webinars."
        keywords="workplace safety resources, training materials, compliance checklists, safety guides, workplace violence prevention resources, harassment training materials, OSHA compliance resources"
        canonicalUrl="https://easelearn.com/resources"
        schemaData={resourcesSchemaData}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/8fe37e66-d41f-4e29-9f60-6cc6b334903d.png" 
                alt="ease.learn" 
                className="h-12 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <BreadcrumbNav items={[{ label: "Resources" }]} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Training Resources & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our comprehensive library of workplace safety resources, training materials, 
            and expert guidance to build safer, more compliant workplaces.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Resource Library
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {resourceCategories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      {category.icon}
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {category.resources.map((resource, resourceIndex) => (
                    <div key={resourceIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{resource.name}</span>
                          {resource.popular && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {resource.type} • {resource.size}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Webinars Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Expert Webinars
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webinars.map((webinar, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}>
                      {webinar.status === 'upcoming' ? 'Upcoming' : 'Watch Recording'}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {webinar.date}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{webinar.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {webinar.presenter} • {webinar.duration}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant={webinar.status === 'upcoming' ? 'default' : 'outline'}
                  >
                    {webinar.status === 'upcoming' ? 'Register Now' : 'Watch Recording'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  {faq.question}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gray-50 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Additional Support?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our expert team is here to help you implement successful training programs 
            and ensure compliance across your organization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Call Us</h4>
              <p className="text-gray-600 mb-3">Speak with our experts</p>
              <p className="font-medium">888-808-0883</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Email Support</h4>
              <p className="text-gray-600 mb-3">Get detailed assistance</p>
              <p className="font-medium">support@easelearn.com</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Schedule Demo</h4>
              <p className="text-gray-600 mb-3">See EaseLearn in action</p>
              <Button size="sm">Book Now</Button>
            </Card>
          </div>
          
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 px-8"
            onClick={() => navigate('/auth')}
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Resources;