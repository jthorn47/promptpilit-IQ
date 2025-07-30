import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileCheck, AlertTriangle, Calendar } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeComplianceTabProps {
  employee: Employee;
  onChange: () => void;
}

export const EmployeeComplianceTab = ({ employee, onChange }: EmployeeComplianceTabProps) => {
  const complianceItems = [
    {
      id: 'i9_verification',
      name: 'I-9 Employment Eligibility Verification',
      status: 'completed',
      dueDate: null,
      completedDate: '2024-01-15',
      required: true
    },
    {
      id: 'background_check',
      name: 'Background Check',
      status: 'completed',
      dueDate: null,
      completedDate: '2024-01-10',
      required: true
    },
    {
      id: 'drug_screening',
      name: 'Drug Screening',
      status: 'pending',
      dueDate: '2024-02-01',
      completedDate: null,
      required: true
    },
    {
      id: 'safety_training',
      name: 'Workplace Safety Training',
      status: 'overdue',
      dueDate: '2024-01-20',
      completedDate: null,
      required: true
    },
    {
      id: 'harassment_training',
      name: 'Sexual Harassment Prevention Training',
      status: 'not_required',
      dueDate: null,
      completedDate: null,
      required: false
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'not_required':
        return <Badge className="bg-gray-100 text-gray-800">Not Required</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceItems.filter(item => item.status === 'completed').length}
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {complianceItems.filter(item => item.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {complianceItems.filter(item => item.status === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {item.required && (
                      <span className="text-red-600 font-medium">Required</span>
                    )}
                    {item.dueDate && (
                      <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                    )}
                    {item.completedDate && (
                      <span className="text-green-600">
                        Completed: {new Date(item.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(item.status)}
                <Button variant="outline" size="sm">
                  {item.status === 'completed' ? 'View' : 'Update'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Training Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Training Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Training requirements will be displayed here based on the employee's role, location, and company policies.
          </div>
          <Button variant="outline" className="w-full">
            Assign Required Training
          </Button>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications & Licenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            No certifications or licenses on file.
          </div>
          <Button variant="outline" className="w-full">
            Add Certification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};