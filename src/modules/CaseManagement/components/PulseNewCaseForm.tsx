import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePulseCase } from '../hooks/usePulseCase';
import { CreateCaseRequest, CaseType, CasePriority, CaseVisibility, CaseSource } from '../types';

export const PulseNewCaseForm = () => {
  console.log('🔥 PulseNewCaseForm component is rendering');
  const navigate = useNavigate();
  const location = useLocation();
  const { createCase } = usePulseCase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [formData, setFormData] = useState<Partial<CreateCaseRequest>>({
    title: '',
    description: '',
    type: 'general_support',
    priority: 'medium',
    source: 'manual',
    visibility: 'internal',
    client_viewable: false,
    tags: [],
    estimated_hours: 0,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Handle template pre-population
  useEffect(() => {
    if (location.state?.selectedTemplate) {
      const template = location.state.selectedTemplate;
      setSelectedTemplate(template);
      
      // Pre-populate form with template data
      setFormData(prev => ({
        ...prev,
        title: template.name,
        description: template.description,
        type: template.category.toLowerCase(),
        tags: [template.category],
        estimated_hours: template.estimated_duration_days * 8 // Convert days to hours
      }));
      
      setTags([template.category]);
    }
  }, [location.state]);

  const updateField = useCallback(<K extends keyof CreateCaseRequest>(
    field: K,
    value: CreateCaseRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addTag = useCallback(() => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      updateField('tags', newTags);
      setCurrentTag('');
    }
  }, [currentTag, tags, updateField]);

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    updateField('tags', newTags);
  }, [tags, updateField]);

  const handleSubmit = useCallback(async (isDraft = false) => {
    if (!formData.title?.trim()) {
      toast.error('Case title is required');
      return;
    }

    if (!formData.description?.trim()) {
      toast.error('Case description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const caseData: CreateCaseRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type as CaseType,
        priority: formData.priority as CasePriority,
        status: isDraft ? 'waiting' : 'open',
        source: formData.source as CaseSource,
        visibility: formData.visibility as CaseVisibility,
        client_viewable: formData.client_viewable || false,
        tags: formData.tags || [],
        estimated_hours: formData.estimated_hours || 0,
        assigned_to: formData.assigned_to,
        related_company_id: formData.related_company_id,
        related_contact_email: formData.related_contact_email,
        external_reference: formData.external_reference,
      };

      await createCase(caseData);
      toast.success(`Case ${isDraft ? 'saved as draft' : 'created'} successfully`);
      navigate('/pulse/cases');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createCase, navigate]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/pulse/cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Case</h1>
            <p className="text-muted-foreground">Add a new case to the system</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="auto-save">Auto-save</Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Create Case
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Case Details</TabsTrigger>
          <TabsTrigger value="assignment">Assignment & Routing</TabsTrigger>
          <TabsTrigger value="visibility">Visibility & Access</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details for this case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title for the case..."
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Case Type</Label>
                  <Select value={formData.type} onValueChange={(value) => updateField('type', value as CaseType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="general_support">General Support</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateField('priority', value as CasePriority)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the issue or request..."
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => updateField('estimated_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="external_reference">External Reference</Label>
                  <Input
                    id="external_reference"
                    placeholder="Ticket #, Email ID, etc."
                    value={formData.external_reference || ''}
                    onChange={(e) => updateField('external_reference', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="related_contact_email">Contact Email</Label>
                  <Input
                    id="related_contact_email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.related_contact_email || ''}
                    onChange={(e) => updateField('related_contact_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => updateField('source', value as CaseSource)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="web_form">Web Form</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag and press Enter..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>
                Configure who should handle this case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Input
                    id="assigned_to"
                    placeholder="Enter assignee email or ID"
                    value={formData.assigned_to || ''}
                    onChange={(e) => updateField('assigned_to', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="assigned_team">Team</Label>
                  <Input
                    id="assigned_team"
                    placeholder="Team or department"
                    value={formData.assigned_team || ''}
                    onChange={(e) => updateField('assigned_team', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Access Control</CardTitle>
              <CardDescription>
                Control who can view and access this case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility Level</Label>
                  <Select value={formData.visibility} onValueChange={(value) => updateField('visibility', value as CaseVisibility)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="client_viewable">Client Viewable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="client_viewable"
                    checked={formData.client_viewable}
                    onCheckedChange={(checked) => updateField('client_viewable', checked)}
                  />
                  <Label htmlFor="client_viewable">Allow client to view this case</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};