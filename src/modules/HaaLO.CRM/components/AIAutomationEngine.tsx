/**
 * AI & Automation Engine - Stage 6
 * Intelligent automation hub with AI-powered workflows and insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Zap, Settings, Target, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Mail, Phone, MessageSquare, BarChart3,
  Workflow, Sparkles, Bot, Cpu, Database, Bell, Eye,
  Play, Pause, Edit, Plus, ArrowRight, Activity
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'inactive' | 'draft';
  lastRun: string;
  successRate: number;
  totalRuns: number;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created: string;
  actionable: boolean;
}

export const AIAutomationEngine: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data initialization
  useEffect(() => {
    setWorkflows([
      {
        id: '1',
        name: 'Lead Scoring & Assignment',
        description: 'Automatically score new leads and assign to best rep',
        trigger: 'New lead created',
        actions: ['Calculate AI score', 'Assign to rep', 'Send notification'],
        status: 'active',
        lastRun: '2024-01-15T14:30:00Z',
        successRate: 94,
        totalRuns: 156
      },
      {
        id: '2',
        name: 'Stale Deal Follow-up',
        description: 'Create follow-up tasks for inactive opportunities',
        trigger: 'Deal inactive for 7 days',
        actions: ['Create follow-up task', 'Send reminder email', 'Update priority'],
        status: 'active',
        lastRun: '2024-01-15T10:15:00Z',
        successRate: 87,
        totalRuns: 89
      },
      {
        id: '3',
        name: 'Win/Loss Analysis',
        description: 'Analyze closed deals and extract insights',
        trigger: 'Deal status changed to won/lost',
        actions: ['Analyze deal data', 'Update competitor intel', 'Generate insights'],
        status: 'draft',
        lastRun: '',
        successRate: 0,
        totalRuns: 0
      }
    ]);

    setInsights([
      {
        id: '1',
        type: 'opportunity',
        title: 'High-Value Deal at Risk',
        description: 'Acme Corp deal ($150K) shows 73% risk of stalling based on activity patterns',
        confidence: 87,
        priority: 'critical',
        created: '2024-01-15T12:00:00Z',
        actionable: true
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Q1 Revenue Forecast Update',
        description: 'Based on current pipeline velocity, Q1 revenue likely to exceed target by 12%',
        confidence: 82,
        priority: 'medium',
        created: '2024-01-15T08:30:00Z',
        actionable: false
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Optimize Follow-up Timing',
        description: 'Tuesday 2-4 PM shows 34% higher response rates. Suggest rescheduling 8 pending calls',
        confidence: 91,
        priority: 'high',
        created: '2024-01-14T16:45:00Z',
        actionable: true
      }
    ]);
  }, []);

  const engineMetrics = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    totalInsights: insights.length,
    criticalInsights: insights.filter(i => i.priority === 'critical').length,
    avgSuccessRate: Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length || 0),
    automationUptime: 99.2
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'recommendation': return <Sparkles className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
    toast({
      title: "Workflow Updated",
      description: "Workflow status has been changed successfully"
    });
  };

  const generateInsights = async () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'recommendation',
        title: 'New AI Insight Generated',
        description: 'Based on recent activity analysis, 5 prospects show high buying intent signals',
        confidence: 89,
        priority: 'high',
        created: new Date().toISOString(),
        actionable: true
      };
      setInsights(prev => [newInsight, ...prev]);
      setLoading(false);
      toast({
        title: "AI Analysis Complete",
        description: "New insights generated from latest data"
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI & Automation Engine
          </h1>
          <p className="text-muted-foreground">Intelligent workflows and AI-powered insights for your CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateInsights} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{engineMetrics.totalWorkflows}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{engineMetrics.activeWorkflows}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold text-purple-600">{engineMetrics.totalInsights}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{engineMetrics.criticalInsights}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{engineMetrics.avgSuccessRate}%</p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-blue-600">{engineMetrics.automationUptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Engine Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  Engine Performance
                </CardTitle>
                <CardDescription>
                  Real-time automation engine metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Workflow Success Rate</span>
                    <span className="font-medium">{engineMetrics.avgSuccessRate}%</span>
                  </div>
                  <Progress value={engineMetrics.avgSuccessRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span className="font-medium">{engineMetrics.automationUptime}%</span>
                  </div>
                  <Progress value={engineMetrics.automationUptime} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Model Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Processing Speed</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest automation and AI activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Lead Scoring Completed</p>
                    <p className="text-xs text-muted-foreground">5 new leads processed - 2 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up Tasks Created</p>
                    <p className="text-xs text-muted-foreground">3 automatic tasks generated - 15 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI Insights Generated</p>
                    <p className="text-xs text-muted-foreground">Risk analysis completed - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pipeline Analysis</p>
                    <p className="text-xs text-muted-foreground">Weekly report generated - 2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Automation Workflows
              </CardTitle>
              <CardDescription>
                Manage and monitor your automated business processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={workflow.status === 'active'}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                        <div>
                          <h3 className="font-medium">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                          {workflow.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Trigger</p>
                        <p className="text-sm font-medium">{workflow.trigger}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                        <p className="text-sm font-medium text-green-600">{workflow.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                        <p className="text-sm font-medium">{workflow.totalRuns}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Run</p>
                        <p className="text-sm font-medium">
                          {workflow.lastRun 
                            ? new Date(workflow.lastRun).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                            {index > 0 && <ArrowRight className="h-3 w-3" />}
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Machine learning driven insights and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        {insight.actionable && (
                          <Button size="sm">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          Confidence: <span className="font-medium text-foreground">{insight.confidence}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          Type: <span className="font-medium text-foreground capitalize">{insight.type}</span>
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(insight.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Engine Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI model parameters and automation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-generate Tasks</p>
                    <p className="text-sm text-muted-foreground">Automatically create follow-up tasks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lead Scoring</p>
                    <p className="text-sm text-muted-foreground">AI-powered lead quality scoring</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Risk Detection</p>
                    <p className="text-sm text-muted-foreground">Detect at-risk opportunities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Smart Notifications</p>
                    <p className="text-sm text-muted-foreground">AI-filtered important alerts</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Processing
                </CardTitle>
                <CardDescription>
                  Configure data sources and processing schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Insight Generation Frequency</label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Model Confidence Threshold</label>
                  <Select defaultValue="80">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70">70%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Data Retention Period</label>
                  <Select defaultValue="12">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};