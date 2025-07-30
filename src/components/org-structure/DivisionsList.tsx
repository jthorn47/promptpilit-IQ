import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Building2, CreditCard, Calendar } from 'lucide-react';
import { Division } from '@/hooks/useOrgStructure';
import { EditDivisionDialog } from './dialogs/EditDivisionDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DivisionsListProps {
  divisions: Division[];
  loading: boolean;
  onUpdate: (id: string, updates: Partial<Division>) => Promise<Division>;
  onDelete: (id: string) => Promise<void>;
  companyId: string;
}

export const DivisionsList = ({ divisions, loading, onUpdate, onDelete, companyId }: DivisionsListProps) => {
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading divisions...</div>;
  }

  if (divisions.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium">No divisions yet</h3>
        <p className="text-muted-foreground">Create your first division to get started with organization structure.</p>
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
              <TableHead>Bank Account</TableHead>
              <TableHead>Payroll Schedule</TableHead>
              <TableHead>Invoice Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divisions.map((division) => (
              <TableRow key={division.id}>
                <TableCell className="font-medium">{division.name}</TableCell>
                <TableCell>
                  {division.code ? (
                    <Badge variant="outline">{division.code}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {division.default_bank_account_id ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Configured</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {division.payroll_schedule_id ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Configured</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {division.invoice_template_id ? (
                    <Badge variant="secondary">Custom</Badge>
                  ) : (
                    <span className="text-muted-foreground">Default</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={division.is_active ? 'default' : 'secondary'}>
                    {division.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDivision(division)}
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
                          <AlertDialogTitle>Deactivate Division</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate "{division.name}"? This will also deactivate
                            all departments and locations under this division. Employees assigned to this
                            division will need to be reassigned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(division.id)}>
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

      {editingDivision && (
        <EditDivisionDialog
          open={!!editingDivision}
          onOpenChange={(open) => !open && setEditingDivision(null)}
          division={editingDivision}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};