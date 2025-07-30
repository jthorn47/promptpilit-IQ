import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Users, TrendingUp, AlertTriangle, Shield, DollarSign, 
  Brain, Target, Award, CheckCircle, Clock, FileText,
  Building, Calendar, PieChart as PieChartIcon, Activity
} from 'lucide-react';

// Sample data for dashboards
const hrRiskData = [
  { name: 'Compliance Risk', value: 15, color: '#ef4444' },
  { name: 'Training Gaps', value: 25, color: '#f97316' },
  { name: 'Policy Updates', value: 8, color: '#eab308' },
  { name: 'Low Risk', value: 52, color: '#22c55e' }
];

const payrollMetrics = [
  { month: 'Jan', processed: 2400, employees: 145 },
  { month: 'Feb', processed: 2600, employees: 152 },
  { month: 'Mar', processed: 2800, employees: 158 },
  { month: 'Apr', processed: 3200, employees: 165 },
  { month: 'May', processed: 3400, employees: 172 },
  { month: 'Jun', processed: 3600, employees: 180 }
];

const consultingROI = [
  { service: 'Policy Review', roi: 340, clients: 12 },
  { service: 'Compliance Audit', roi: 280, clients: 8 },
  { service: 'Training Program', roi: 425, clients: 15 },
  { service: 'Risk Assessment', roi: 380, clients: 18 },
  { service: 'Process Optimization', roi: 520, clients: 6 }
];

const biMetrics = [
  { quarter: 'Q1', revenue: 125000, clients: 45, satisfaction: 94 },
  { quarter: 'Q2', revenue: 142000, clients: 52, satisfaction: 96 },
  { quarter: 'Q3', revenue: 158000, clients: 58, satisfaction: 95 },
  { quarter: 'Q4', revenue: 175000, clients: 65, satisfaction: 97 }
];

const DemoShowcase = () => {
  const [activeDemo, setActiveDemo] = useState('overview');

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      title: "AI-Powered HR Analytics",
      description: "Advanced machine learning algorithms analyze HR data patterns to predict risks and opportunities"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Compliance Monitoring",
      description: "Real-time compliance tracking with automated alerts for regulatory changes and violations"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-purple-500" />,
      title: "Payroll Intelligence",
      description: "Comprehensive payroll processing with tax calculations and regulatory compliance across all states"
    },
    {
      icon: <Target className="h-8 w-8 text-orange-500" />,
      title: "Risk Assessment Engine",
      description: "Comprehensive risk evaluation framework with predictive modeling and mitigation strategies"
    }
  ];

  const services = [
    {
      category: "HR Risk Management",
      items: [
        "Employee Risk Profiling",
        "Compliance Gap Analysis", 
        "Policy Effectiveness Review",
        "Incident Prediction Modeling"
      ]
    },
    {
      category: "HR Consulting",
      items: [
        "Organizational Design",
        "Performance Management Systems",
        "Compensation Strategy",
        "Change Management"
      ]
    },
    {
      category: "Payroll Services", 
      items: [
        "Multi-State Tax Processing",
        "Benefits Administration",
        "Time & Attendance Integration",
        "Reporting & Analytics"
      ]
    },
    {
      category: "Business Intelligence",
      items: [
        "Executive Dashboards",
        "Predictive Analytics",
        "Custom Report Builder",
        "Data Visualization"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Award className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HaaLO Enterprise Suite
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete HR Risk Assessment, Consulting, and Payroll Intelligence Platform
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">AI-Powered</Badge>
            <Badge variant="secondary">Multi-State Compliance</Badge>
            <Badge variant="secondary">Real-Time Analytics</Badge>
            <Badge variant="secondary">Enterprise Ready</Badge>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-center">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hr-risk">HR Risk</TabsTrigger>
            <TabsTrigger value="consulting">Consulting</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="bi-analytics">BI Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Key Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Executive Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={biMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="clients" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-sm">{service.category}</h4>
                      <div className="space-y-1">
                        {service.items.slice(0, 2).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* HR Risk Tab */}
          <TabsContent value="hr-risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={hrRiskData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {hrRiskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Critical Risks</span>
                      <Badge variant="destructive">3 Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Medium Risks</span>
                      <Badge className="bg-orange-500">8 Monitoring</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Low Risks</span>
                      <Badge className="bg-green-500">25 Managed</Badge>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <h4 className="font-medium">Assessment Capabilities:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Predictive risk modeling</li>
                      <li>• Compliance gap analysis</li>
                      <li>• Employee sentiment tracking</li>
                      <li>• Policy effectiveness review</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consulting Tab */}
          <TabsContent value="consulting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Consulting ROI by Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={consultingROI}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="roi" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consulting Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Strategic HR</h4>
                      <p className="text-sm text-blue-700 mt-1">Organizational design and workforce planning</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Compliance</h4>
                      <p className="text-sm text-green-700 mt-1">Regulatory compliance and policy development</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">Performance</h4>
                      <p className="text-sm text-purple-700 mt-1">Performance management system design</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900">Change Mgmt</h4>
                      <p className="text-sm text-orange-700 mt-1">Change management and transformation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Payroll Processing Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={payrollMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="employees" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payroll Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Multi-State Processing</span>
                        <Badge className="bg-green-500">50 States</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Automated tax calculations for all jurisdictions</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Compliance Engine</span>
                        <Badge className="bg-blue-500">Real-time</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Continuous monitoring of regulatory changes</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">AI Tax Optimization</span>
                        <Badge className="bg-purple-500">Advanced</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Machine learning optimizes tax strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BI Analytics Tab */}
          <TabsContent value="bi-analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-purple-500" />
                    Business Intelligence Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={biMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="satisfaction" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Predictive Analytics</p>
                        <p className="text-xs text-muted-foreground">AI-powered forecasting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Custom Reports</p>
                        <p className="text-xs text-muted-foreground">Drag-and-drop builder</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">Real-time Data</p>
                        <p className="text-xs text-muted-foreground">Live dashboard updates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Transform Your HR Operations?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Experience the power of AI-driven HR risk assessment, comprehensive consulting services, 
              and intelligent payroll processing in one unified platform.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary">
                Schedule Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Pricing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            HaaLO Enterprise Suite - Complete HR Risk Assessment, Consulting & Payroll Intelligence Platform
          </p>
        </div>

      </div>
    </div>
  );
};

export default DemoShowcase;