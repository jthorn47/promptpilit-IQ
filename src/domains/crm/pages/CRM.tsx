import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, DollarSign, Target, BarChart3, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CRM = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Lead Management",
      description: "Capture, qualify, and nurture leads with automated workflows and intelligent scoring.",
      benefits: ["360° Lead View", "Automated Lead Scoring", "Lead Source Attribution", "Conversion Tracking"]
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Opportunity Tracking",
      description: "Visual sales pipeline with forecasting and deal progression analytics.",
      benefits: ["Visual Pipeline", "Revenue Forecasting", "Win/Loss Analysis", "Deal Progression"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Sales Analytics",
      description: "Real-time dashboards with actionable insights for sales performance optimization.",
      benefits: ["Performance Metrics", "Team Leaderboards", "Predictive Analytics", "Custom Reports"]
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      title: "Activity Management",
      description: "Schedule meetings, track interactions, and automate follow-up sequences.",
      benefits: ["Meeting Scheduler", "Activity Timeline", "Follow-up Automation", "Task Management"]
    }
  ];

  const metrics = [
    { value: "300%", label: "Average ROI Increase", description: "Companies see 3x return on their training investment" },
    { value: "45%", label: "Sales Cycle Reduction", description: "Faster deal closure with better lead qualification" },
    { value: "89%", label: "Lead Conversion Rate", description: "Higher conversion with targeted training programs" },
    { value: "250+", label: "Enterprise Clients", description: "Fortune 500 companies trust our CRM platform" }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>CRM</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Advanced CRM & Sales Pipeline
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your sales process with our enterprise-grade CRM that integrates seamlessly 
                with your training programs. Track leads, manage opportunities, and drive revenue growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg">
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Sales Pipeline</h3>
                  <Badge className="bg-green-100 text-green-800">Live Data</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Qualified Leads</span>
                    <span className="text-blue-600 font-semibold">$2.4M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Proposal Sent</span>
                    <span className="text-purple-600 font-semibold">$1.8M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Closing Soon</span>
                    <span className="text-green-600 font-semibold">$950K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Sales Management Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your sales process, from lead generation to deal closure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Proven Results for Enterprise Sales Teams
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our CRM platform delivers measurable business impact for companies of all sizes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{metric.value}</div>
                <div className="text-white font-semibold mb-2">{metric.label}</div>
                <div className="text-gray-400 text-sm">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seamless Training Integration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our CRM connects directly with your training programs, allowing you to track how 
              employee development impacts sales performance and customer satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance Correlation</h3>
              <p className="text-gray-600 text-sm">Track how training completion rates correlate with sales performance and deal closure rates.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">ROI Tracking</h3>
              <p className="text-gray-600 text-sm">Measure the direct impact of training investments on revenue generation and customer retention.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Development</h3>
              <p className="text-gray-600 text-sm">Identify skill gaps and recommend targeted training based on individual sales performance data.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of enterprise sales teams who have streamlined their processes with our CRM platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Get Started Today
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CRM;