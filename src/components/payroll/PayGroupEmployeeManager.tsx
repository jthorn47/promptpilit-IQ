import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, X, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import {
  usePayGroupEmployeeAssignments,
  useCreateEmployeeAssignment,
  useRemoveEmployeeAssignment,
  useAvailableEmployees
} from '@/hooks/usePayGroupEmployees';

interface PayGroupEmployeeManagerProps {
  payGroupId: string;
  payGroupName: string;
  companyId: string;
}

export const PayGroupEmployeeManager: React.FC<PayGroupEmployeeManagerProps> = ({
  payGroupId,
  payGroupName,
  companyId
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: assignments = [], isLoading: assignmentsLoading } = usePayGroupEmployeeAssignments(payGroupId);
  const { data: availableEmployees = [] } = useAvailableEmployees(companyId);
  const createAssignment = useCreateEmployeeAssignment();
  const removeAssignment = useRemoveEmployeeAssignment();

  // Filter out employees already assigned to this pay group
  const assignedEmployeeIds = assignments.map(a => a.employee_id);
  const unassignedEmployees = availableEmployees.filter(emp => !assignedEmployeeIds.includes(emp.id));

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }

    const selectedEmployee = availableEmployees.find(emp => emp.id === selectedEmployeeId);
    if (!selectedEmployee) return;

    try {
      await createAssignment.mutateAsync({
        pay_group_id: payGroupId,
        employee_id: selectedEmployeeId,
        employee_name: selectedEmployee.name,
        employee_email: selectedEmployee.email,
        notes: notes || undefined
      });

      toast.success(`${selectedEmployee.name} added to ${payGroupName}`);
      setIsAddDialogOpen(false);
      setSelectedEmployeeId('');
      setNotes('');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee to pay group');
    }
  };

  const handleRemoveEmployee = async (assignmentId: string, employeeName: string) => {
    try {
      await removeAssignment.mutateAsync(assignmentId);
      toast.success(`${employeeName} removed from ${payGroupName}`);
    } catch (error) {
      console.error('Error removing employee:', error);
      toast.error('Failed to remove employee from pay group');
    }
  };

  if (assignmentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employees ({payGroupName})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading employees...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employees ({assignments.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee to {payGroupName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {unassignedEmployees.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      All employees are already assigned to pay groups
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special notes about this assignment..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEmployee}
                    disabled={!selectedEmployeeId || createAssignment.isPending}
                  >
                    {createAssignment.isPending ? 'Adding...' : 'Add Employee'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No employees assigned to this pay group yet.</p>
            <p className="text-sm">Click "Add Employee" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{assignment.employee_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  {assignment.employee_email && (
                    <p className="text-sm text-muted-foreground">
                      {assignment.employee_email}
                    </p>
                  )}
                  {assignment.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {assignment.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmployee(assignment.id, assignment.employee_name)}
                  disabled={removeAssignment.isPending}
                  className="text-destructive hover:text-destructive/80"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};