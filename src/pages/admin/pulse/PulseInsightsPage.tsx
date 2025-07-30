import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Clock, Target } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const aiInsights = [
  {
    id: '1',
    title: 'High-Risk Pattern Detected',
    description: 'Similar harassment cases have increased by 40% in the Engineering department over the past 3 months.',
    type: 'risk_assessment',
    severity: 'high',
    confidence: 92,
    recommendations: [
      'Schedule mandatory harassment training for Engineering team',
      'Review management practices in affected areas',
      'Implement anonymous reporting system'
    ],
    impact: 'High'
  },
  {
    id: '2',
    title: 'Resolution Time Optimization',
    description: 'Cases assigned to Case Manager A are resolved 35% faster than team average.',
    type: 'performance',
    severity: 'medium',
    confidence: 88,
    recommendations: [
      'Document best practices from Case Manager A',
      'Provide training based on successful methodologies',
      'Consider workload redistribution'
    ],
    impact: 'Medium'
  },
  {
    id: '3',
    title: 'Compliance Risk Alert',
    description: 'Current case documentation may not meet EEOC requirements for 3 active investigations.',
    type: 'compliance',
    severity: 'critical',
    confidence: 95,
    recommendations: [
      'Review documentation standards immediately',
      'Update case templates to include required fields',
      'Schedule legal consultation'
    ],
    impact: 'Critical'
  }
];

const upcomingFeatures = [
  {
    name: 'Predictive Case Scoring',
    description: 'AI-powered risk assessment for new cases',
    status: 'In Development'
  },
  {
    name: 'Automated Case Summaries',
    description: 'Generate comprehensive case summaries automatically',
    status: 'Beta Testing'
  },
  {
    name: 'Smart Task Prioritization',
    description: 'Intelligent task ordering based on urgency and resources',
    status: 'Planned'
  },
  {
    name: 'Natural Language Queries',
    description: 'Ask questions about your cases in plain English',
    status: 'Research'
  }
];

export const PulseInsightsPage: React.FC = () => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-orange-600',
      'high': 'text-red-600',
      'critical': 'text-red-700'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'In Development': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'Beta Testing': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'Planned': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'Research': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <StandardPageLayout
      title="Case Insights"
      subtitle="AI-generated risk insights and recommendations"
      badge="Coming Soon"
    >
      <div className="space-y-6">
        {/* Coming Soon Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  AI-Powered Case Insights Coming Soon
                </h3>
                <p className="text-blue-700 dark:text-blue-200">
                  Advanced analytics and machine learning capabilities are currently in development. 
                  Preview the features below to see what's coming.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI-Generated Insights (Preview)</h2>
            <Button disabled>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate New Insights
            </Button>
          </div>

          {aiInsights.map((insight) => (
            <Card key={insight.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.severity === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                      insight.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {insight.type === 'risk_assessment' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {insight.type === 'performance' && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {insight.type === 'compliance' && <Target className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getSeverityColor(insight.severity)} bg-transparent border-current`}>
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.confidence}% confidence
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Impact Level: <span className={getSeverityColor(insight.severity.toLowerCase())}>
                        {insight.impact}
                      </span>
                    </span>
                    <Button size="sm" variant="outline" disabled>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Features */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming AI Features</CardTitle>
            <CardDescription>
              Advanced capabilities currently in development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{feature.name}</h4>
                      <Badge className={getStatusBadge(feature.status)}>
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Beta Access */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interested in Early Access?</h3>
            <p className="text-muted-foreground mb-4">
              Be among the first to experience AI-powered case insights when they become available.
            </p>
            <Button>
              Join Beta Program
            </Button>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};