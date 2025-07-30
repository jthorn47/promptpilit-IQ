import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Activity, Zap, Shield, Users, Brain } from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Real-Time Dashboards",
      description: "Live performance metrics with customizable views for executives, managers, and teams.",
      capabilities: ["Executive Summaries", "Team Performance", "Individual Progress", "Compliance Status"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Predictive Analytics",
      description: "AI-powered insights that predict training outcomes and identify at-risk employees.",
      capabilities: ["Risk Prediction", "Performance Forecasting", "Completion Likelihood", "Intervention Alerts"]
    },
    {
      icon: <PieChart className="w-8 h-8 text-purple-600" />,
      title: "Advanced Reporting",
      description: "Comprehensive reports with drill-down capabilities and automated distribution.",
      capabilities: ["Custom Reports", "Automated Scheduling", "Data Export", "White-label Options"]
    },
    {
      icon: <Activity className="w-8 h-8 text-orange-600" />,
      title: "Performance Intelligence",
      description: "Deep insights into learning effectiveness and business impact correlation.",
      capabilities: ["ROI Analysis", "Skill Gap Identification", "Learning Path Optimization", "Behavioral Analytics"]
    }
  ];

  const metrics = [
    { value: "99.7%", label: "Data Accuracy", description: "Real-time data processing with enterprise reliability" },
    { value: "< 2s", label: "Query Response", description: "Lightning-fast analytics even with millions of records" },
    { value: "24/7", label: "Monitoring", description: "Continuous system health and performance monitoring" },
    { value: "500+", label: "KPIs Tracked", description: "Comprehensive metrics across all business functions" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Real-Time Analytics & Business Intelligence
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your training data into actionable insights with our enterprise-grade analytics platform. 
                Make data-driven decisions that impact your bottom line.
              </p>
              <div className="flex items-center space-x-8 mb-8">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Real-time Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">AI-Powered</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  View Live Demo
                </Button>
                <Button variant="outline" size="lg">
                  Request Trial Access
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Training Analytics Dashboard</h3>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-gray-600">Avg. Score</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15min</div>
                    <div className="text-sm text-gray-600">Avg. Duration</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">98%</div>
                    <div className="text-sm text-gray-600">Compliance</div>
                  </div>
                </div>
                <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Interactive Charts & Graphs</span>
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
              Enterprise-Grade Analytics Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our analytics engine processes millions of data points to deliver insights that drive business decisions.
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
                    <div className="space-y-1">
                      {feature.capabilities.map((capability, capIndex) => (
                        <div key={capIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {capability}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Enterprise Scale
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform handles the demands of Fortune 500 companies with reliable, fast, and secure analytics.
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

      {/* Use Cases */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Analytics That Drive Business Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading organizations use our analytics platform to make strategic decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">HR Leadership</h3>
              <p className="text-gray-600 text-sm mb-4">
                Track training ROI, identify skill gaps, and demonstrate the business impact of learning programs.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Training ROI Analysis</li>
                <li>• Skill Gap Identification</li>
                <li>• Compliance Monitoring</li>
                <li>• Executive Reporting</li>
              </ul>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">Operations Teams</h3>
              <p className="text-gray-600 text-sm mb-4">
                Optimize training delivery, improve completion rates, and ensure consistent quality across regions.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Performance Optimization</li>
                <li>• Quality Assurance</li>
                <li>• Resource Allocation</li>
                <li>• Process Improvement</li>
              </ul>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">Data Scientists</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access raw data, build custom models, and integrate with existing business intelligence tools.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• API Access</li>
                <li>• Data Export</li>
                <li>• Custom Modeling</li>
                <li>• BI Integration</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Transform Your Data Into Strategic Advantage
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join enterprise leaders who rely on our analytics platform for critical business decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start Analytics Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule Analytics Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;