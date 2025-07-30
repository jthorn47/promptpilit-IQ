import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, X } from 'lucide-react';

interface UserInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
  currentCompanyId?: string;
  currentClientId?: string;
}

interface AttributeField {
  key: string;
  value: string;
}

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'client_admin', label: 'Client Admin' },
  { value: 'learner', label: 'Learner' },
];

export const UserInvitationModal: React.FC<UserInvitationModalProps> = ({
  isOpen,
  onClose,
  onInvitationSent,
  currentCompanyId,
  currentClientId,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    company_id: currentCompanyId || '',
    client_id: currentClientId || '',
  });
  const [attributes, setAttributes] = useState<AttributeField[]>([]);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Email and role are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert attributes array to object
      const attributesObj = attributes.reduce((acc, attr) => {
        if (attr.key && attr.value) {
          acc[attr.key] = attr.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Get current user for invited_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be authenticated to send invitations');
      }

      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          company_id: formData.company_id || null,
          client_id: formData.client_id || null,
          attributes: attributesObj,
          invited_by: user.id,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: `Invitation sent to ${formData.email}`,
        });
        
        // Reset form
        setFormData({
          email: '',
          name: '',
          role: '',
          company_id: currentCompanyId || '',
          client_id: currentClientId || '',
        });
        setAttributes([]);
        
        onInvitationSent();
        onClose();
      } else {
        throw new Error(data?.error || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_id">Company ID</Label>
                <Input
                  id="company_id"
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  placeholder="Auto-filled from context"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  placeholder="Optional client assignment"
                />
              </div>
            </div>
          </div>

          {/* User Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">User Attributes (ABAC)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttribute}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {attributes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No custom attributes. Click "Add Attribute" to define user-specific access rules.
              </p>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      placeholder="Attribute key (e.g., department)"
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Attribute value (e.g., HR)"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttribute(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};