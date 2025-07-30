import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeMultiSelect } from '@/components/EmployeeMultiSelect';
import { useCases, Case } from '@/hooks/useCases';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  case_?: Case;
  companyId?: string;
}

interface Company {
  id: string;
  company_name: string;
}

interface User {
  id: string;
  email: string;
}

export const CaseFormDialog = ({ open, onOpenChange, case_, companyId }: CaseFormDialogProps) => {
  const { createCase, updateCase } = useCases();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'general_support' as any,
    priority: 'medium' as any,
    status: 'open' as any,
    assigned_to: '',
    related_company_id: companyId || '',
    related_contact_email: '',
    source: 'manual' as any,
    description: '',
    internal_notes: '',
    estimated_hours: '',
  });

  useEffect(() => {
    if (case_) {
      setFormData({
        title: case_.title,
        type: case_.type,
        priority: case_.priority,
        status: case_.status,
        assigned_to: case_.assigned_to || '',
        related_company_id: case_.related_company_id || '',
        related_contact_email: case_.related_contact_email || '',
        source: case_.source,
        description: case_.description,
        internal_notes: case_.internal_notes || '',
        estimated_hours: case_.estimated_hours?.toString() || '',
      });
      setSelectedClientId(case_.client_id || '');
      setSelectedEmployeeIds(case_.related_employees || []);
    } else if (companyId) {
      setFormData(prev => ({ ...prev, related_company_id: companyId }));
    }
  }, [case_, companyId]);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchUsers();
    }
  }, [open]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, company_name')
      .order('company_name');
    
    if (data) setClients(data);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, email')
        .not('email', 'is', null)
        .order('email');
      
      if (data) {
        setUsers(data.map(profile => ({ 
          id: profile.user_id, 
          email: profile.email || 'Unknown'
        })).filter(u => u.email !== 'Unknown'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to current user if available
      if (user) {
        setUsers([{ id: user.id, email: user.email || 'Current User' }]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
        related_company_id: formData.related_company_id || undefined,
        assigned_to: formData.assigned_to || undefined,
        related_contact_email: formData.related_contact_email || undefined,
        internal_notes: formData.internal_notes || undefined,
        client_id: selectedClientId || undefined,
        related_employees: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
        tags: [], // Default empty tags array
        visibility: 'internal' as const, // Default to internal visibility
        client_viewable: false, // Default to not client viewable
      };

      if (case_) {
        await updateCase(case_.id, submitData);
      } else {
        await createCase(submitData);
      }
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        type: 'general_support',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        related_company_id: companyId || '',
        related_contact_email: '',
        source: 'manual',
        description: '',
        internal_notes: '',
        estimated_hours: '',
      });
      setSelectedClientId('');
      setSelectedEmployeeIds([]);
    } catch (error) {
      console.error('Error saving case:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{case_ ? 'Edit Case' : 'Create New Case'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="general_support">General Support</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, status: value }))
              }>
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
              <Select value={formData.source} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, source: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="web_form">Web Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="client">Related Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <EmployeeMultiSelect
              selectedEmployeeIds={selectedEmployeeIds}
              onEmployeesChange={setSelectedEmployeeIds}
              clientId={selectedClientId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.related_contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, related_contact_email: e.target.value }))}
                placeholder="client@company.com"
              />
            </div>

            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.25"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                placeholder="2.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the issue or request"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea
              id="internal_notes"
              value={formData.internal_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
              placeholder="Internal notes (not visible to client)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (case_ ? 'Update Case' : 'Create Case')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};