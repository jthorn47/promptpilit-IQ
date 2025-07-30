import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EmailCaseService, type EmailData, type ManualCaseFromEmailRequest } from '@/services/EmailCaseService';
import { Mail, Bot, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export const EmailProcessingDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmailData, setManualEmailData] = useState<Partial<ManualCaseFromEmailRequest>>({
    priority: 'medium',
    case_type: 'general_support'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await EmailCaseService.getAIProcessingStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProcessTestEmail = async () => {
    setProcessing(true);
    try {
      const testEmail: EmailData = {
        email_id: `test-${Date.now()}`,
        subject: 'Test Support Request',
        from: 'customer@example.com',
        to: 'support@company.com',
        content: 'Hello, I need help with my account. I cannot log in and need assistance.',
        received_at: new Date().toISOString()
      };

      const result = await EmailCaseService.processEmailWithAI(testEmail);
      
      toast({
        title: "Email Processed",
        description: `AI Decision: ${result.decision} (Confidence: ${Math.round(result.confidence * 100)}%)`,
      });

      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process test email",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualCaseCreation = async () => {
    try {
      if (!manualEmailData.email_id || !manualEmailData.subject || !manualEmailData.from || !manualEmailData.content) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const result = await EmailCaseService.createCaseFromEmail(manualEmailData as ManualCaseFromEmailRequest);
      
      toast({
        title: "Case Created",
        description: `Case ${result.case.id} created successfully from email`,
      });

      setShowManualForm(false);
      setManualEmailData({ priority: 'medium', case_type: 'general_support' });
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case from email",
        variant: "destructive"
      });
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'create_case':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'auto_close':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no_case_needed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'needs_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'create_case':
        return 'bg-orange-100 text-orange-800';
      case 'auto_close':
        return 'bg-green-100 text-green-800';
      case 'no_case_needed':
        return 'bg-gray-100 text-gray-800';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Processing Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor AI-powered email processing and create cases manually
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleProcessTestEmail} 
            disabled={processing}
            variant="outline"
          >
            <Bot className="h-4 w-4 mr-2" />
            {processing ? 'Processing...' : 'Test AI Processing'}
          </Button>
          <Button onClick={() => setShowManualForm(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Create Case from Email
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cases Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.created_cases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Auto Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.auto_closed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">No Case Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.no_case_needed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needs_review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.average_confidence ? Math.round(stats.average_confidence * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Case Creation Form */}
      {showManualForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Case from Email</CardTitle>
            <CardDescription>
              Manually create a support case from an email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_id">Email ID *</Label>
                <Input
                  id="email_id"
                  value={manualEmailData.email_id || ''}
                  onChange={(e) => setManualEmailData(prev => ({ ...prev, email_id: e.target.value }))}
                  placeholder="unique-email-id"
                />
              </div>
              <div>
                <Label htmlFor="from">From Email *</Label>
                <Input
                  id="from"
                  type="email"
                  value={manualEmailData.from || ''}
                  onChange={(e) => setManualEmailData(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={manualEmailData.subject || ''}
                onChange={(e) => setManualEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
              />
            </div>

            <div>
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                value={manualEmailData.content || ''}
                onChange={(e) => setManualEmailData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Email content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="case_type">Case Type</Label>
                <Select 
                  value={manualEmailData.case_type} 
                  onValueChange={(value) => setManualEmailData(prev => ({ ...prev, case_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_support">General Support</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={manualEmailData.priority} 
                  onValueChange={(value) => setManualEmailData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowManualForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualCaseCreation}>
                Create Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Email Processing
          </CardTitle>
          <CardDescription>
            How the AI processes incoming emails and creates cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getDecisionIcon('create_case')}
              <div>
                <Badge className={getDecisionColor('create_case')}>Create Case</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Genuine support requests that need human attention
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getDecisionIcon('auto_close')}
              <div>
                <Badge className={getDecisionColor('auto_close')}>Auto Close</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Simple questions that can be answered immediately (FAQ-type)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getDecisionIcon('no_case_needed')}
              <div>
                <Badge className={getDecisionColor('no_case_needed')}>No Case Needed</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Spam, promotional emails, or clearly not support-related
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getDecisionIcon('needs_review')}
              <div>
                <Badge className={getDecisionColor('needs_review')}>Needs Review</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Uncertain cases that need human review
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};