/**
 * Batch Creator Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  Save,
  Play,
  ArrowRight
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  status: 'included' | 'excluded' | 'warning';
}

const BatchCreator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [batchConfig, setBatchConfig] = useState({
    name: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: '',
    batchType: 'regular'
  });

  // Mock employee data
  const employees: Employee[] = [
    {
      id: '1',
      name: 'John Smith',
      department: 'Engineering',
      regularHours: 40,
      overtimeHours: 5,
      grossPay: 3250.00,
      status: 'included'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'Marketing',
      regularHours: 40,
      overtimeHours: 0,
      grossPay: 2800.00,
      status: 'included'
    },
    {
      id: '3',
      name: 'Mike Davis',
      department: 'Sales',
      regularHours: 32,
      overtimeHours: 0,
      grossPay: 1920.00,
      status: 'warning'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'included':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Included</Badge>;
      case 'excluded':
        return <Badge variant="outline">Excluded</Badge>;
      case 'warning':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalEmployees = employees.filter(emp => emp.status === 'included').length;
  const totalGrossPay = employees
    .filter(emp => emp.status === 'included')
    .reduce((sum, emp) => sum + emp.grossPay, 0);

  const steps = [
    { number: 1, title: 'Batch Configuration', description: 'Set up basic batch parameters' },
    { number: 2, title: 'Employee Selection', description: 'Review and select employees' },
    { number: 3, title: 'Review & Calculate', description: 'Final review and calculations' },
    { number: 4, title: 'Submit Batch', description: 'Submit for processing' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Payroll Batch</h1>
          <p className="text-muted-foreground">Set up a new payroll batch for processing</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                } font-medium`}>
                  {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Configuration</CardTitle>
            <CardDescription>Configure the basic parameters for this payroll batch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Batch Name</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="e.g., Weekly Payroll - Week 04/2024"
                  value={batchConfig.name}
                  onChange={(e) => setBatchConfig({...batchConfig, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Batch Type</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={batchConfig.batchType}
                  onChange={(e) => setBatchConfig({...batchConfig, batchType: e.target.value})}
                >
                  <option value="regular">Regular Payroll</option>
                  <option value="bonus">Bonus Payroll</option>
                  <option value="correction">Correction Payroll</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Pay Period Start</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={batchConfig.payPeriodStart}
                  onChange={(e) => setBatchConfig({...batchConfig, payPeriodStart: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pay Period End</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={batchConfig.payPeriodEnd}
                  onChange={(e) => setBatchConfig({...batchConfig, payPeriodEnd: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pay Date</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={batchConfig.payDate}
                  onChange={(e) => setBatchConfig({...batchConfig, payDate: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Selection</CardTitle>
            <CardDescription>Review employees and their calculated pay for this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Regular Hours</TableHead>
                  <TableHead>OT Hours</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.regularHours}</TableCell>
                    <TableCell>{employee.overtimeHours}</TableCell>
                    <TableCell>{formatCurrency(employee.grossPay)}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Included in batch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Pay Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalGrossPay)}</div>
                <p className="text-xs text-muted-foreground">Before deductions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pay Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Jan 26</div>
                <p className="text-xs text-muted-foreground">2024</p>
              </CardContent>
            </Card>
          </div>

          {/* Batch Details */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Review</CardTitle>
              <CardDescription>Final review before submitting the batch for processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Batch Name:</span>
                  <span>{batchConfig.name || 'Unnamed Batch'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Batch Type:</span>
                  <span className="capitalize">{batchConfig.batchType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pay Period:</span>
                  <span>{batchConfig.payPeriodStart} to {batchConfig.payPeriodEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pay Date:</span>
                  <span>{batchConfig.payDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Previous
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Submit Batch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCreator;