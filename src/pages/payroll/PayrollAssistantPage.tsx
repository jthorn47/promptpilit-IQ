import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Bot, Sparkles, ArrowRight, Users, BarChart3, FileText } from 'lucide-react';
import { PayrollCopilot } from '@/components/payroll/PayrollCopilot';

const PayrollAssistantPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>Payroll</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground">Smart Assistant</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Smart Payroll Assistant</h1>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Phase 2 - AI Integration Pending
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          AI-powered natural language interface for payroll questions and guidance
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interactive Assistant */}
        <div className="space-y-6">
          <PayrollCopilot />
        </div>

        {/* Feature Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Natural Language Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ask questions in plain English and get intelligent responses based on your payroll data:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>"How do I process an off-cycle run?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>"What's the tax withholding on John Doe's last paycheck?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>"Show me all pending payroll exceptions"</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contextual Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The assistant pulls context from your existing payroll records, audit logs, 
                configuration settings, and employee data to provide accurate, personalized responses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Task Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get guided workflows for complex operations:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Multi-state tax setup</span>
                  <Badge variant="outline" className="text-xs">Guided</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Retro pay processing</span>
                  <Badge variant="outline" className="text-xs">Step-by-step</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">ACH troubleshooting</span>
                  <Badge variant="outline" className="text-xs">Interactive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PayrollCalculations</span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AuditTrailExplorer</span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">PayStubGenerator</span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">OpenAI Integration</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayrollAssistantPage;