import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { usePayGroups } from '@/hooks/useClientPayrollSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PayGroupManagerProps {
  clientId: string;
  onClose: () => void;
}

interface PayGroupFormData {
  name: string;
  description: string;
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  default_cost_center: string;
  next_pay_date?: string;
}

export const PayGroupManager: React.FC<PayGroupManagerProps> = ({ clientId, onClose }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [formData, setFormData] = useState<PayGroupFormData>({
    name: '',
    description: '',
    pay_frequency: 'bi_weekly', // Default value instead of empty string
    default_cost_center: ''
  });

  const {
    data: payGroups = [],
    isLoading,
    createPayGroup,
    updatePayGroup,
    deletePayGroup,
    isCreating,
    isUpdating,
    isDeleting
  } = usePayGroups(clientId);

  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'semi_monthly', label: 'Semi-Monthly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const payFrequencyLabels = {
    weekly: 'Weekly',
    bi_weekly: 'Bi-Weekly',
    semi_monthly: 'Semi-Monthly',
    monthly: 'Monthly'
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      pay_frequency: 'bi_weekly', // Default value
      default_cost_center: ''
    });
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      pay_frequency: group.pay_frequency || 'bi_weekly', // Default fallback
      default_cost_center: group.default_cost_center || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this pay group?')) {
      deletePayGroup(groupId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pay_frequency) return;

    console.log('Creating/updating pay group:', formData);
    
    if (editingGroup) {
      updatePayGroup({
        id: editingGroup.id,
        ...formData
      });
    } else {
      createPayGroup(formData);
    }
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading pay groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pay Group Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage pay groups for different pay frequencies
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="w-4 h-4 mr-2" />
          New Pay Group
        </Button>
      </div>

      {/* Pay Groups Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Next Pay Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pay groups found</p>
                  <Button variant="link" onClick={handleCreateGroup}>
                    Create your first pay group
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              payGroups.map((group) => {
                const employeeCount = typeof group.employee_count === 'number' 
                  ? group.employee_count 
                  : 0;

                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.description || '-'}
                    </TableCell>
                    <TableCell>
                      {group.pay_frequency ? (
                        <Badge variant="secondary">
                          {payFrequencyLabels[group.pay_frequency as keyof typeof payFrequencyLabels] || group.pay_frequency}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employeeCount} employees
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.default_cost_center || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.next_pay_date 
                        ? new Date(group.next_pay_date).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Pay Group' : 'Create Pay Group'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editingGroup ? 'Update pay group details and settings.' : 'Create a new pay group with specific frequency and settings.'}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Hourly Employees"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-frequency">Pay Frequency</Label>
              <Select 
                value={formData.pay_frequency} 
                onValueChange={(value) => setFormData({...formData, pay_frequency: value as PayGroupFormData['pay_frequency']})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {payFrequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-center">Default Cost Center</Label>
              <Input
                id="cost-center"
                value={formData.default_cost_center}
                onChange={(e) => setFormData({...formData, default_cost_center: e.target.value})}
                placeholder="e.g., Operations"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.name || !formData.pay_frequency || isCreating || isUpdating}
              >
                {editingGroup ? 'Update' : 'Create'} Pay Group
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};