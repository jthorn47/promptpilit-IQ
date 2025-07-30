import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleTextareaField, AccessibleSelectField } from '@/components/AccessibleForm';
import { Calendar, Play, Check, AlertCircle, Users, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface PayrollTestingGoLiveProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const PayrollTestingGoLive: React.FC<PayrollTestingGoLiveProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [testPayroll, setTestPayroll] = useState({
    test_date: '',
    test_type: 'sample',
    employees: [
      { name: 'John Smith', hours: 40, rate: 25.00, gross: 1000.00, taxes: 250.00, net: 750.00 },
      { name: 'Jane Doe', hours: 35, rate: 30.00, gross: 1050.00, taxes: 262.50, net: 787.50 }
    ],
    client_approved: false,
    manager_approved: false,
    client_notes: '',
    manager_notes: ''
  });
  
  const [parallelTest, setParallelTest] = useState({
    enabled: false,
    previous_provider: '',
    comparison_notes: ''
  });

  const [goLiveSettings, setGoLiveSettings] = useState({
    go_live_date: '',
    payroll_contacts: [],
    transition_notes: ''
  });

  const testTypeOptions = [
    { value: 'sample', label: 'Sample Payroll Test' },
    { value: 'parallel', label: 'Parallel Test Run' }
  ];

  const calculateProgress = () => {
    let progress = 0;
    
    // Test payroll run: 40%
    if (testPayroll.test_date) progress += 20;
    if (testPayroll.client_approved) progress += 20;
    
    // Manager approval: 30%
    if (testPayroll.manager_approved) progress += 30;
    
    // Go-live date set: 30%
    if (goLiveSettings.go_live_date) progress += 30;
    
    return progress;
  };

  const runTestPayroll = () => {
    if (!testPayroll.test_date) {
      toast({
        title: "Missing Test Date",
        description: "Please select a test date first.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Running Test Payroll",
      description: "Processing test payroll with sample employees..."
    });

    // Simulate test payroll processing
    setTimeout(() => {
      toast({
        title: "Test Payroll Complete",
        description: "Test payroll has been generated and is ready for review."
      });
      onProgressUpdate(calculateProgress());
    }, 3000);
  };

  const approveAsClient = () => {
    setTestPayroll({ ...testPayroll, client_approved: true });
    onProgressUpdate(calculateProgress());
    
    toast({
      title: "Client Approval Recorded",
      description: "Test payroll approved by client."
    });
  };

  const approveAsManager = () => {
    setTestPayroll({ ...testPayroll, manager_approved: true });
    onProgressUpdate(calculateProgress());
    
    toast({
      title: "Manager Approval Recorded",
      description: "Test payroll approved by onboarding manager."
    });
  };

  return (
    <div className="space-y-6">
      {/* Test Payroll Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Run Test Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Test Date"
              name="test_date"
              type="date"
              value={testPayroll.test_date}
              onChange={(value) => {
                setTestPayroll({ ...testPayroll, test_date: value });
                onProgressUpdate(calculateProgress());
              }}
              required
            />
            
            <AccessibleSelectField
              label="Test Type"
              name="test_type"
              value={testPayroll.test_type}
              onChange={(value) => setTestPayroll({ ...testPayroll, test_type: value })}
              options={testTypeOptions}
            />
          </div>

          <Button 
            onClick={runTestPayroll}
            disabled={!testPayroll.test_date}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Test Payroll
          </Button>
        </CardContent>
      </Card>

      {/* Sample Employees for Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Payroll Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Taxes</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testPayroll.employees.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.hours}</TableCell>
                  <TableCell>${employee.rate.toFixed(2)}</TableCell>
                  <TableCell>${employee.gross.toFixed(2)}</TableCell>
                  <TableCell>${employee.taxes.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${employee.net.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold">$2,050.00</p>
              <p className="text-sm text-muted-foreground">Total Gross</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">$512.50</p>
              <p className="text-sm text-muted-foreground">Total Taxes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">$1,537.50</p>
              <p className="text-sm text-muted-foreground">Total Net</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Review and Approval */}
      <Card>
        <CardHeader>
          <CardTitle>Client Review & Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleTextareaField
            label="Client Notes"
            name="client_notes"
            value={testPayroll.client_notes}
            onChange={(value) => setTestPayroll({ ...testPayroll, client_notes: value })}
            placeholder="Add any notes or questions about the test payroll..."
            rows={3}
          />

          {userRole === 'client_admin' && !testPayroll.client_approved && (
            <Button onClick={approveAsClient} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Approve Test Payroll
            </Button>
          )}

          {testPayroll.client_approved && (
            <div className="flex items-center space-x-2 text-green-600 p-3 bg-green-50 rounded-lg">
              <Check className="h-5 w-5" />
              <span className="font-medium">Approved by Client</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Parallel Test */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Parallel Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="parallel_test"
              checked={parallelTest.enabled}
              onChange={(e) => setParallelTest({ ...parallelTest, enabled: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="parallel_test" className="text-sm font-medium">
              Run parallel test with previous payroll provider
            </label>
          </div>

          {parallelTest.enabled && (
            <div className="space-y-4">
              <AccessibleFormField
                label="Previous Payroll Provider"
                name="previous_provider"
                value={parallelTest.previous_provider}
                onChange={(value) => setParallelTest({ ...parallelTest, previous_provider: value })}
                placeholder="e.g., ADP, Paychex, etc."
              />
              
              <AccessibleTextareaField
                label="Comparison Notes"
                name="comparison_notes"
                value={parallelTest.comparison_notes}
                onChange={(value) => setParallelTest({ ...parallelTest, comparison_notes: value })}
                placeholder="Notes about differences between providers..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager Approval */}
      {userRole === 'onboarding_manager' && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Manager Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AccessibleTextareaField
              label="Manager Notes"
              name="manager_notes"
              value={testPayroll.manager_notes}
              onChange={(value) => setTestPayroll({ ...testPayroll, manager_notes: value })}
              placeholder="Add any notes about the test payroll results..."
              rows={3}
            />

            {testPayroll.client_approved && !testPayroll.manager_approved && (
              <Button onClick={approveAsManager} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Approve Test Payroll
              </Button>
            )}

            {testPayroll.manager_approved && (
              <div className="flex items-center space-x-2 text-green-600 p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-medium">Approved by Onboarding Manager</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Go-Live Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Set Go-Live Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleFormField
            label="Go-Live Date"
            name="go_live_date"
            type="date"
            value={goLiveSettings.go_live_date}
            onChange={(value) => {
              setGoLiveSettings({ ...goLiveSettings, go_live_date: value });
              onProgressUpdate(calculateProgress());
            }}
            description="Date when live payroll processing will begin"
            required
          />

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800">Go-Live Considerations</h5>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Ensure the date aligns with your current payroll schedule</li>
                  <li>• Allow time for final system testing and training</li>
                  <li>• Consider running parallel for first live payroll</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ongoing Payroll Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Ongoing Payroll Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Designate who will be responsible for ongoing payroll operations after go-live.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Primary Payroll Contact</p>
                <p className="text-sm text-muted-foreground">Main person for payroll questions and approvals</p>
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Backup Contact</p>
                <p className="text-sm text-muted-foreground">Secondary contact when primary is unavailable</p>
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Time Approval Manager</p>
                <p className="text-sm text-muted-foreground">Person responsible for timesheet approvals</p>
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transition Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Transition Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <AccessibleTextareaField
            label="Implementation Notes"
            name="transition_notes"
            value={goLiveSettings.transition_notes}
            onChange={(value) => setGoLiveSettings({ ...goLiveSettings, transition_notes: value })}
            placeholder="Any special notes about the transition to live payroll processing..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Final Status */}
      {testPayroll.client_approved && testPayroll.manager_approved && goLiveSettings.go_live_date && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Onboarding Complete!
              </h3>
              <p className="text-green-700 mb-4">
                All sections have been completed and approved. You're ready for go-live on {' '}
                {new Date(goLiveSettings.go_live_date).toLocaleDateString()}.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Summary Report
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Go-Live Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};