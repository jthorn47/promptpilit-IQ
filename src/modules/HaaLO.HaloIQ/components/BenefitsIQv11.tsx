import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  BarChart3,
  Brain,
  Target,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Settings,
  Calendar,
  FileText,
  Zap,
  Globe,
  Database,
  RefreshCw
} from 'lucide-react';

// Import modals and components
import { PredictiveModelingModal } from '../../Halo.BenefitsIQ/components/modals/PredictiveModelingModal';
import { RiskAssessmentModal } from '../../Halo.BenefitsIQ/components/modals/RiskAssessmentModal';
import { TrendAnalysisModal } from '../../Halo.BenefitsIQ/components/modals/TrendAnalysisModal';
import { ScenarioModal } from '../../Halo.BenefitsIQ/components/modals/ScenarioModal';
import { CostProjections } from '../../Halo.BenefitsIQ/components/CostProjections';
import { BenchmarkReport } from '../../Halo.BenefitsIQ/components/BenchmarkReport';
import { BenefitRecommendations } from '../../Halo.BenefitsIQ/components/BenefitRecommendations';
import { GenerateReportModal } from '../../Halo.BenefitsIQ/components/modals/GenerateReportModal';
import { CostAnalysisModal } from '../../Halo.BenefitsIQ/components/modals/CostAnalysisModal';
import { EmployeeSurveyModal } from '../../Halo.BenefitsIQ/components/modals/EmployeeSurveyModal';
import { ScheduleReviewModal } from '../../Halo.BenefitsIQ/components/modals/ScheduleReviewModal';
import { CarrierPortalModal } from '../../Halo.BenefitsIQ/components/modals/CarrierPortalModal';

