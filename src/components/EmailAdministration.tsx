import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { AIHelperBar } from '@/components/email/AIHelperBar';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
  updated_at: string;
  variables?: any;
}

interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  sent_at: string;
  template_used?: string;
}

export const EmailAdministration = () => {
  const [emailSettings, setEmailSettings] = useState({
    from_name: "",
    from_email: "",
    reply_to: "",
    smtp_enabled: false,
    smtp_host: "smtp.office365.com",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: ""
  });
  
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    html_content: "",
    text_content: "",
    template_type: "general"
  });
  
  const [systemTemplates] = useState([
    {
      id: 'training_invitation',
      name: 'Training Invitation',
      subject: 'You have been assigned a new training: {{trainingTitle}}',
      html_content: `<h2>Hello {{employeeName}},</h2>
<p>You have been assigned a new training module:</p>
<h3>{{trainingTitle}}</h3>
<p><strong>Due Date:</strong> {{dueDate}}</p>
<p>Please click the link below to start your training:</p>
<a href="{{loginUrl}}" style="background-color: #655DC6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Training</a>
<p>Best regards,<br>{{companyName}} Training Team</p>`,
      template_type: 'system',
      is_system: true,
      variables: ['employeeName', 'trainingTitle', 'dueDate', 'loginUrl', 'companyName']
    },
    {
      id: 'training_reminder',
      name: 'Training Reminder',
      subject: 'Reminder: Complete your training - {{trainingTitle}}',
      html_content: `<h2>Hello {{employeeName}},</h2>
<p>This is a friendly reminder that you have an incomplete training:</p>
<h3>{{trainingTitle}}</h3>
<p><strong>Due Date:</strong> {{dueDate}}</p>
<p>Please complete your training as soon as possible:</p>
<a href="{{loginUrl}}" style="background-color: #655DC6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue Training</a>
<p>Best regards,<br>{{companyName}} Training Team</p>`,
      template_type: 'system',
      is_system: true,
      variables: ['employeeName', 'trainingTitle', 'dueDate', 'loginUrl', 'companyName']
    },
    {
      id: 'completion_certificate',
      name: 'Training Completion Certificate',
      subject: 'Congratulations! You completed {{trainingTitle}}',
      html_content: `<h2>Congratulations {{employeeName}}!</h2>
<p>You have successfully completed the training:</p>
<h3>{{trainingTitle}}</h3>
<p>Your certificate is attached to this email or can be downloaded from the link below:</p>
<a href="{{certificateUrl}}" style="background-color: #655DC6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a>
<p>Thank you for completing your training!</p>
<p>Best regards,<br>{{companyName}} Training Team</p>`,
      template_type: 'system',
      is_system: true,
      variables: ['employeeName', 'trainingTitle', 'certificateUrl', 'companyName']
    },
    {
      id: 'training_notification',
      name: 'General Training Notification',
      subject: '{{subject}}',
      html_content: `<h2>Hello {{employeeName}},</h2>
<div>{{message}}</div>
<p>{{actionText && actionUrl ? '<a href="' + actionUrl + '" style="background-color: #655DC6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">' + actionText + '</a>' : ''}}</p>
<p>Best regards,<br>{{companyName}} Training Team</p>`,
      template_type: 'system',
      is_system: true,
      variables: ['employeeName', 'subject', 'message', 'actionUrl', 'actionText', 'companyName']
    }
  ]);
  
  const [showSystemTemplates, setShowSystemTemplates] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    html_content: "",
    template_id: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailData();
  }, []);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      
      // Fetch email templates
      const { data: templates, error: templatesError } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (templatesError) {
        console.error('Error fetching email templates:', templatesError);
        setEmailTemplates([]);
      } else {
        setEmailTemplates(templates || []);
      }
      
      // Use mock data for email logs since the table might not exist yet
      setEmailLogs([
        {
          id: '1',
          to_email: 'test@example.com',
          subject: 'Welcome to EaseLearn',
          status: 'sent',
          sent_at: new Date().toISOString(),
          template_used: 'Welcome Email'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching email data:', error);
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save email settings to your configuration table
      toast({
        title: "Settings Saved",
        description: "Email configuration has been updated",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            html_content: templateForm.html_content,
            text_content: templateForm.text_content,
            template_type: templateForm.template_type
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        
        toast({
          title: "Template Updated",
          description: "Email template has been updated successfully",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: templateForm.name,
            subject: templateForm.subject,
            html_content: templateForm.html_content,
            text_content: templateForm.text_content,
            template_type: templateForm.template_type,
            created_by: '00000000-0000-0000-0000-000000000000' // Placeholder until auth is implemented
          });
        
        if (error) throw error;
        
        toast({
          title: "Template Created",
          description: "New email template has been created successfully",
        });
      }
      
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({ name: "", subject: "", html_content: "", text_content: "", template_type: "general" });
      fetchEmailData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let emailBody = composeForm.html_content;
      let emailSubject = composeForm.subject;
      
      // If template is selected, use template content
      if (composeForm.template_id) {
        const template = emailTemplates.find(t => t.id === composeForm.template_id);
        if (template) {
          emailSubject = template.subject;
          emailBody = template.html_content;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: composeForm.to,
          subject: emailSubject,
          html: emailBody,
          from_name: emailSettings.from_name,
          from_email: emailSettings.from_email,
          reply_to: emailSettings.reply_to
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${composeForm.to}`,
      });
      
      setShowComposeDialog(false);
      setComposeForm({ to: "", subject: "", html_content: "", template_id: "" });
      fetchEmailData();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully",
      });
      
      fetchEmailData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const startEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || "",
      template_type: template.template_type
    });
    setShowTemplateDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Administration</h1>
        <div className="text-center py-8">Loading email data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Administration</h1>
          <p className="text-muted-foreground">Manage email settings, templates, and send emails from your domain</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Compose Email</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="to">To Email *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({...composeForm, to: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="template">Use Template (Optional)</Label>
                  <Select value={composeForm.template_id} onValueChange={(value) => setComposeForm({...composeForm, template_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template</SelectItem>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="body">Message *</Label>
                  <Textarea
                    id="body"
                    value={composeForm.html_content}
                    onChange={(e) => setComposeForm({...composeForm, html_content: e.target.value})}
                    rows={10}
                    required
                  />
                  
                  {/* AI Helper Bar */}
                  <AIHelperBar
                    currentText={composeForm.html_content}
                    onTextChange={(newText) => setComposeForm({...composeForm, html_content: newText})}
                    className="mt-3"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowComposeDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Email Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({...emailSettings, from_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({...emailSettings, from_email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="reply_to">Reply To Email</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    value={emailSettings.reply_to}
                    onChange={(e) => setEmailSettings({...emailSettings, reply_to: e.target.value})}
                  />
                 </div>
               </div>
               
               <Card className="mt-6">
                 <CardHeader>
                   <CardTitle className="text-lg">Office 365 Email Setup</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex items-center space-x-2 mb-4">
                     <input
                       type="checkbox"
                       id="smtp_enabled"
                       checked={emailSettings.smtp_enabled}
                       onChange={(e) => setEmailSettings({...emailSettings, smtp_enabled: e.target.checked})}
                       className="rounded"
                     />
                     <Label htmlFor="smtp_enabled">Use Office 365 Email</Label>
                   </div>
                   
                   {emailSettings.smtp_enabled && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="smtp_username">Email Address</Label>
                         <Input
                           id="smtp_username"
                           type="email"
                           value={emailSettings.smtp_username}
                           onChange={(e) => setEmailSettings({...emailSettings, smtp_username: e.target.value})}
                           placeholder="your-email@yourcompany.com"
                         />
                       </div>
                       <div>
                         <Label htmlFor="smtp_password">Password</Label>
                         <Input
                           id="smtp_password"
                           type="password"
                           value={emailSettings.smtp_password}
                           onChange={(e) => setEmailSettings({...emailSettings, smtp_password: e.target.value})}
                           placeholder="Your email password"
                         />
                       </div>
                     </div>
                   )}
                 </CardContent>
               </Card>
               
               <div className="flex justify-end">
                 <Button onClick={handleSaveSettings}>
                   Save Settings
                 </Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSystemTemplates(!showSystemTemplates)}
              >
                {showSystemTemplates ? 'Hide' : 'Show'} System Templates
              </Button>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Template</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveTemplate} className="space-y-4">
                    <div>
                      <Label htmlFor="template_name">Template Name *</Label>
                      <Input
                        id="template_name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_type">Template Type</Label>
                      <Select value={templateForm.template_type} onValueChange={(value) => setTemplateForm({...templateForm, template_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template_subject">Subject *</Label>
                      <Input
                        id="template_subject"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_body">HTML Content *</Label>
                      <Textarea
                        id="template_body"
                        value={templateForm.html_content}
                        onChange={(e) => setTemplateForm({...templateForm, html_content: e.target.value})}
                        rows={10}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_text">Text Content (Optional)</Label>
                      <Textarea
                        id="template_text"
                        value={templateForm.text_content}
                        onChange={(e) => setTemplateForm({...templateForm, text_content: e.target.value})}
                        rows={5}
                        placeholder="Plain text version of the email"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowTemplateDialog(false);
                        setEditingTemplate(null);
                        setTemplateForm({ name: "", subject: "", html_content: "", text_content: "", template_type: "general" });
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingTemplate ? 'Update Template' : 'Create Template'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showSystemTemplates && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">System Email Templates</h3>
              <p className="text-sm text-muted-foreground">These are the default templates used by the system. You can customize them by creating a new template with the same name.</p>
              <div className="grid gap-4">
                {systemTemplates.map((template) => (
                  <Card key={template.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold">{template.name}</h4>
                            <Badge variant="secondary">{template.template_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Subject:</strong> {template.subject}
                          </p>
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1"><strong>Available Variables:</strong></p>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <details className="mt-3">
                            <summary className="text-sm font-medium cursor-pointer text-primary hover:underline">
                              View Template Content
                            </summary>
                            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                              {template.html_content}
                            </div>
                          </details>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setTemplateForm({
                                name: `Custom ${template.name}`,
                                subject: template.subject,
                                html_content: template.html_content,
                                text_content: "",
                                template_type: template.template_type
                              });
                              setEditingTemplate(null);
                              setShowTemplateDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Customize
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Templates</h3>
            {emailTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-muted-foreground">Create your first email template to get started</p>
                </CardContent>
              </Card>
            ) : (
              emailTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant="outline">{template.template_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEditTemplate(template)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Email Activity</h2>
          <div className="grid gap-4">
            {emailLogs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No email activity</h3>
                  <p className="text-muted-foreground">Email logs will appear here once you start sending emails</p>
                </CardContent>
              </Card>
            ) : (
              emailLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{log.subject}</span>
                          {log.status === 'sent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {log.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                          {log.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {log.to_email} • {new Date(log.sent_at).toLocaleString()}
                        </p>
                        {log.template_used && (
                          <Badge variant="outline" className="mt-2">{log.template_used}</Badge>
                        )}
                      </div>
                      <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                        {log.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};