import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSystemEmailTemplates } from '@/hooks/useSystemEmailTemplates';
import { BrandIdentity } from '@/types/brand';
import { 
  Mail, 
  Plus, 
  Edit, 
  Eye, 
  Shield, 
  UserCheck, 
  Key, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { useTestEmail } from '@/hooks/useTestEmail';

export interface SystemEmailTemplate {
  id: string;
  name: string;
  template_type: 'authentication' | 'security' | 'notification' | 'system' | '2fa';
  category: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
  brand_identity: BrandIdentity | null; // Added brand identity
  created_at: string;
  updated_at: string;
  usage_count?: number;
  last_used?: string;
}

const TEMPLATE_CATEGORIES = {
  'authentication': {
    label: 'Authentication',
    icon: UserCheck,
    color: 'bg-blue-500',
    description: 'Login, signup, email confirmation templates'
  },
  'security': {
    label: 'Security',
    icon: Shield,
    color: 'bg-red-500',
    description: 'Security alerts, suspicious activity notifications'
  },
  '2fa': {
    label: 'Two-Factor Auth',
    icon: Key,
    color: 'bg-purple-500',
    description: '2FA setup, activation, backup codes'
  },
  'notification': {
    label: 'System Notifications',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    description: 'System maintenance, updates, alerts'
  },
  'system': {
    label: 'System Operations',
    icon: RefreshCw,
    color: 'bg-green-500',
    description: 'Password resets, account changes, admin actions'
  }
};

export const SystemEmailTemplates: React.FC = () => {
  const { toast } = useToast();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useSystemEmailTemplates();
  
  console.log('🎯 SystemEmailTemplates rendered - templates:', templates.length);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SystemEmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SystemEmailTemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    template_type: 'authentication' | 'security' | 'notification' | 'system' | '2fa';
    category: string;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
    is_default: boolean;
    brand_identity: BrandIdentity | null;
  }>({
    name: '',
    template_type: 'authentication',
    category: '',
    subject: '',
    body: '',
    variables: [],
    is_active: true,
    is_default: false,
    brand_identity: 'easeworks'
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.template_type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTemplate = async () => {
    try {
      await createTemplate(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Template Created",
        description: "System email template created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await updateTemplate(selectedTemplate.id, formData);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      toast({
        title: "Template Updated",
        description: "System email template updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      template_type: 'authentication',
      category: '',
      subject: '',
      body: '',
      variables: [],
      is_active: true,
      is_default: false,
      brand_identity: 'easeworks'
    });
  };

  const openEditDialog = (template: SystemEmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      is_active: template.is_active,
      is_default: template.is_default,
      brand_identity: template.brand_identity || 'easeworks'
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryInfo = (type: string) => {
    return TEMPLATE_CATEGORIES[type as keyof typeof TEMPLATE_CATEGORIES] || {
      label: type,
      icon: Mail,
      color: 'bg-gray-500',
      description: 'Custom template'
    };
  };

  const getUsageStats = (template: SystemEmailTemplate) => {
    return {
      count: template.usage_count || 0,
      lastUsed: template.last_used ? new Date(template.last_used).toLocaleDateString() : 'Never'
    };
  };

  return (
    <StandardPageLayout
      title="System Email Templates"
      subtitle="Manage email templates for authentication, security, and system notifications"
      badge="System"
    >
      <div className="space-y-6">
        {/* Category Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => {
            const categoryCount = templates.filter(t => t.template_type === key).length;
            const Icon = category.icon;
            
            return (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${category.color}`} />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <div className="text-2xl font-bold">{categoryCount}</div>
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create System Email Template</DialogTitle>
                <DialogDescription>
                  Create a new email template for system communications
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., 2FA Activation Email"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Template Type</Label>
                    <Select 
                      value={formData.template_type} 
                      onValueChange={(value: any) => setFormData({ ...formData, template_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>{category.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Two-Factor Authentication"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Your Two-Factor Authentication Is Now Active"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Email Body (HTML)</Label>
                  <Textarea
                    id="body"
                    placeholder="Enter HTML email template with {{variable}} placeholders"
                    className="min-h-[200px] font-mono text-sm"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                    />
                    <Label htmlFor="default">Default Template</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Email Templates</CardTitle>
            <CardDescription>
              {selectedCategory === 'all' 
                ? `Showing all ${filteredTemplates.length} templates` 
                : `Showing ${filteredTemplates.length} ${getCategoryInfo(selectedCategory).label.toLowerCase()} templates`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading templates...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No templates found. Create your first system email template.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => {
                    const categoryInfo = getCategoryInfo(template.template_type);
                    const usage = getUsageStats(template);
                    const Icon = categoryInfo.icon;
                    
                    return (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{categoryInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={template.subject}>
                            {template.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {template.is_default && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{usage.count} times</div>
                            <div className="text-muted-foreground">Last: {usage.lastUsed}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(template.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(template)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('Preview clicked for template:', template);
                                setPreviewTemplate(template);
                                setIsPreviewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System Email Template</DialogTitle>
            <DialogDescription>
              Modify the system email template settings and content
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Template Type</Label>
                <Select 
                  value={formData.template_type} 
                  onValueChange={(value: any) => setFormData({ ...formData, template_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Email Subject</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-body">Email Body (HTML)</Label>
              <Textarea
                id="edit-body"
                className="min-h-[200px] font-mono text-sm"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="edit-default">Default Template</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>Update Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <EmailTemplatePreview
        template={previewTemplate}
        isOpen={isPreviewDialogOpen}
        onClose={() => {
          setIsPreviewDialogOpen(false);
          setPreviewTemplate(null);
        }}
      />
    </StandardPageLayout>
  );
};

export default SystemEmailTemplates;