export const BenefitsIQv11 = () => {
  // Modal states
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showCostAnalysisModal, setShowCostAnalysisModal] = useState(false);
  const [showEmployeeSurveyModal, setShowEmployeeSurveyModal] = useState(false);
  const [showScheduleReviewModal, setShowScheduleReviewModal] = useState(false);
  const [showCarrierPortalModal, setShowCarrierPortalModal] = useState(false);
  const [refreshProjections, setRefreshProjections] = useState(0);

  // Mock company ID - in real app, this would come from context/props
  const companyId = "mock-company-id";

  const quickStats = [
    {
      title: "Total Benefit Costs",
      value: "$2.4M",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Employee Participation",
      value: "94.5%",
      change: "+2.1%",
      trend: "up", 
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Cost Per Employee",
      value: "$8,240",
      change: "-1.5%",
      trend: "down",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Risk Score",
      value: "72/100",
      change: "Medium",
      trend: "stable",
      icon: Shield,
      color: "text-orange-600"
    }
  ];

  const recentInsights = [
    {
      type: "Cost Optimization",
      title: "Potential savings identified in medical plans",
      description: "Switch to HDHPs could save $180k annually",
      impact: "High",
      date: "2 hours ago"
    },
    {
      type: "Risk Alert",
      title: "Claims volatility increasing",
      description: "Monitor Q4 medical claims for budget impact",
      impact: "Medium",
      date: "5 hours ago"
    },
    {
      type: "Compliance",
      title: "ACA reporting deadline approaching",
      description: "1094/1095 forms due by March 31st",
      impact: "High",
      date: "1 day ago"
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Benefits IQ v1.1
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced benefits intelligence and cost optimization platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.color} flex items-center gap-1`}>
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {stat.change}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="modeling">Cost Modeling</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
                <CardDescription>AI-powered recommendations and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{insight.type}</Badge>
                        <span className="text-xs text-muted-foreground">{insight.date}</span>
                      </div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="mt-2">
                        <Badge 
                          variant={insight.impact === 'High' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowGenerateReportModal(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Benefits Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowCostAnalysisModal(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run Cost Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowEmployeeSurveyModal(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Employee Survey
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowScheduleReviewModal(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowCarrierPortalModal(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Carrier Portal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Advanced Analytics</h2>
              <p className="text-muted-foreground">AI-powered insights and predictive modeling</p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search analytics..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Predictive Modeling */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Predictive Modeling
                </CardTitle>
                <CardDescription>
                  AI-powered cost forecasting and scenario analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Month Forecast</span>
                    <span className="font-bold">$204,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence Level</span>
                    <Badge variant="secondary">87%</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowPredictiveModal(true)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Comprehensive risk analysis and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Risk Score</span>
                    <span className="font-bold">72/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risk Level</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowRiskModal(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trend Analysis */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Historical trends and pattern recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">12-Month Trend</span>
                    <span className="font-bold text-green-600">+8.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowTrendModal(true)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Trends
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown Analysis</CardTitle>
                <CardDescription>Detailed cost distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Medical</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dental</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vision</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Life/Disability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '5%'}}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">94.5%</div>
                    <div className="text-xs text-muted-foreground">Enrollment Rate</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">4.2</div>
                    <div className="text-xs text-muted-foreground">Satisfaction Score</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">12%</div>
                    <div className="text-xs text-muted-foreground">Claims Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">$8.2k</div>
                    <div className="text-xs text-muted-foreground">Cost/Employee</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other existing tabs... */}
        <TabsContent value="benchmarking">
          <BenchmarkReport companyId={companyId} />
        </TabsContent>

        <TabsContent value="modeling">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cost Modeling Engine</h2>
                <p className="text-muted-foreground">Create scenarios and run financial projections</p>
              </div>
              <Button onClick={() => setShowScenarioModal(true)} className="bg-green-600 hover:bg-green-700">
                <Target className="h-4 w-4 mr-2" />
                Create New Scenario
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Target className="h-5 w-5" />
                    Scenario Planning
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Define enrollment assumptions and contribution strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-green-700">
                      ✓ Employee count and tier distribution
                    </div>
                    <div className="text-sm text-green-700">
                      ✓ Premium assumptions and contribution strategies  
                    </div>
                    <div className="text-sm text-green-700">
                      ✓ Employer contribution modeling (% or flat $)
                    </div>
                    <Button 
                      onClick={() => setShowScenarioModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Create New Scenario
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BarChart3 className="h-5 w-5" />
                    Cost Projections
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Analyze and compare scenario costs with budget thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-blue-700">
                      ✓ Monthly and annual cost forecasts
                    </div>
                    <div className="text-sm text-blue-700">
                      ✓ Budget threshold alerts ($500k/year)
                    </div>
                    <div className="text-sm text-blue-700">
                      ✓ Export to CSV and PDF formats
                    </div>
                    <Button 
                      onClick={() => setRefreshProjections(prev => prev + 1)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Projections
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Projections Component */}
            <CostProjections onRefresh={refreshProjections} />
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <BenefitRecommendations companyId={companyId} />
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Integrations</CardTitle>
              <CardDescription>Connect with benefit carriers and data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Integrations content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PredictiveModelingModal
        open={showPredictiveModal}
        onOpenChange={setShowPredictiveModal}
        companyId={companyId}
      />

      <RiskAssessmentModal
        open={showRiskModal}
        onOpenChange={setShowRiskModal}
        companyId={companyId}
      />

      <TrendAnalysisModal
        open={showTrendModal}
        onOpenChange={setShowTrendModal}
        companyId={companyId}
      />

      <ScenarioModal
        open={showScenarioModal}
        onOpenChange={setShowScenarioModal}
        onScenarioCreated={() => setRefreshProjections(prev => prev + 1)}
      />

      {/* Quick Actions Modals */}
      <GenerateReportModal
        open={showGenerateReportModal}
        onOpenChange={setShowGenerateReportModal}
        companyId={companyId}
      />

      <CostAnalysisModal
        open={showCostAnalysisModal}
        onOpenChange={setShowCostAnalysisModal}
        companyId={companyId}
      />

      <EmployeeSurveyModal
        open={showEmployeeSurveyModal}
        onOpenChange={setShowEmployeeSurveyModal}
        companyId={companyId}
      />

      <ScheduleReviewModal
        open={showScheduleReviewModal}
        onOpenChange={setShowScheduleReviewModal}
        companyId={companyId}
      />

      <CarrierPortalModal
        open={showCarrierPortalModal}
        onOpenChange={setShowCarrierPortalModal}
        companyId={companyId}
      />
    </div>
  );
};
