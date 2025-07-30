import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, UserCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { EmployeeProfileTab } from './tabs/EmployeeProfileTab';
import { EmployeePayrollTab } from './tabs/EmployeePayrollTab';
import { EmployeeOnboardingTab } from './tabs/EmployeeOnboardingTab';
import { EmployeeComplianceTab } from './tabs/EmployeeComplianceTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { useToast } from '@/hooks/use-toast';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeDetailViewProps {
  employee: Employee;
  onBack: () => void;
  onSave?: (updatedEmployee: Partial<Employee>) => void;
}

export const EmployeeDetailView = ({ employee, onBack, onSave }: EmployeeDetailViewProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Implementation for saving employee data
      toast({
        title: "Success",
        description: "Employee information updated successfully",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employee List
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-muted-foreground">{employee.position || 'No position assigned'}</p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <EmployeeProfileTab 
            employee={employee}
            onChange={() => setHasChanges(true)}
          />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <EmployeePayrollTab 
            employee={employee}
            onChange={() => setHasChanges(true)}
          />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <EmployeeOnboardingTab 
            employee={employee}
            onChange={() => setHasChanges(true)}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <EmployeeComplianceTab 
            employee={employee}
            onChange={() => setHasChanges(true)}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <EmployeeDocumentsTab 
            employee={employee}
            onChange={() => setHasChanges(true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};