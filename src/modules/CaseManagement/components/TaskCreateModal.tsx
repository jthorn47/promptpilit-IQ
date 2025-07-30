import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTasks } from '@/modules/HaaLO.CRM/hooks/useTasks';
import { usePulseCases } from '../hooks/usePulseCases';

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedCaseId?: string;
}

interface User {
  id: string;
  email: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  preselectedCaseId
}) => {
  const { createTask } = useTasks();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    case_id: preselectedCaseId || '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    type: 'general',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchCases(); // Add this to fetch cases when modal opens
      if (preselectedCaseId) {
        setFormData(prev => ({ ...prev, case_id: preselectedCaseId }));
      }
    }
  }, [open, preselectedCaseId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email', { ascending: true });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      console.log('Fetched cases:', data);
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    // Make case optional for now since there might not be any cases
    // if (!formData.case_id) {
    //   toast.error('Please select a case for this task');
    //   return;
    // }
    
    if (!formData.assigned_to) {
      toast.error('Please assign the task to someone');
      return;
    }

    setLoading(true);
    
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) {
        throw new Error('User not authenticated');
      }

      await createTask({
        title: formData.title,
        description: formData.description,
        case_id: formData.case_id,
        assigned_to: formData.assigned_to,
        created_by: currentUser.data.user.id,
        priority: formData.priority,
        status: formData.status,
        type: formData.type,
        due_date: dueDate?.toISOString(),
        notes: formData.notes
      });

      toast.success('Task created successfully');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        case_id: preselectedCaseId || '',
        assigned_to: '',
        priority: 'medium',
        status: 'pending',
        type: 'general',
        notes: ''
      });
      setDueDate(undefined);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Linked Case */}
            <div>
              <Label htmlFor="case_id">Linked Case</Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, case_id: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={cases.length === 0 ? "No cases available - create a case first" : "Select a case..."} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {cases.length === 0 ? (
                    <SelectItem value="no-cases" disabled>No cases available</SelectItem>
                  ) : (
                    cases.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div>
              <Label htmlFor="assigned_to">Assigned To *</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="pending">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="md:col-span-2">
              <Label>Due Date</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowDatePicker(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
              </Button>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={(date) => {
              console.log('Date selected:', date);
              setDueDate(date);
              setShowDatePicker(false);
            }}
            initialFocus
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};