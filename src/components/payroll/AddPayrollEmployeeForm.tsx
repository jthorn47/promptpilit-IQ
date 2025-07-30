import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCreatePayrollEmployee } from '@/domains/payroll/hooks/usePayrollEmployeeManagement';
import { CreatePayrollEmployeeData } from '@/domains/payroll/types/payrollEmployee';

interface AddPayrollEmployeeFormProps {
  companyId: string;
  onSuccess: () => void;
}

export const AddPayrollEmployeeForm: React.FC<AddPayrollEmployeeFormProps> = ({
  companyId,
  onSuccess
}) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePayrollEmployeeData>({
    defaultValues: {
      company_id: companyId,
      employment_status: 'active',
      pay_type: 'hourly',
      pay_frequency: 'bi_weekly',
      compensation_rate: 0,
      overtime_eligible: true,
      direct_deposit_enabled: false,
      is_exempt_federal: false,
      is_exempt_state: false,
      tax_classification: 'w2',
      hire_type: 'regular',
      is_test_employee: false
    }
  });

  const { toast } = useToast();
  const createEmployee = useCreatePayrollEmployee();

  const onSubmit = async (data: CreatePayrollEmployeeData) => {
    try {
      await createEmployee.mutateAsync(data);
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const payType = watch('pay_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="legal_first_name">Legal First Name *</Label>
            <Input
              id="legal_first_name"
              {...register('legal_first_name', { required: 'First name is required' })}
            />
            {errors.legal_first_name && (
              <p className="text-sm text-destructive mt-1">{errors.legal_first_name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="legal_middle_name">Middle Name</Label>
            <Input
              id="legal_middle_name"
              {...register('legal_middle_name')}
            />
          </div>
          
          <div>
            <Label htmlFor="legal_last_name">Legal Last Name *</Label>
            <Input
              id="legal_last_name"
              {...register('legal_last_name', { required: 'Last name is required' })}
            />
            {errors.legal_last_name && (
              <p className="text-sm text-destructive mt-1">{errors.legal_last_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preferred_name">Preferred Name</Label>
            <Input
              id="preferred_name"
              {...register('preferred_name')}
            />
          </div>
          
          <div>
            <Label htmlFor="employee_number">Employee Number</Label>
            <Input
              id="employee_number"
              {...register('employee_number')}
              placeholder="Auto-generated if left empty"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="personal_email">Personal Email</Label>
            <Input
              id="personal_email"
              type="email"
              {...register('personal_email')}
            />
          </div>
          
          <div>
            <Label htmlFor="mobile_phone">Mobile Phone</Label>
            <Input
              id="mobile_phone"
              {...register('mobile_phone')}
            />
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employment Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hire_date">Hire Date *</Label>
            <Input
              id="hire_date"
              type="date"
              {...register('hire_date', { required: 'Hire date is required' })}
            />
            {errors.hire_date && (
              <p className="text-sm text-destructive mt-1">{errors.hire_date.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="employment_status">Employment Status</Label>
            <Select onValueChange={(value) => setValue('employment_status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              {...register('job_title')}
            />
          </div>
          
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register('department')}
            />
          </div>
        </div>
      </div>

      {/* Pay Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pay Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="pay_type">Pay Type *</Label>
            <Select onValueChange={(value) => setValue('pay_type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="flat_rate">Flat Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="pay_frequency">Pay Frequency *</Label>
            <Select onValueChange={(value) => setValue('pay_frequency', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="compensation_rate">
              {payType === 'hourly' ? 'Hourly Rate ($)' : 'Annual Salary ($)'} *
            </Label>
            <Input
              id="compensation_rate"
              type="number"
              step="0.01"
              {...register('compensation_rate', { 
                required: 'Compensation rate is required',
                min: { value: 0, message: 'Rate must be positive' }
              })}
            />
            {errors.compensation_rate && (
              <p className="text-sm text-destructive mt-1">{errors.compensation_rate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="standard_hours_per_week">Standard Hours per Week</Label>
            <Input
              id="standard_hours_per_week"
              type="number"
              step="0.1"
              defaultValue={40}
              {...register('standard_hours_per_week')}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overtime_eligible"
              checked={watch('overtime_eligible')}
              onCheckedChange={(checked) => setValue('overtime_eligible', !!checked)}
            />
            <Label htmlFor="overtime_eligible">Overtime Eligible</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="direct_deposit_enabled"
              checked={watch('direct_deposit_enabled')}
              onCheckedChange={(checked) => setValue('direct_deposit_enabled', !!checked)}
            />
            <Label htmlFor="direct_deposit_enabled">Direct Deposit Enabled</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_test_employee"
              checked={watch('is_test_employee')}
              onCheckedChange={(checked) => setValue('is_test_employee', !!checked)}
            />
            <Label htmlFor="is_test_employee">Test Employee (excluded from real payroll)</Label>
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tax Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax_classification">Tax Classification</Label>
            <Select onValueChange={(value) => setValue('tax_classification', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w2">W-2 Employee</SelectItem>
                <SelectItem value="1099">1099 Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="hire_type">Hire Type</Label>
            <Select onValueChange={(value) => setValue('hire_type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hire type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="temp">Temporary</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_exempt_federal"
              checked={watch('is_exempt_federal')}
              onCheckedChange={(checked) => setValue('is_exempt_federal', !!checked)}
            />
            <Label htmlFor="is_exempt_federal">Federal Tax Exempt</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_exempt_state"
              checked={watch('is_exempt_state')}
              onCheckedChange={(checked) => setValue('is_exempt_state', !!checked)}
            />
            <Label htmlFor="is_exempt_state">State Tax Exempt</Label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={createEmployee.isPending}>
          {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};