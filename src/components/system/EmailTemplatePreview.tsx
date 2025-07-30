import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Send, AlertTriangle, Loader } from 'lucide-react';
import { SystemEmailTemplate } from './SystemEmailTemplates';
import { useTestEmail } from '@/hooks/useTestEmail';

interface EmailTemplatePreviewProps {
  template: SystemEmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

// Common variables that might be used in email templates
const SAMPLE_VARIABLES = {
  '{{user_name}}': 'John Doe',
  '{{user_email}}': 'john.doe@example.com',
  '{{company_name}}': 'EaseLearn',
  '{{verification_code}}': '123456',
  '{{verification_link}}': 'https://app.easeworks.com/verify?token=abc123',
  '{{login_link}}': 'https://app.easeworks.com/login',
  '{{reset_link}}': 'https://app.easeworks.com/reset-password?token=xyz789',
  '{{current_date}}': new Date().toLocaleDateString(),
  '{{current_time}}': new Date().toLocaleTimeString(),
  '{{support_email}}': 'support@easeworks.com',
  '{{security_team}}': 'EaseLearn Security Team',
  '{{ip_address}}': '192.168.1.100',
  '{{device_info}}': 'Chrome on Windows 10',
  '{{backup_codes}}': 'ABC123, DEF456, GHI789',
  '{{expiry_time}}': '15 minutes',
  '{{action_url}}': 'https://app.easeworks.com/action',
  '{{admin_name}}': 'System Administrator'
};

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  template,
  isOpen,
  onClose
}) => {
  console.log('EmailTemplatePreview rendered:', { template, isOpen });
  const { sendTestEmail, sending } = useTestEmail();
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState('');
  const [activeTab, setActiveTab] = useState('preview');

  if (!template) {
    console.log('No template provided to preview');
    return null;
  }

  // Extract variables from template body and subject
  const extractVariables = (text: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.add(`{{${match[1]}}}`);
    }
    return Array.from(variables);
  };

  const allVariables = [
    ...extractVariables(template.subject || ''),
    ...extractVariables(template.body || '')
  ];

  const uniqueVariables = Array.from(new Set(allVariables));

  // Replace variables in text with sample or custom values
  const replaceVariables = (text: string) => {
    if (!text) return '';
    let result = text;
    uniqueVariables.forEach(variable => {
      const customValue = customVariables[variable];
      const sampleValue = SAMPLE_VARIABLES[variable as keyof typeof SAMPLE_VARIABLES];
      const value = customValue || sampleValue || variable;
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return result;
  };

  const previewSubject = replaceVariables(template.subject);
  const previewBody = replaceVariables(template.body);

  const handleVariableChange = (variable: string, value: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      return;
    }

    const allVariables = { ...customVariables };
    // Fill in any missing variables with sample data
    uniqueVariables.forEach(variable => {
      if (!allVariables[variable]) {
        allVariables[variable] = SAMPLE_VARIABLES[variable as keyof typeof SAMPLE_VARIABLES] || variable;
      }
    });

    await sendTestEmail({
      templateId: template.id,
      templateName: template.name,
      subject: template.subject,
      htmlContent: template.body,
      testEmail: testEmail.trim(),
      variables: allVariables
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Template Preview: {template.name}
          </DialogTitle>
          <DialogDescription>
            Preview how the email template will look when sent to users
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 mt-4 h-[600px]">
          {/* Left Panel - Template Info & Variables */}
          <div className="lg:w-1/3 space-y-4 overflow-y-auto">
            {/* Template Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <div className="font-medium">{template.name}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant="outline">{template.template_type}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <div className="text-sm">{template.subject}</div>
                </div>
              </CardContent>
            </Card>

            {/* Variables */}
            {uniqueVariables.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Template Variables ({uniqueVariables.length})</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Customize values for preview
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                  {uniqueVariables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <Label className="text-xs">{variable}</Label>
                      <Input
                        placeholder={SAMPLE_VARIABLES[variable as keyof typeof SAMPLE_VARIABLES] || 'Enter value...'}
                        value={customVariables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Test Email */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Send Test Email</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Send a test email with current variable values
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Test Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <Button 
                  onClick={handleSendTestEmail}
                  disabled={!testEmail.trim() || sending}
                  className="w-full"
                  size="sm"
                >
                  {sending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:w-2/3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Email Preview</CardTitle>
                  {!template.is_active && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Template Inactive</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[500px] overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <div className="px-4">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visual Preview
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        HTML Source
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="preview" className="mt-0 h-[420px] overflow-hidden">
                    {/* Email Header */}
                    <div className="border-b bg-muted/50 p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From:</span>
                          <span>EaseLearn &lt;noreply@easeworks.com&gt;</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To:</span>
                          <span>{customVariables['{{user_email}}'] || 'john.doe@example.com'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="font-medium">{previewSubject}</span>
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="p-4 h-[320px] overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewBody }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-0 h-[420px] overflow-hidden">
                    <div className="h-full overflow-auto">
                      <pre className="text-xs p-4 bg-muted/50 font-mono whitespace-pre-wrap h-full">
                        <code>{previewBody}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};