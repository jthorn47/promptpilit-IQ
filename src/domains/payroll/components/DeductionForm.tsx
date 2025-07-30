import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeductionDefinition } from '../hooks/useDeductions';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DeductionFormProps {
  deduction?: DeductionDefinition | null;
  onSubmit: (deduction: Partial<DeductionDefinition>) => void;
  onCancel: () => void;
}

export const DeductionForm: React.FC<DeductionFormProps> = ({ deduction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<DeductionDefinition>>({
    name: '',
    code: '',
    deduction_type: 'pre_tax',
    calculation_method: 'flat_amount',
    default_amount: 0,
    percentage_rate: 0,
    custom_formula: '',
    is_employer_paid: false,
    is_employee_paid: true,
    employer_match_percentage: 0,
    per_check_limit: undefined,
    annual_limit: undefined,
    deduction_schedule: 'every_check',
    is_taxable: true,
    is_reimbursable: false,
    show_on_pay_stub: true,
    w2_reporting_code: '',
    gl_code: '',
    is_active: true,
    ...deduction
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push('Deduction name is required');
    }

    if (!formData.code?.trim()) {
      errors.push('Deduction code is required');
    }

    if (formData.calculation_method === 'flat_amount' && (!formData.default_amount || formData.default_amount <= 0)) {
      errors.push('Default amount must be greater than 0 for flat amount deductions');
    }

    if (formData.calculation_method === 'percentage' && (!formData.percentage_rate || formData.percentage_rate <= 0)) {
      errors.push('Percentage rate must be greater than 0 for percentage deductions');
    }

    if (formData.calculation_method === 'custom_formula' && !formData.custom_formula?.trim()) {
      errors.push('Custom formula is required for formula-based deductions');
    }

    if (!formData.is_employer_paid && !formData.is_employee_paid) {
      errors.push('Deduction must be paid by either employer or employee (or both)');
    }

    if (formData.employer_match_percentage && (formData.employer_match_percentage < 0 || formData.employer_match_percentage > 100)) {
      errors.push('Employer match percentage must be between 0 and 100');
    }

    if (formData.per_check_limit && formData.per_check_limit <= 0) {
      errors.push('Per check limit must be greater than 0 if specified');
    }

    if (formData.annual_limit && formData.annual_limit <= 0) {
      errors.push('Annual limit must be greater than 0 if specified');
    }

    setValidationErrors(errors);
  };

  const handleInputChange = (field: keyof DeductionDefinition, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length === 0) {
      onSubmit(formData);
    }
  };

  const isValid = validationErrors.length === 0 && formData.name && formData.code;

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Configure the basic deduction details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Deduction Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Health Insurance"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., HEALTH"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deduction_type">Deduction Type *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={formData.deduction_type} onValueChange={(value) => handleInputChange('deduction_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre_tax">Pre-Tax</SelectItem>
                          <SelectItem value="post_tax">Post-Tax</SelectItem>
                          <SelectItem value="garnishment">Garnishment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <strong>Pre-Tax:</strong> Reduces taxable income<br/>
                      <strong>Post-Tax:</strong> Deducted after taxes<br/>
                      <strong>Garnishment:</strong> Court-ordered deductions
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div>
                <Label htmlFor="deduction_schedule">Deduction Schedule</Label>
                <Select value={formData.deduction_schedule} onValueChange={(value) => handleInputChange('deduction_schedule', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="every_check">Every Paycheck</SelectItem>
                    <SelectItem value="first_of_month">First of Month</SelectItem>
                    <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Method */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Method</CardTitle>
            <CardDescription>Configure how this deduction is calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calculation_method">Calculation Method *</Label>
              <Select value={formData.calculation_method} onValueChange={(value) => handleInputChange('calculation_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat_amount">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage of Earnings</SelectItem>
                  <SelectItem value="custom_formula">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.calculation_method === 'flat_amount' && (
              <div>
                <Label htmlFor="default_amount">Default Amount *</Label>
                <Input
                  id="default_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.default_amount || ''}
                  onChange={(e) => handleInputChange('default_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            )}

            {formData.calculation_method === 'percentage' && (
              <div>
                <Label htmlFor="percentage_rate">Percentage Rate *</Label>
                <Input
                  id="percentage_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentage_rate || ''}
                  onChange={(e) => handleInputChange('percentage_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            )}

            {formData.calculation_method === 'custom_formula' && (
              <div>
                <Label htmlFor="custom_formula">Custom Formula *</Label>
                <Textarea
                  id="custom_formula"
                  value={formData.custom_formula || ''}
                  onChange={(e) => handleInputChange('custom_formula', e.target.value)}
                  placeholder="Enter formula (e.g., gross_pay * 0.05)"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like gross_pay, hours, base_salary in your formula
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>Configure who pays for this deduction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_employee_paid"
                  checked={formData.is_employee_paid}
                  onCheckedChange={(checked) => handleInputChange('is_employee_paid', checked)}
                />
                <Label htmlFor="is_employee_paid">Employee Paid</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_employer_paid"
                  checked={formData.is_employer_paid}
                  onCheckedChange={(checked) => handleInputChange('is_employer_paid', checked)}
                />
                <Label htmlFor="is_employer_paid">Employer Paid</Label>
              </div>
            </div>

            {formData.is_employer_paid && (
              <div>
                <Label htmlFor="employer_match_percentage">Employer Match Percentage</Label>
                <Input
                  id="employer_match_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.employer_match_percentage || ''}
                  onChange={(e) => handleInputChange('employer_match_percentage', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limits and Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Limits and Rules</CardTitle>
            <CardDescription>Configure deduction limits and tax treatment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="per_check_limit">Per Check Limit</Label>
                <Input
                  id="per_check_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.per_check_limit || ''}
                  onChange={(e) => handleInputChange('per_check_limit', parseFloat(e.target.value) || undefined)}
                  placeholder="No limit"
                />
              </div>
              
              <div>
                <Label htmlFor="annual_limit">Annual Limit</Label>
                <Input
                  id="annual_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.annual_limit || ''}
                  onChange={(e) => handleInputChange('annual_limit', parseFloat(e.target.value) || undefined)}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="w2_reporting_code">W-2 Reporting Code</Label>
                <Input
                  id="w2_reporting_code"
                  value={formData.w2_reporting_code || ''}
                  onChange={(e) => handleInputChange('w2_reporting_code', e.target.value)}
                  placeholder="e.g., DD"
                />
              </div>
              
              <div>
                <Label htmlFor="gl_code">GL Account Code</Label>
                <Input
                  id="gl_code"
                  value={formData.gl_code || ''}
                  onChange={(e) => handleInputChange('gl_code', e.target.value)}
                  placeholder="e.g., 2100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_taxable"
                  checked={formData.is_taxable}
                  onCheckedChange={(checked) => handleInputChange('is_taxable', checked)}
                />
                <Label htmlFor="is_taxable">Taxable</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_reimbursable"
                  checked={formData.is_reimbursable}
                  onCheckedChange={(checked) => handleInputChange('is_reimbursable', checked)}
                />
                <Label htmlFor="is_reimbursable">Reimbursable</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_on_pay_stub"
                  checked={formData.show_on_pay_stub}
                  onCheckedChange={(checked) => handleInputChange('show_on_pay_stub', checked)}
                />
                <Label htmlFor="show_on_pay_stub">Show on Pay Stub</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {validationErrors.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Configuration Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {isValid && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Configuration is valid</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isValid}
          >
            Save Deduction
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};