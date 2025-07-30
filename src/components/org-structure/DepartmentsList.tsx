import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Building } from 'lucide-react';
import { Department, Division } from '@/hooks/useOrgStructure';
import { EditDepartmentDialog } from './dialogs/EditDepartmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DepartmentsListProps {
  departments: Department[];
  divisions: Division[];
  loading: boolean;
  onUpdate: (id: string, updates: Partial<Department>) => Promise<Department>;
  onDelete: (id: string) => Promise<void>;
}

export const DepartmentsList = ({ departments, divisions, loading, onUpdate, onDelete }: DepartmentsListProps) => {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const getDivisionName = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || 'Unknown Division';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading departments...</div>;
  }

  if (departments.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <Building className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium">No departments yet</h3>
        <p className="text-muted-foreground">Create your first department under a division.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>
                  {department.code ? (
                    <Badge variant="outline">{department.code}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{getDivisionName(department.division_id)}</TableCell>
                <TableCell>
                  <Badge variant={department.is_active ? 'default' : 'secondary'}>
                    {department.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDepartment(department)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate Department</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate "{department.name}"? This will also deactivate
                            all locations under this department. Employees assigned to this department will need to be reassigned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(department.id)}>
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingDepartment && (
        <EditDepartmentDialog
          open={!!editingDepartment}
          onOpenChange={(open) => !open && setEditingDepartment(null)}
          department={editingDepartment}
          divisions={divisions}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};