import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { Location, Department, Division } from '@/hooks/useOrgStructure';
import { EditLocationDialog } from './dialogs/EditLocationDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface LocationsListProps {
  locations: Location[];
  departments: Department[];
  divisions: Division[];
  loading: boolean;
  onUpdate: (id: string, updates: Partial<Location>) => Promise<Location>;
  onDelete: (id: string) => Promise<void>;
}

export const LocationsList = ({ locations, departments, divisions, loading, onUpdate, onDelete }: LocationsListProps) => {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const getDepartmentInfo = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    const division = department ? divisions.find(div => div.id === department.division_id) : null;
    return {
      departmentName: department?.name || 'Unknown Department',
      divisionName: division?.name || 'Unknown Division',
    };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading locations...</div>;
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium">No locations yet</h3>
        <p className="text-muted-foreground">Create your first location under a department.</p>
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
              <TableHead>Address</TableHead>
              <TableHead>Divisions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {locations.map((location) => {
            // Show divisions that belong to this location
            const relatedDivisions = divisions.filter(d => d.location_id === location.id);
            const divisionNames = relatedDivisions.map(d => d.name).join(', ') || 'No divisions';
            const fullAddress = [location.address_line1, location.address_line2, location.city, location.state, location.zip]
              .filter(Boolean)
              .join(', ');
            
            return (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>
                  {fullAddress || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>{divisionNames}</TableCell>
                <TableCell>
                  <Badge variant={location.is_active ? 'default' : 'secondary'}>
                    {location.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
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
                            <AlertDialogTitle>Deactivate Location</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to deactivate "{location.name}"? 
                              Employees assigned to this location will need to be reassigned.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(location.id)}>
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingLocation && (
        <EditLocationDialog
          open={!!editingLocation}
              onOpenChange={(open) => !open && setEditingLocation(null)}
              location={editingLocation}
              onSuccess={onUpdate}
        />
      )}
    </>
  );
};