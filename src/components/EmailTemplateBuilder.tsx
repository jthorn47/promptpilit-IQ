import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Code,
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Save,
  Loader2,
  Variable
} from "lucide-react";

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
  category: string;
  variables: any;
  design_config: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const EmailTemplateBuilder = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  
  const [templateForm, setTemplateForm] = useState<EmailTemplate>({
    name: "",
    subject: "",
    html_content: "",
    text_content: "",
    template_type: "general",
    category: "general",
    variables: [],
    design_config: {},
    is_active: true
  });

  const { toast } = useToast();

  const templateTypes = [
    { value: 'general', label: 'General' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'training', label: 'Training' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'welcome', label: 'Welcome' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'training', label: 'Training' },
    { value: 'reminders', label: 'Reminders' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const commonVariables = [
    '{{employee_name}}',
    '{{company_name}}',
    '{{training_title}}',
    '{{due_date}}',
    '{{manager_name}}',
    '{{completion_date}}',
    '{{certificate_url}}',
    '{{login_url}}'
  ];

  const defaultTemplates = [
    {
      name: "Training Assignment",
      subject: "New Training Assignment: {{training_title}}",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #655DC6, #9333EA); padding: 30px; border-radius: 12px 12px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Training Assignment</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151;">Hi {{employee_name}},</p>
            <p style="font-size: 16px; color: #374151;">You have been assigned a new training module:</p>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #655DC6;">
              <h2 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px;">{{training_title}}</h2>
              <p style="margin: 0; color: #6B7280;">Due Date: {{due_date}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{login_url}}" style="background: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Start Training</a>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
              Best regards,<br>
              {{company_name}} Training Team
            </p>
          </div>
        </div>
      `,
      template_type: "training",
      category: "training",
      variables: ["employee_name", "training_title", "due_date", "company_name", "login_url"]
    },
    {
      name: "Training Reminder",
      subject: "Reminder: {{training_title}} Due {{due_date}}",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 30px; border-radius: 12px 12px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Training Reminder</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151;">Hi {{employee_name}},</p>
            <p style="font-size: 16px; color: #374151;">This is a friendly reminder that your training assignment is due soon:</p>
            
            <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h2 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px;">{{training_title}}</h2>
              <p style="margin: 0; color: #92400E; font-weight: 600;">Due: {{due_date}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{login_url}}" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Complete Training</a>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
              Best regards,<br>
              {{company_name}} Training Team
            </p>
          </div>
        </div>
      `,
      template_type: "reminder",
      category: "reminders",
      variables: ["employee_name", "training_title", "due_date", "company_name", "login_url"]
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates_v2')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const templateData = {
        ...templateForm,
        created_by: userData.user.id,
        company_id: null // Will be set based on user's company
      };

      if (editingTemplate?.id) {
        const { error } = await supabase
          .from('email_templates_v2')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('email_templates_v2')
          .insert(templateData);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      setShowDialog(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        subject: "",
        html_content: "",
        text_content: "",
        template_type: "general",
        category: "general",
        variables: [],
        design_config: {},
        is_active: true
      });
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowDialog(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates_v2')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };
    setTemplateForm(duplicatedTemplate);
    setEditingTemplate(null);
    setShowDialog(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html_content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = templateForm.html_content;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setTemplateForm({...templateForm, html_content: newText});
    }
  };

  const createDefaultTemplates = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      for (const template of defaultTemplates) {
        await supabase.from('email_templates_v2').insert({
          ...template,
          created_by: userData.user.id,
          company_id: null
        });
      }

      toast({
        title: "Success",
        description: "Default templates created successfully",
      });
      fetchTemplates();
    } catch (error: any) {
      console.error('Error creating default templates:', error);
      toast({
        title: "Error",
        description: "Failed to create default templates",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Template Builder</h1>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Template Builder</h1>
          <p className="text-muted-foreground">Create and manage reusable email templates</p>
        </div>
        <div className="flex space-x-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={createDefaultTemplates}>
              <Layout className="w-4 h-4 mr-2" />
              Create Default Templates
            </Button>
          )}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input
                      id="template_name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="My Email Template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template_subject">Subject Line</Label>
                    <Input
                      id="template_subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                      placeholder="{{employee_name}}, you have a new assignment"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template_type">Template Type</Label>
                    <Select value={templateForm.template_type} onValueChange={(value) => setTemplateForm({...templateForm, template_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="template_category">Category</Label>
                    <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({...templateForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonVariables.map(variable => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                      >
                        <Variable className="w-3 h-3 mr-1" />
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="html_content">Email Content</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={activeView === 'visual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveView('visual')}
                      >
                        <Palette className="w-4 h-4 mr-1" />
                        Visual
                      </Button>
                      <Button
                        variant={activeView === 'code' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveView('code')}
                      >
                        <Code className="w-4 h-4 mr-1" />
                        HTML
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    id="html_content"
                    value={templateForm.html_content}
                    onChange={(e) => setTemplateForm({...templateForm, html_content: e.target.value})}
                    placeholder="Enter your email HTML content here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(templateForm)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleSaveTemplate} disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No email templates</h3>
              <p className="text-muted-foreground mb-4">Create your first email template to get started</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <Badge variant="secondary">{template.template_type}</Badge>
                      <Badge variant="outline">{template.category}</Badge>
                      {!template.is_active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(template.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Email Preview - {previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input value={previewTemplate.subject} readOnly />
              </div>
              <div>
                <Label>HTML Preview</Label>
                <div 
                  className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};