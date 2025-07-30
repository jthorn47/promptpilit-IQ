import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Building2, MapPin, Users } from 'lucide-react';
import { DivisionsList } from './DivisionsList';
import { DepartmentsList } from './DepartmentsList';
import { LocationsList } from './LocationsList';
import { EmployeeAssignments } from './EmployeeAssignments';
import { CreateDivisionDialog } from './dialogs/CreateDivisionDialog';
import { CreateDepartmentDialog } from './dialogs/CreateDepartmentDialog';
import { CreateLocationDialog } from './dialogs/CreateLocationDialog';
import { useOrgStructure } from '@/hooks/useOrgStructure';

interface OrgStructureTabProps {
  companyId: string;
}

export const OrgStructureTab = ({ companyId }: OrgStructureTabProps) => {
  const [activeTab, setActiveTab] = useState('locations');
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [showCreateDivision, setShowCreateDivision] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);

  const {
    locations,
    divisions,
    departments,
    assignments,
    loading,
    createLocation,
    updateLocation,
    deleteLocation,
    createDivision,
    updateDivision,
    deleteDivision,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignEmployee,
    bulkAssignEmployees,
    refetch,
  } = useOrgStructure(companyId);

  const getCreateButtonProps = () => {
    switch (activeTab) {
      case 'locations':
        return {
          onClick: () => setShowCreateLocation(true),
          children: (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </>
          ),
        };
      case 'divisions':
        return {
          onClick: () => setShowCreateDivision(true),
          children: (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Division
            </>
          ),
          disabled: locations.length === 0,
        };
      case 'departments':
        return {
          onClick: () => setShowCreateDepartment(true),
          children: (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </>
          ),
          disabled: divisions.length === 0,
        };
      default:
        return null;
    }
  };

  const createButtonProps = getCreateButtonProps();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Structure
          </CardTitle>
          <CardDescription>
            Manage your company's hierarchical structure: Locations → Divisions → Departments.
            Use this to organize employees for payroll processing and billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="divisions">Divisions</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>
              
              {createButtonProps && (
                <Button {...createButtonProps} />
              )}
            </div>

            <TabsContent value="locations" className="mt-4">
              <LocationsList
                locations={locations}
                loading={loading}
                onUpdate={updateLocation}
                onDelete={deleteLocation}
                departments={departments}
                divisions={divisions}
              />
            </TabsContent>

            <TabsContent value="divisions" className="mt-4">
              <DivisionsList
                divisions={divisions}
                loading={loading}
                onUpdate={updateDivision}
                onDelete={deleteDivision}
                companyId={companyId}
              />
            </TabsContent>

            <TabsContent value="departments" className="mt-4">
              <DepartmentsList
                departments={departments}
                divisions={divisions}
                loading={loading}
                onUpdate={updateDepartment}
                onDelete={deleteDepartment}
              />
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <EmployeeAssignments
                assignments={assignments}
                locations={locations}
                divisions={divisions}
                departments={departments}
                loading={loading}
                onAssign={assignEmployee}
                onBulkAssign={bulkAssignEmployees}
                companyId={companyId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateLocationDialog
        open={showCreateLocation}
        onOpenChange={setShowCreateLocation}
        onSuccess={createLocation}
      />

      <CreateDivisionDialog
        open={showCreateDivision}
        onOpenChange={setShowCreateDivision}
        onSuccess={createDivision}
        locations={locations}
      />

      <CreateDepartmentDialog
        open={showCreateDepartment}
        onOpenChange={setShowCreateDepartment}
        onSuccess={createDepartment}
        divisions={divisions}
      />
    </div>
  );
};