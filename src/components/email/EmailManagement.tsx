import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Edit, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  description: string;
  variables: string[];
}

const EmailManagement = () => {
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  
  const customerConfirmationTemplate: EmailTemplate = {
    id: 'customer-confirmation',
    name: 'Customer Purchase Confirmation',
    subject: 'Purchase Confirmation - Thank you \{\{customerName\}\}!',
    description: 'Sent to customers after successful purchase',
    variables: ['customerName', 'amount', 'currency', 'paymentId', 'date'],
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #655DC6;">Thank you for your purchase!</h2>
  <p>Hi \{\{customerName\}\},</p>
  <p>We've successfully processed your payment. Here are the details:</p>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Amount Paid:</strong> $\{\{amount\}\} \{\{currency\}\}</p>
    <p><strong>Payment ID:</strong> \{\{paymentId\}\}</p>
    <p><strong>Date:</strong> \{\{date\}\}</p>
  </div>
  <p>If you have any questions about your purchase, please don't hesitate to contact us.</p>
  <p>Best regards,<br>The EaseWorks Team</p>
</div>`
  };

  const adminNotificationTemplate: EmailTemplate = {
    id: 'admin-notification',
    name: 'Admin Purchase Notification',
    subject: '🎉 New Purchase: \{\{customerName\}\} - $\{\{amount\}\}',
    description: 'Sent to admin when new purchase is made',
    variables: ['customerName', 'customerEmail', 'amount', 'currency', 'paymentId', 'date'],
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #655DC6;">🎉 New Purchase Notification</h2>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <p><strong>Customer:</strong> \{\{customerName\}\}</p>
    <p><strong>Email:</strong> \{\{customerEmail\}\}</p>
    <p><strong>Amount:</strong> $\{\{amount\}\} \{\{currency\}\}</p>
    <p><strong>Payment ID:</strong> \{\{paymentId\}\}</p>
    <p><strong>Date:</strong> \{\{date\}\}</p>
  </div>
  <p style="margin-top: 20px;">The customer has been automatically added to your Active Clients list.</p>
</div>`
  };

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    customerConfirmationTemplate,
    adminNotificationTemplate
  ]);

  const handleSaveTemplate = (templateId: string, updatedTemplate: Partial<EmailTemplate>) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, ...updatedTemplate } : t
    ));
    setEditingTemplate(null);
    toast({
      title: "Template Updated",
      description: "Email template has been saved successfully.",
    });
  };

  const getPreviewWithSampleData = (template: EmailTemplate) => {
    let preview = template.htmlContent;
    const sampleData: Record<string, string> = {
      customerName: "John Doe",
      customerEmail: "john@example.com",
      amount: "49.99",
      currency: "USD",
      paymentId: "pi_1234567890",
      date: new Date().toLocaleString()
    };

    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      preview = preview.replace(regex, sampleData[variable] || `[${variable}]`);
    });

    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Email Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage all system email templates. Changes here will affect emails sent by the system.
      </p>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(editingTemplate === template.id ? null : template.id)}
                    >
                      {editingTemplate === template.id ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      {editingTemplate === template.id ? "Preview" : "Edit"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingTemplate === template.id ? (
                  <EmailTemplateEditor
                    template={template}
                    onSave={(updatedTemplate) => handleSaveTemplate(template.id, updatedTemplate)}
                    onCancel={() => setEditingTemplate(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Preview</Label>
                      <div 
                        className="mt-2 p-4 border rounded-lg bg-background"
                        dangerouslySetInnerHTML={{ __html: getPreviewWithSampleData(template) }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure global email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="from-name">Default From Name</Label>
                <Input id="from-name" defaultValue="EaseWorks" />
              </div>
              <div>
                <Label htmlFor="from-email">Default From Email</Label>
                <Input id="from-email" defaultValue="noreply@easeworks.com" />
              </div>
              <div>
                <Label htmlFor="reply-to">Reply To Email</Label>
                <Input id="reply-to" defaultValue="support@easeworks.com" />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (updatedTemplate: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [subject, setSubject] = useState(template.subject);
  const [htmlContent, setHtmlContent] = useState(template.htmlContent);

  const handleSave = () => {
    onSave({ subject, htmlContent });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="content">HTML Content</Label>
        <Textarea
          id="content"
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          rows={15}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Available Variables</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {template.variables.map((variable) => (
            <span
              key={variable}
              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs cursor-pointer"
              onClick={() => {
                const textarea = document.getElementById('content') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newContent = htmlContent.substring(0, start) + `{{${variable}}}` + htmlContent.substring(end);
                  setHtmlContent(newContent);
                }
              }}
            >
              {`{{${variable}}}`}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Click a variable to insert it at cursor position</p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EmailManagement;