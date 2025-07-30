import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { X, Plus, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePulseCases } from '../hooks/usePulseCases';
import { useRetainerAwareCases } from '@/hooks/useRetainerAwareCases';
import { supabase } from '@/integrations/supabase/client';
import { ClientSelector } from '@/components/ClientSelector';
import { EmployeeMultiSelect } from '@/components/EmployeeMultiSelect';
import { 
  Case, 
  CreateCaseRequest, 
  UpdateCaseRequest,
  STANDARD_CASE_TAGS,
  CaseType,
  CasePriority,
  CaseStatus,
  CaseSource,
  CaseVisibility
} from '../types';
import { toast } from 'sonner';

interface PulseCaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  case_?: Case | null;
  onSuccess?: () => void;
}

interface CompanyOption {
  id: string;
  company_name: string;
}

interface UserOption {
  id: string;
  display_name?: string;
  email?: string;
}

export const PulseCaseForm = ({ open, onOpenChange, case_, onSuccess }: PulseCaseFormProps) => {
  const { createCase, updateCase } = usePulseCases();
  const { 
    selectedClientId, 
    setSelectedClientId, 
    retainerInfo, 
    getRetainerStatus, 
    getRetainerStatusMessage,
    createRetainerAwareCase 
  } = useRetainerAwareCases();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      internal_notes: '',
      type: 'general_support' as CaseType,
      priority: 'medium' as CasePriority,
      status: 'open' as CaseStatus,
      source: 'manual' as CaseSource,
      visibility: 'internal' as CaseVisibility,
      assigned_to: '',
      assigned_team: '',
      related_company_id: '',
      related_contact_email: '',
      client_viewable: false,
      estimated_hours: 0
    }
  });

  useEffect(() => {
    if (open) {
      fetchCompanies();
      fetchUsers();
      
      if (case_) {
        // Populate form for editing
        setValue('title', case_.title);
        setValue('description', case_.description);
        setValue('internal_notes', case_.internal_notes || '');
        setValue('type', case_.type);
        setValue('priority', case_.priority);
        setValue('status', case_.status);
        setValue('source', case_.source);
        setValue('visibility', case_.visibility);
        setValue('assigned_to', case_.assigned_to || '');
        setValue('assigned_team', case_.assigned_team || '');
        setValue('related_company_id', case_.related_company_id || '');
        setValue('related_contact_email', case_.related_contact_email || '');
        setValue('client_viewable', case_.client_viewable);
        setValue('estimated_hours', case_.estimated_hours || 0);
        setSelectedTags(case_.tags || []);
        setSelectedClientId(case_.client_id || '');
        setSelectedEmployeeIds(case_.related_employees || []);
      } else {
        reset();
        setSelectedTags([]);
        setSelectedClientId('');
        setSelectedEmployeeIds([]);
      }
    }
  }, [open, case_, setValue, reset]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .order('company_name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch from profiles or a users view if available
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .limit(50);
      
      if (error) throw error;
      // For now, simplified user list - in real implementation would join with profiles
      setUsers(data?.map(u => ({ id: u.user_id, email: u.user_id })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const caseData = {
        ...data,
        tags: selectedTags,
        estimated_hours: Number(data.estimated_hours) || 0,
        client_id: selectedClientId || null,
        related_employees: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : null
      };

      if (case_) {
        await updateCase(case_.id, caseData as UpdateCaseRequest);
        toast.success('Case updated successfully');
      } else {
        // Use retainer-aware case creation if client has retainer
        if (retainerInfo) {
          await createRetainerAwareCase(caseData as CreateCaseRequest);
        } else {
          await createCase(caseData as CreateCaseRequest);
        }
        toast.success('Case created successfully');
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error('Failed to save case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{case_ ? 'Edit Case' : 'Create New Case'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  className={errors.description ? 'border-destructive' : ''}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Case Type</Label>
                <Select value={watch('type')} onValueChange={(value) => setValue('type', value as CaseType)}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value as CasePriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value as CaseStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={watch('source')} onValueChange={(value) => setValue('source', value as CaseSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="web_form">Web Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Client & Employees */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Client & Related Employees</h3>
            <div className="space-y-4">
              <div>
                <Label>Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Retainer Status Alert */}
              {retainerInfo && (
                <Alert variant={getRetainerStatus() === 'critical' ? 'destructive' : getRetainerStatus() === 'warning' ? 'default' : 'default'}>
                  <div className="flex items-center gap-2">
                    {getRetainerStatus() === 'critical' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : getRetainerStatus() === 'warning' ? (
                      <Info className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>{retainerInfo.tier_name} Retainer:</strong> {retainerInfo.hours_used}/{retainerInfo.retainer_hours} hours used ({retainerInfo.usage_percentage.toFixed(1)}%)</p>
                        <p>{getRetainerStatusMessage()}</p>
                        {retainerInfo.consultant_name && (
                          <p><strong>Assigned Consultant:</strong> {retainerInfo.consultant_name}</p>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <EmployeeMultiSelect
                selectedEmployeeIds={selectedEmployeeIds}
                onEmployeesChange={setSelectedEmployeeIds}
                clientId={selectedClientId}
              />
            </div>
          </Card>

          {/* Assignment & Contact */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Assignment & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="related_contact_email">Contact Email</Label>
                <Input
                  id="related_contact_email"
                  type="email"
                  {...register('related_contact_email')}
                  placeholder="Case contact email"
                />
              </div>

              <div>
                <Label htmlFor="assigned_to">Assigned User</Label>
                <Select value={watch('assigned_to')} onValueChange={(value) => setValue('assigned_to', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name || user.email || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_team">Assigned Team</Label>
                <Input
                  id="assigned_team"
                  {...register('assigned_team')}
                  placeholder="Team name"
                />
              </div>

              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  step="0.5"
                  {...register('estimated_hours')}
                />
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Tags</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {STANDARD_CASE_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        removeTag(tag);
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Visibility & Access */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Visibility & Access</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={watch('visibility')} onValueChange={(value) => setValue('visibility', value as CaseVisibility)}>
                  <SelectTrigger>
                    <SelectValue />
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
                  checked={watch('client_viewable')}
                  onCheckedChange={(checked) => setValue('client_viewable', checked)}
                />
                <Label htmlFor="client_viewable">Make case viewable to client</Label>
              </div>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Internal Notes</h3>
            <Textarea
              id="internal_notes"
              {...register('internal_notes')}
              placeholder="Add internal notes (not visible to clients)"
              rows={4}
            />
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : case_ ? 'Update Case' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};