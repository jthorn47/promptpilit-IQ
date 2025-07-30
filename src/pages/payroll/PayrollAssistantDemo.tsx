import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollAssistant } from '@/components/payroll/PayrollAssistant';
import { PayrollAssistantProvider } from '@/contexts/PayrollAssistantContext';
import { 
  MessageCircle, 
  Sparkles, 
  Zap, 
  Bot, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const PayrollAssistantDemo: React.FC = () => {
  return (
    <PayrollAssistantProvider>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Smart Payroll Assistant Demo</h1>
            <Badge variant="default" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Live Demo
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Interactive AI-powered assistant for payroll operations and guidance
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Natural Language Queries
                  </h4>
                  <ul className="text-sm space-y-1 ml-6 text-muted-foreground">
                    <li>• "Why did John's net pay change?"</li>
                    <li>• "How do I process off-cycle payroll?"</li>
                    <li>• "Show me all pending exceptions"</li>
                    <li>• "Walk me through tax setup"</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Contextual Actions
                  </h4>
                  <ul className="text-sm space-y-1 ml-6 text-muted-foreground">
                    <li>• Smart action suggestions</li>
                    <li>• Direct navigation to relevant pages</li>
                    <li>• Step-by-step guidance</li>
                    <li>• Real-time issue detection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sample Issues & Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">Missing Tax Withholding</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Federal tax not calculated for new employee Jane Doe
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="font-medium">Overtime Calculation Variance</span>
                    <Badge variant="secondary">Warning</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Employee John Smith has 45 hours with unusual overtime rate
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-success/5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="font-medium">New Employee Setup Complete</span>
                    <Badge variant="outline">Info</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All payroll profiles configured successfully for Mike Johnson
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Try the Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Click the floating assistant button</h3>
                <p className="text-muted-foreground mb-4">
                  Look for the chat icon in the bottom-right corner to start interacting with the Smart Payroll Assistant.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Ask about John's pay</Badge>
                  <Badge variant="outline">Request off-cycle guidance</Badge>
                  <Badge variant="outline">View active issues</Badge>
                  <Badge variant="outline">Get help with taxes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <PayrollAssistant />
    </PayrollAssistantProvider>
  );
};

export default PayrollAssistantDemo;