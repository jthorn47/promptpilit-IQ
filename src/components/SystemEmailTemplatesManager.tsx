import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSystemEmailTemplates, SystemEmailTemplate } from "@/hooks/useSystemEmailTemplates";
import { BrandFilter } from "@/components/admin/BrandFilter";
import { BrandIdentity } from "@/types/brand";
import { BrandService } from "@/services/BrandService";
import { Plus, Edit, Trash2, Send, Eye } from "lucide-react";
import { toast } from "sonner";

export const SystemEmailTemplatesManager = () => {
  const [selectedBrands, setSelectedBrands] = useState<BrandIdentity[]>([]);
  const { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useSystemEmailTemplates(selectedBrands);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SystemEmailTemplate | null>(null);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    body: "",
    template_type: "notification" as SystemEmailTemplate['template_type'],
    brand_identity: null as BrandIdentity | null,
    is_active: true
  });

  const resetForm = () => {
    setTemplateForm({
      name: "",
      subject: "",
      body: "",
      template_type: "notification" as SystemEmailTemplate['template_type'],
      brand_identity: null,
      is_active: true
    });
    setEditingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    // STEP 9: Require brand_identity when creating templates
    if (!templateForm.brand_identity) {
      toast.error('Please select a brand identity - it is required for all email templates');
      return;
    }

    setIsCreatingTemplate(true);
    try {
      await createTemplate({
        name: templateForm.name,
        template_type: templateForm.template_type,
        category: templateForm.template_type,
        subject: templateForm.subject,
        body: templateForm.body,
        variables: [],
        is_active: templateForm.is_active,
        is_default: false,
        brand_identity: templateForm.brand_identity! // Required brand identity
      });

      toast.success('Template created successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !templateForm.name || !templateForm.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await updateTemplate(editingTemplate.id, {
        name: templateForm.name,
        template_type: templateForm.template_type,
        category: templateForm.template_type,
        subject: templateForm.subject,
        body: templateForm.body,
        is_active: templateForm.is_active
      });

      toast.success('Template updated successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error(error.message || 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast.success('Template deleted successfully');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleEditTemplate = (template: SystemEmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      template_type: template.template_type,
      brand_identity: null, // This would come from the template if we had brand_identity in the interface
      is_active: template.is_active
    });
  };

  const handleBrandFilterChange = (brands: BrandIdentity[]) => {
    setSelectedBrands(brands);
    fetchTemplates(brands);
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'authentication': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'notification': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      case '2fa': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading system email templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Email Templates</h1>
          <p className="text-muted-foreground">Manage system email templates with brand-specific variations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">Template Type *</Label>
                  <Select 
                    value={templateForm.template_type}
                    onValueChange={(value: any) => setTemplateForm(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="2fa">2FA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-subject">Subject Line *</Label>
                  <Input
                    id="template-subject"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject line"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-identity">Brand Identity</Label>
                  <Select 
                    value={templateForm.brand_identity || "system"}
                    onValueChange={(value) => setTemplateForm(prev => ({ 
                      ...prev, 
                      brand_identity: value === "system" ? null : value as BrandIdentity 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="easeworks">Easeworks</SelectItem>
                      <SelectItem value="easelearn">EaseLearn</SelectItem>
                      <SelectItem value="dual">Dual Brand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-body">Template Body *</Label>
                <Textarea
                  id="template-body"
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter email template HTML content"
                  rows={10}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={templateForm.is_active}
                  onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is-active">Active Template</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={isCreatingTemplate}
                >
                  {isCreatingTemplate ? 'Creating...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <BrandFilter
        selectedBrands={selectedBrands}
        onBrandChange={handleBrandFilterChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex gap-1">
                  <Badge className={getTemplateTypeColor(template.template_type)}>
                    {template.template_type}
                  </Badge>
                  {template.is_active && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{template.subject}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Category: {template.category}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No email templates found. Create your first template to get started.</p>
        </div>
      )}
    </div>
  );
};