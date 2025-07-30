import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, Building, MapPin, Calendar } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeProfileTabProps {
  employee: Employee;
  onChange: () => void;
}

export const EmployeeProfileTab = ({ employee, onChange }: EmployeeProfileTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                defaultValue={employee.first_name} 
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                defaultValue={employee.last_name} 
                onChange={onChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              defaultValue={employee.email} 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input 
              id="employeeId"
              defaultValue={employee.employee_id || ''} 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select defaultValue={employee.preferred_language} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position/Job Title</Label>
            <Input 
              id="position"
              defaultValue={employee.position || employee.job_title || ''} 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input 
              id="department"
              defaultValue={employee.department || ''} 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Work Location</Label>
            <Input 
              id="location"
              defaultValue={employee.location || ''} 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Employment Status</Label>
            <Select defaultValue={employee.status || 'active'} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input 
              id="startDate"
              type="date" 
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboardingStatus">Onboarding Status</Label>
            <Select defaultValue={employee.onboarding_status || 'not_started'} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};