import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Mail, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SafeHtmlRenderer } from "@/components/ui/safe-html-renderer";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import { sanitizeText } from "@/utils/security";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
  is_active: boolean;
  variables: string[];
  created_at: string;
}

interface DatabaseTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
  is_active: boolean;
  variables: any;
  created_at: string;
}

export const EmailTemplatesManager = () => {
  const { user } = useAuth();
  const { token: csrfToken } = useCSRFToken();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    html_content: "",
    text_content: "",
    template_type: "general",
    variables: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database templates to proper format
      const transformedTemplates: EmailTemplate[] = (data || []).map((template: DatabaseTemplate) => ({
        ...template,
        variables: Array.isArray(template.variables) ? template.variables : []
      }));
      
      setTemplates(transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.subject || !newTemplate.html_content) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        });
        return;
      }

      // Sanitize inputs to prevent XSS
      const sanitizedTemplate = {
        name: sanitizeText(newTemplate.name),
        subject: sanitizeText(newTemplate.subject),
        html_content: newTemplate.html_content, // Will be sanitized when displayed
        text_content: sanitizeText(newTemplate.text_content),
        template_type: newTemplate.template_type
      };

      // Extract variables from content
      const variableRegex = /\{\{(\w+)\}\}/g;
      const variables = new Set<string>();
      const content = sanitizedTemplate.html_content + ' ' + sanitizedTemplate.subject + ' ' + sanitizedTemplate.text_content;
      let match;
      while ((match = variableRegex.exec(content)) !== null) {
        variables.add(match[1]);
      }

      const templateData = {
        ...sanitizedTemplate,
        variables: Array.from(variables),
        created_by: user?.id,
        csrf_token: csrfToken
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: "Success", description: "Template updated successfully" });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([templateData]);

        if (error) throw error;
        toast({ title: "Success", description: "Template created successfully" });
      }

      setShowAddDialog(false);
      setEditingTemplate(null);
      setNewTemplate({
        name: "",
        subject: "",
        html_content: "",
        text_content: "",
        template_type: "general",
        variables: []
      });
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || "",
      template_type: template.template_type,
      variables: template.variables
    });
    setShowAddDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || template.template_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Manage your email templates for consistent messaging</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingTemplate(null);
            setNewTemplate({
              name: "",
              subject: "",
              html_content: "",
              text_content: "",
              template_type: "general",
              variables: []
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Email Template</DialogTitle>
              <DialogDescription>
                Create reusable email templates with variables
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Template Type</Label>
                  <Select value={newTemplate.template_type} onValueChange={(value) => setNewTemplate({...newTemplate, template_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  placeholder="Welcome to {{company_name}}!"
                />
              </div>

              <Tabs defaultValue="html" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="html">HTML Content</TabsTrigger>
                  <TabsTrigger value="text">Text Content</TabsTrigger>
                </TabsList>

                <TabsContent value="html" className="space-y-2">
                  <Label htmlFor="html_content">HTML Content *</Label>
                  <Textarea
                    id="html_content"
                    value={newTemplate.html_content}
                    onChange={(e) => setNewTemplate({...newTemplate, html_content: e.target.value})}
                    placeholder="<h1>Welcome {{first_name}}!</h1><p>Thank you for your interest in {{company_name}}.</p>"
                    rows={12}
                  />
                </TabsContent>

                <TabsContent value="text" className="space-y-2">
                  <Label htmlFor="text_content">Text Content</Label>
                  <Textarea
                    id="text_content"
                    value={newTemplate.text_content}
                    onChange={(e) => setNewTemplate({...newTemplate, text_content: e.target.value})}
                    placeholder="Welcome {{first_name}}! Thank you for your interest in {{company_name}}."
                    rows={12}
                  />
                </TabsContent>
              </Tabs>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
                <p className="text-sm text-blue-700 mb-2">Use these variables in your template:</p>
                <div className="flex flex-wrap gap-2">
                  {['first_name', 'last_name', 'company_name', 'email', 'phone', 'job_title', 'sender_name', 'topic'].map((variable) => (
                    <Badge key={variable} variant="outline" className="text-blue-700 border-blue-300">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="follow_up">Follow-up</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.subject}</CardDescription>
                </div>
                <Badge className={getTypeColor(template.template_type)}>
                  {template.template_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3" />
                    <span>Variables: {template.variables.length}</span>
                  </div>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No email templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
              <DialogDescription>
                Subject: {previewTemplate.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Tabs defaultValue="html">
                <TabsList>
                  <TabsTrigger value="html">HTML Preview</TabsTrigger>
                  <TabsTrigger value="text">Text Version</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="space-y-2">
                  <SafeHtmlRenderer
                    html={previewTemplate.html_content}
                    className="border rounded-lg p-4 bg-white min-h-[400px]"
                  />
                </TabsContent>
                <TabsContent value="text" className="space-y-2">
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] whitespace-pre-wrap font-mono text-sm">
                    {previewTemplate.text_content || 'No text version available'}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};