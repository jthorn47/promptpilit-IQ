import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  RefreshCw, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SarahActivity {
  id: string;
  timestamp: string;
  clientName: string;
  actionType: string;
  description: string;
  confidence: number;
  outcome: 'success' | 'escalated' | 'failed';
  userFeedback?: string;
}

interface SarahTraining {
  id: string;
  alertType: string;
  scenario: string;
  response: string;
  effectiveness: number;
  lastUpdated: string;
}

export const SarahControls = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [newTrainingScenario, setNewTrainingScenario] = useState('');
  const [newTrainingResponse, setNewTrainingResponse] = useState('');

  // Mock Sarah activity data
  const sarahActivity: SarahActivity[] = [
    {
      id: 'sa_001',
      timestamp: '2024-01-16 09:30',
      clientName: 'TechFlow Solutions',
      actionType: 'Alert Resolution',
      description: 'Automatically resolved timesheet submission reminder',
      confidence: 0.95,
      outcome: 'success',
      userFeedback: 'Helpful resolution'
    },
    {
      id: 'sa_002',
      timestamp: '2024-01-16 08:45',
      clientName: 'Green Valley Manufacturing',
      actionType: 'Funding Alert',
      description: 'Escalated insufficient funding alert to finance team',
      confidence: 0.88,
      outcome: 'escalated'
    },
    {
      id: 'sa_003',
      timestamp: '2024-01-15 16:20',
      clientName: 'Sunrise Healthcare',
      actionType: 'Compliance Check',
      description: 'Identified missing W-4 forms and sent automated reminder',
      confidence: 0.92,
      outcome: 'success'
    },
    {
      id: 'sa_004',
      timestamp: '2024-01-15 14:15',
      clientName: 'Metro Construction LLC',
      actionType: 'Anomaly Detection',
      description: 'Failed to categorize unusual overtime pattern',
      confidence: 0.45,
      outcome: 'failed',
      userFeedback: 'Needs improvement on overtime analysis'
    }
  ];

  // Mock Sarah training data
  const sarahTraining: SarahTraining[] = [
    {
      id: 'st_001',
      alertType: 'Missing W-4',
      scenario: 'New employee onboarded without W-4 form',
      response: 'Send automated reminder to HR with form link and compliance deadline',
      effectiveness: 0.94,
      lastUpdated: '2024-01-10'
    },
    {
      id: 'st_002',
      alertType: 'Funding Shortfall',
      scenario: 'Account balance insufficient for upcoming payroll',
      response: 'Calculate exact shortfall, notify finance team, suggest funding timeline',
      effectiveness: 0.89,
      lastUpdated: '2024-01-08'
    },
    {
      id: 'st_003',
      alertType: 'Overtime Anomaly',
      scenario: 'Employee overtime exceeds historical average by >20%',
      response: 'Flag for manager review, provide historical comparison data',
      effectiveness: 0.76,
      lastUpdated: '2024-01-12'
    }
  ];

  const getOutcomeBadge = (outcome: SarahActivity['outcome']) => {
    switch (outcome) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'escalated':
        return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="h-3 w-3 mr-1" />Escalated</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 0.9) return 'bg-green-100 text-green-800';
    if (effectiveness >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Calculate summary stats
  const totalActions = sarahActivity.length;
  const successfulActions = sarahActivity.filter(a => a.outcome === 'success').length;
  const averageConfidence = sarahActivity.reduce((sum, a) => sum + a.confidence, 0) / totalActions;
  const averageEffectiveness = sarahTraining.reduce((sum, t) => sum + t.effectiveness, 0) / sarahTraining.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{totalActions}</p>
              </div>
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{Math.round((successfulActions / totalActions) * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                  {Math.round(averageConfidence * 100)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Training Models</p>
                <p className="text-2xl font-bold">{sarahTraining.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Sarah AI Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="training">Training Models</TabsTrigger>
              <TabsTrigger value="responses">Response Library</TabsTrigger>
              <TabsTrigger value="summaries">Client Summaries</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recent Sarah Activity</h3>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sarahActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{activity.timestamp}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{activity.clientName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{activity.actionType}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getConfidenceColor(activity.confidence)}`}>
                            {Math.round(activity.confidence * 100)}%
                          </span>
                        </TableCell>
                        <TableCell>{getOutcomeBadge(activity.outcome)}</TableCell>
                        <TableCell>
                          {activity.userFeedback ? (
                            <span className="text-sm text-muted-foreground">{activity.userFeedback}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No feedback</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="training" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Sarah Training Models</h3>
                  <Button size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Add Training Data
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Scenario</TableHead>
                      <TableHead>Response Strategy</TableHead>
                      <TableHead>Effectiveness</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sarahTraining.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell>
                          <Badge variant="outline">{training.alertType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm">{training.scenario}</p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm">{training.response}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEffectivenessColor(training.effectiveness)}>
                            {Math.round(training.effectiveness * 100)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{training.lastUpdated}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Training */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Training Scenario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Scenario Description</label>
                      <Textarea
                        placeholder="Describe the scenario Sarah should learn to handle..."
                        value={newTrainingScenario}
                        onChange={(e) => setNewTrainingScenario(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Recommended Response</label>
                      <Textarea
                        placeholder="Define how Sarah should respond to this scenario..."
                        value={newTrainingResponse}
                        onChange={(e) => setNewTrainingResponse(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Train Sarah
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="responses" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Sarah Response Templates</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compliance Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Missing W-4:</strong> "I've detected missing W-4 forms. I'll send reminders and provide the necessary links."</p>
                        <p><strong>Late Timesheets:</strong> "Multiple late timesheets detected. I'll notify managers and track submission progress."</p>
                        <p><strong>Tax Deadline:</strong> "Upcoming tax filing deadline. I'll prepare the necessary documents and schedule filing."</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Funding Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Insufficient Funds:</strong> "Account balance is below required minimum. I'll calculate the exact shortfall and notify the finance team."</p>
                        <p><strong>Delayed Confirmation:</strong> "Funding confirmation is delayed. I'll follow up with the bank and provide updates."</p>
                        <p><strong>Float Risk:</strong> "Potential float shortfall detected. I'll recommend immediate funding action."</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summaries" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Client Summary Generation</h3>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Summaries
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Summary Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Auto-generation frequency</label>
                        <select className="w-full p-2 border rounded">
                          <option>Weekly</option>
                          <option>Bi-weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Include in summaries</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Payroll processing status</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">HALO alert activity</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Funding status</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm">Compliance metrics</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Summaries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border-l-4 border-l-green-500 pl-3">
                          <p className="font-medium">TechFlow Solutions - Week of Jan 8</p>
                          <p className="text-sm text-muted-foreground">Payroll processed successfully. No alerts. Funding confirmed.</p>
                          <p className="text-xs text-muted-foreground">Generated 2 hours ago</p>
                        </div>
                        <div className="border-l-4 border-l-yellow-500 pl-3">
                          <p className="font-medium">Green Valley Mfg - Week of Jan 8</p>
                          <p className="text-sm text-muted-foreground">Payroll delayed due to funding confirmation. Resolved Friday.</p>
                          <p className="text-xs text-muted-foreground">Generated 1 day ago</p>
                        </div>
                        <div className="border-l-4 border-l-red-500 pl-3">
                          <p className="font-medium">Sunrise Healthcare - Week of Jan 8</p>
                          <p className="text-sm text-muted-foreground">Multiple compliance alerts. Missing W-4s addressed.</p>
                          <p className="text-xs text-muted-foreground">Generated 1 day ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};