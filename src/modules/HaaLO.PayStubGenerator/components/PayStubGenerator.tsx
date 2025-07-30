import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Settings, 
  Play,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useGeneratePayStubs } from '../hooks/usePayStubs';
import { mockPayrollPeriods, mockEmployees } from '../services/MockPayrollPeriods';
import { PayStubGenerationRequest } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PayStubGenerator = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [generatePDF, setGeneratePDF] = useState(true);
  const [emailToEmployees, setEmailToEmployees] = useState(false);
  
  // TODO: Get actual company ID from auth context
  const companyId = 'current-company-id';
  
  const payrollPeriods = mockPayrollPeriods;
  const employees = mockEmployees;
  const generatePayStubs = useGeneratePayStubs();

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setSelectedEmployees(prev => 
      checked 
        ? [...prev, employeeId]
        : prev.filter(id => id !== employeeId)
    );
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    setSelectedEmployees(checked ? employees?.map(emp => emp.id) || [] : []);
  };

  const handleGenerate = () => {
    if (!selectedPeriod) return;

    const request: PayStubGenerationRequest = {
      payroll_period_id: selectedPeriod,
      employee_ids: selectedEmployees.length > 0 ? selectedEmployees : undefined,
      company_id: companyId,
      generate_pdf: generatePDF,
      email_to_employees: emailToEmployees
    };

    generatePayStubs.mutate(request, {
      onSuccess: () => {
        navigate('/admin/payroll/paystubs');
      }
    });
  };

  const selectedPeriodData = payrollPeriods?.find(p => p.id === selectedPeriod);
  const employeeCount = selectedEmployees.length > 0 ? selectedEmployees.length : employees?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/payroll/paystubs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Generate Pay Stubs</h1>
          <p className="text-muted-foreground">
            Create pay stubs for completed payroll periods
          </p>
        </div>
      </div>

      {/* Step 1: Select Payroll Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
            Select Payroll Period
          </CardTitle>
          <CardDescription>
            Choose a completed payroll period to generate pay stubs for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a payroll period..." />
            </SelectTrigger>
            <SelectContent>
              {payrollPeriods?.filter(period => period.status === 'completed')?.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {period.period_start || 'N/A'} to {period.period_end || 'N/A'}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {period.employee_count || 0} employees
                    </Badge>
                  </div>
                </SelectItem>
              )) || (
                <SelectItem value="" disabled>
                  No completed payroll periods available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {selectedPeriodData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pay Date:</span>
                  <div className="font-semibold">{selectedPeriodData.pay_date || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Gross Pay:</span>
                  <div className="font-semibold">${(selectedPeriodData.total_gross_pay || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Employee Count:</span>
                  <div className="font-semibold">{selectedPeriodData.employee_count || 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">{selectedPeriodData.status || 'Unknown'}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Employees */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              Select Employees
            </CardTitle>
            <CardDescription>
              Choose which employees to generate pay stubs for (leave empty to generate for all)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedEmployees.length === employees?.length}
                onCheckedChange={handleSelectAllEmployees}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select all employees ({employees?.length || 0})
              </label>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-4">
              {employees?.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked as boolean)}
                  />
                  <label htmlFor={employee.id} className="text-sm flex-1">
                    <div>{employee.instructor_name}</div>
                    <div className="text-muted-foreground text-xs">{employee.email || 'No email'}</div>
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {employee.pay_type || 'hourly'}
                  </Badge>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No employees found for this payroll period
                </div>
              )}
            </div>

            {selectedEmployees.length > 0 && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  {selectedEmployees.length} employees selected for pay stub generation
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generation Options */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              Generation Options
            </CardTitle>
            <CardDescription>
              Configure how pay stubs should be generated and delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generate-pdf"
                checked={generatePDF}
                onCheckedChange={(checked) => setGeneratePDF(checked === true)}
              />
              <label htmlFor="generate-pdf" className="text-sm font-medium">
                Generate PDF files
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-employees"
                checked={emailToEmployees}
                onCheckedChange={(checked) => setEmailToEmployees(checked === true)}
              />
              <label htmlFor="email-employees" className="text-sm font-medium">
                Email pay stubs to employees
              </label>
            </div>

            {emailToEmployees && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pay stubs will be automatically emailed to each employee's registered email address
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Summary */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payroll Period:</span>
                <span className="font-semibold">
                  {selectedPeriodData?.period_start || 'N/A'} to {selectedPeriodData?.period_end || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employees:</span>
                <span className="font-semibold">{employeeCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">PDF Generation:</span>
                <Badge variant={generatePDF ? "default" : "secondary"}>
                  {generatePDF ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email Delivery:</span>
                <Badge variant={emailToEmployees ? "default" : "secondary"}>
                  {emailToEmployees ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Link to="/admin/payroll/paystubs">
          <Button variant="outline">Cancel</Button>
        </Link>
        
        <Button
          onClick={handleGenerate}
          disabled={!selectedPeriod || generatePayStubs.isPending}
        >
          {generatePayStubs.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Generate Pay Stubs
            </div>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {generatePayStubs.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to generate pay stubs. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PayStubGenerator;