
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IQTooltip } from "@/components/ui/iq-tooltip";
import { CostModeler } from "./CostModeler";
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface BenefitsIQDashboardProps {
  isGlobalView?: boolean;
}

export const BenefitsIQDashboard: React.FC<BenefitsIQDashboardProps> = ({ 
  isGlobalView = false 
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (activeTab === "modeling") {
      console.log('🔧 Modeling tab activated - CostModeler should be rendering');
    }
  }, [activeTab]);

  const stats = [
    {
      title: "Total Savings Identified",
      value: "$2.4M",
      change: "+12.5%",
      icon: DollarSign,
      tooltip: "AI-powered analysis has identified potential cost savings across all benefit plans."
    },
    {
      title: "Benchmark Score",
      value: "94/100",
      change: "+8 points",
      icon: TrendingUp,
      tooltip: "Your benefits package performance compared to industry standards and peer organizations."
    },
    {
      title: "Employees Analyzed",
      value: "1,247",
      change: "100%",
      icon: Users,
      tooltip: "Complete employee demographic and benefits utilization analysis for optimal plan design."
    },
    {
      title: "Plan Efficiency",
      value: "87%",
      change: "+15%",
      icon: BarChart3,
      tooltip: "Overall efficiency score based on cost-to-value ratio across all benefit offerings."
    }
  ];

  const recentAnalyses = [
    {
      id: 1,
      title: "Q4 2024 Benchmark Analysis",
      status: "completed",
      date: "2024-12-15",
      savings: "$340K",
      recommendations: 8
    },
    {
      id: 2,
      title: "Health Plan Cost Modeling",
      status: "in_progress",
      date: "2024-12-18",
      savings: "TBD",
      recommendations: 0
    },
    {
      id: 3,
      title: "Retirement Plan Optimization",
      status: "pending",
      date: "2024-12-20",
      savings: "TBD",
      recommendations: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Benefits IQ
            <IQTooltip 
              content={
                <div>
                  <p className="font-medium mb-2">HaaLO Benefits IQ</p>
                  <p>AI-powered benefits intelligence platform that analyzes, benchmarks, and optimizes your benefits strategy through advanced machine learning algorithms.</p>
                </div>
              }
              showBranding={true}
              maxWidth="max-w-sm"
            />
          </h1>
          <p className="text-muted-foreground">
            {isGlobalView ? "Global Benefits Intelligence Dashboard" : "Intelligent benefits analysis and optimization"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stat.title}
                <IQTooltip content={<p>{stat.tooltip}</p>} size="sm" />
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="modeling">Cost Modeling</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Recent Analyses
                  <IQTooltip 
                    content={<p>Latest benefits analyses with AI-generated insights and recommendations.</p>}
                    size="sm"
                  />
                </CardTitle>
                <CardDescription>
                  Track your benefits optimization progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(analysis.status)}
                        <div>
                          <p className="font-medium">{analysis.title}</p>
                          <p className="text-sm text-muted-foreground">{analysis.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{analysis.savings}</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.recommendations} recommendations
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  AI Insights
                  <IQTooltip 
                    content={
                      <div>
                        <p className="font-medium mb-1">Machine Learning Insights</p>
                        <p>Real-time analysis of your benefits data using advanced AI algorithms to identify optimization opportunities.</p>
                      </div>
                    }
                    showBranding={true}
                  />
                </CardTitle>
                <CardDescription>
                  Powered by HaaLO's AI engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">High-Impact Opportunity</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Switching to a high-deductible health plan could save $280K annually while maintaining employee satisfaction scores above 85%.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Performance Trending</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your benefits utilization efficiency has improved by 23% over the past quarter, outperforming industry benchmarks.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Industry Benchmarks
                <IQTooltip 
                  content={<p>Compare your benefits package against industry standards and peer organizations using comprehensive market data.</p>}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Detailed benchmark analysis coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modeling">
          <div className="space-y-6">
            <div className="bg-red-500 text-white p-8 rounded-lg text-center">
              <h1 className="text-4xl font-bold mb-4">🚨 COST MODELING IS WORKING! 🚨</h1>
              <p className="text-xl">If you see this big red box, the Cost Modeling tab is working correctly!</p>
              <p className="text-lg mt-4">The old 'coming soon' message has been replaced.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-100 border border-green-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-800 mb-2">✅ Scenario Planning</h3>
                <p className="text-green-700 mb-4">Create and manage cost scenarios</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Create New Scenario
                </button>
              </div>
              
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-2">📊 Cost Projections</h3>
                <p className="text-blue-700 mb-4">Run financial projections</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Run Projections
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Recommendations
                <IQTooltip 
                  content={<p>Personalized recommendations generated by AI analysis of your organization's unique benefits landscape and employee demographics.</p>}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Personalized recommendations based on your data analysis...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
