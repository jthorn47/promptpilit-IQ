import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  templateId: string;
  templateName: string;
  templateType: string;
  brandIdentity: string;
  fromEmail: string;
  status: 'success' | 'error';
  emailId?: string;
  error?: string;
}

interface TestSummary {
  totalTemplates: number;
  successCount: number;
  errorCount: number;
  recipientEmail: string;
  results: TestResult[];
}

export const EmailTemplateTestSender: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('jeffrey@jeffreythorn.com');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const { toast } = useToast();

  const sendTestEmails = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResults(null);

    try {
      console.log('Calling send-template-tests function...');
      
      const { data, error } = await supabase.functions.invoke('send-template-tests', {
        body: {
          recipientEmail: recipientEmail
        }
      });

      if (error) {
        throw error;
      }

      console.log('Test email results:', data);
      setTestResults(data);

      toast({
        title: "Test Emails Sent!",
        description: `Successfully sent ${data.successCount} out of ${data.totalTemplates} test emails`,
        variant: data.errorCount > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      console.error('Error sending test emails:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test emails",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Template Test Sender</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={sendTestEmails} 
              disabled={isLoading || !recipientEmail}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Sending...' : 'Send Test Emails'}</span>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            This will send a test email from each active email template using all configured brand domains.
          </p>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{testResults.totalTemplates}</div>
                  <div className="text-sm text-muted-foreground">Total Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.successCount}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.errorCount}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <h4 className="font-semibold">Detailed Results:</h4>
                <div className="space-y-2">
                  {testResults.results.map((result) => (
                    <div 
                      key={result.templateId} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{result.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {result.templateType} | Brand: {result.brandIdentity} | From: {result.fromEmail}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">{result.error}</div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status === 'success' ? 'Sent' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};