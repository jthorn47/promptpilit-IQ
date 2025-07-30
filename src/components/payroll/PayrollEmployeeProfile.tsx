import React, { useState } from 'react';
import { ArrowLeft, User, DollarSign, FileText, CreditCard, Briefcase, StickyNote, TestTube, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePayrollEmployee } from '@/domains/payroll/hooks/usePayrollEmployeeManagement';
import { supabase } from '@/integrations/supabase/client';
import { PayrollEmployeePersonalTab } from './tabs/PayrollEmployeePersonalTab';
import { PayrollEmployeePayTab } from './tabs/PayrollEmployeePayTab';
import { PayrollEmployeeTaxTab } from './tabs/PayrollEmployeeTaxTab';
import { PayrollEmployeeDeductionsTab } from './tabs/PayrollEmployeeDeductionsTab';
import { PayrollEmployeeJobTab } from './tabs/PayrollEmployeeJobTab';
import { PayrollEmployeeDocumentsTab } from './tabs/PayrollEmployeeDocumentsTab';
import { PayrollEmployeeNotesTab } from './tabs/PayrollEmployeeNotesTab';

interface PayrollEmployeeProfileProps {
  employeeId: string;
  onBack: () => void;
}

export const PayrollEmployeeProfile: React.FC<PayrollEmployeeProfileProps> = ({
  employeeId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [companyName, setCompanyName] = useState<string>('');
  const { data: employee, isLoading } = usePayrollEmployee(employeeId);

  // Fetch company name when employee data is loaded
  React.useEffect(() => {
    if (employee?.company_id) {
      const fetchCompanyName = async () => {
        const { data } = await supabase
          .from('company_settings')
          .select('company_name')
          .eq('id', employee.company_id)
          .single();
        
        if (data) {
          setCompanyName(data.company_name);
        }
      };
      fetchCompanyName();
    }
  }, [employee?.company_id]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading employee profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Employee not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default">Active</Badge> : 
      <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                {employee.instructor_name}
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-muted-foreground">
                {employee.employee_id_display ? `ID: ${employee.employee_id_display}` : 'No employee ID'}
              </span>
              {getStatusBadge(employee.is_active)}
              <Badge variant="secondary">Instructor</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{employee.is_active ? 'Active' : 'Inactive'}</div>
            <div className="text-xs text-muted-foreground">
              Company: 
              {companyName ? (
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-1 text-xs text-primary hover:underline"
                  onClick={() => {
                    // Navigate to company profile - placeholder for future implementation
                    console.log('Navigate to company profile:', employee.company_id);
                  }}
                >
                  {companyName}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <span className="ml-1">Loading...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pay Information</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {employee.regular_hourly_rate && (
                <div className="text-sm">Regular: ${employee.regular_hourly_rate}/hr</div>
              )}
              {employee.standard_class_rate && (
                <div className="text-sm">Standard: ${employee.standard_class_rate}/class</div>
              )}
              {employee.saturday_class_rate && (
                <div className="text-sm">Saturday: ${employee.saturday_class_rate}/class</div>
              )}
              {!employee.regular_hourly_rate && !employee.standard_class_rate && (
                <div className="text-sm text-muted-foreground">No rates set</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{employee.location_id || 'Not assigned'}</div>
            <p className="text-xs text-muted-foreground">
              Work location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Type</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Instructor</div>
            <p className="text-xs text-muted-foreground">
              Fitness instructor role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pay" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Pay Rates
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="personal">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Instructor Name</label>
                      <p className="text-lg">{employee.instructor_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Employee ID</label>
                      <p className="text-lg">{employee.employee_id_display || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-lg">{employee.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <p className="text-lg">{employee.location_id || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pay">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Regular Hourly Rate</label>
                      <p className="text-lg">${employee.regular_hourly_rate || 'Not set'}/hr</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Standard Class Rate</label>
                      <p className="text-lg">${employee.standard_class_rate || 'Not set'}/class</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Saturday Class Rate</label>
                      <p className="text-lg">${employee.saturday_class_rate || 'Not set'}/class</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <div className="space-y-4">
                  <p className="text-muted-foreground">Notes and additional information will be available in future updates.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};