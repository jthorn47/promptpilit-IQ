import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown, 
  UserX, 
  Settings, 
  Bell,
  Download,
  Webhook,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SecurityAlert {
  id: string;
  type: 'security' | 'usage' | 'compliance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  affected_users?: string[];
  metadata?: any;
}

interface AlertRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  threshold: number;
  timeWindow: string;
  description: string;
  recipients: string[];
  webhookUrl?: string;
}

interface IntelligenceAlertsProps {
  dateRange: { from: Date; to: Date };
}

export function IntelligenceAlerts({ dateRange }: IntelligenceAlertsProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'export'>('alerts');

  // Mock data generation
  const generateMockAlerts = (): SecurityAlert[] => {
    const alertTypes = [
      {
        type: 'security',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        description: 'User admin@company.com has 15 failed login attempts in the last hour',
        affected_users: ['admin@company.com']
      },
      {
        type: 'usage',
        severity: 'medium',
        title: 'Unusual Module Access Pattern',
        description: 'Vault module usage dropped by 40% compared to last week',
        affected_users: []
      },
      {
        type: 'compliance',
        severity: 'critical',
        title: 'Missing User Attributes',
        description: '23 users are missing required department attribute for compliance',
        affected_users: ['user1@company.com', 'user2@company.com']
      },
      {
        type: 'system',
        severity: 'low',
        title: 'Permission Evaluation Latency',
        description: 'Average permission check time increased to 75ms (threshold: 50ms)',
        affected_users: []
      }
    ];

    return alertTypes.map((template, index) => ({
      id: `alert_${index}`,
      ...template,
      type: template.type as 'security' | 'usage' | 'compliance' | 'system',
      severity: template.severity as 'low' | 'medium' | 'high' | 'critical',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['active', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)] as 'active' | 'acknowledged' | 'resolved',
      metadata: {
        count: Math.floor(Math.random() * 50) + 1,
        source: 'permission_engine'
      }
    }));
  };

  const generateMockRules = (): AlertRule[] => {
    return [
      {
        id: 'rule_1',
        name: 'Failed Login Threshold',
        type: 'security',
        enabled: true,
        threshold: 10,
        timeWindow: '1 hour',
        description: 'Alert when user has too many failed login attempts',
        recipients: ['security@company.com'],
        webhookUrl: 'https://hooks.slack.com/services/...'
      },
      {
        id: 'rule_2',
        name: 'Module Usage Drop',
        type: 'usage',
        enabled: true,
        threshold: 30,
        timeWindow: '7 days',
        description: 'Alert when module usage drops significantly',
        recipients: ['admin@company.com']
      },
      {
        id: 'rule_3',
        name: 'Permission Latency',
        type: 'system',
        enabled: false,
        threshold: 100,
        timeWindow: '5 minutes',
        description: 'Alert when permission evaluation time exceeds threshold',
        recipients: ['tech@company.com']
      },
      {
        id: 'rule_4',
        name: 'Missing User Attributes',
        type: 'compliance',
        enabled: true,
        threshold: 10,
        timeWindow: '1 day',
        description: 'Alert when users are missing required attributes',
        recipients: ['compliance@company.com']
      }
    ];
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(generateMockAlerts());
      setAlertRules(generateMockRules());
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const exportAlerts = (format: 'csv' | 'json') => {
    console.log(`Exporting alerts as ${format}:`, alerts);
    // Implementation would create and download file
  };

  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(alert => alert.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(alert => alert.severity === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Immediate action needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(alert => alert.type === 'security').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Security-related alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(alert => 
                alert.status === 'resolved' && 
                new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Intelligence Alerts
          </CardTitle>
          <CardDescription>
            Security, usage, and compliance alerts generated by the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <AlertTitle className="text-base">{alert.title}</AlertTitle>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                        <Badge variant={
                          alert.status === 'active' ? 'destructive' :
                          alert.status === 'acknowledged' ? 'secondary' : 'default'
                        }>
                          {alert.status}
                        </Badge>
                      </div>
                      <AlertDescription>{alert.description}</AlertDescription>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(alert.timestamp), "PPpp")}
                        {alert.affected_users && alert.affected_users.length > 0 && (
                          <span> • Affects {alert.affected_users.length} user(s)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {alert.status === 'active' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRulesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Alert Rules Configuration
        </CardTitle>
        <CardDescription>
          Configure conditions and thresholds that trigger intelligence alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {alertRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium">{rule.name}</h4>
                  <Badge variant="outline">{rule.type}</Badge>
                  <Switch 
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggleRule(rule.id)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
                <div className="text-xs text-muted-foreground">
                  Threshold: {rule.threshold} | Time Window: {rule.timeWindow}
                  {rule.webhookUrl && <> | Webhook configured</>}
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure Alert Rule: {rule.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="threshold">Threshold</Label>
                      <Input 
                        id="threshold" 
                        type="number" 
                        defaultValue={rule.threshold} 
                        placeholder="Enter threshold value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeWindow">Time Window</Label>
                      <Input 
                        id="timeWindow" 
                        defaultValue={rule.timeWindow} 
                        placeholder="e.g., 1 hour, 1 day"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipients">Email Recipients</Label>
                      <Textarea 
                        id="recipients" 
                        defaultValue={rule.recipients.join(', ')} 
                        placeholder="email1@company.com, email2@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook">Webhook URL (Optional)</Label>
                      <Input 
                        id="webhook" 
                        defaultValue={rule.webhookUrl || ''} 
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                    <Button className="w-full">Save Configuration</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderExportTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Integration
        </CardTitle>
        <CardDescription>
          Export alert data and configure external integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium">Export Alert Data</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportAlerts('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportAlerts('json')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">External Integrations</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Webhook className="h-4 w-4 mr-2" />
                  Configure Slack Webhooks
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Setup Email Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  SIEM Integration
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Webhook Test</h4>
            <div className="space-y-2">
              <Input placeholder="Enter webhook URL" />
              <Button variant="outline">Send Test Alert</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'alerts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </Button>
        <Button
          variant={activeTab === 'export' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('export')}
        >
          Export
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && renderAlertsTab()}
      {activeTab === 'rules' && renderRulesTab()}
      {activeTab === 'export' && renderExportTab()}
    </div>
  );
}