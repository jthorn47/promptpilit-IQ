import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Save, 
  Copy, 
  Archive, 
  Trash2, 
  History,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PayType } from '../types';
import { DeductionDefinition } from '../hooks/useDeductions';

interface PayrollItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: (PayType | DeductionDefinition) | null;
  itemType: 'earnings' | 'deductions';
  companyId: string;
}

export const PayrollItemDrawer: React.FC<PayrollItemDrawerProps> = ({
  open,
  onOpenChange,
  item,
  itemType,
  companyId
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const isCreating = !item;
  const title = isCreating 
    ? `Create New ${itemType === 'earnings' ? 'Earnings Type' : 'Deduction'}`
    : `${isEditing ? 'Edit' : 'View'} ${item?.name}`;

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isCreating) {
      onOpenChange(false);
    } else {
      setIsEditing(false);
      setFormData({});
    }
  };

  const handleClone = () => {
    // TODO: Implement clone logic
    console.log('Cloning item:', item);
  };

  const handleArchive = () => {
    // TODO: Implement archive logic
    console.log('Archiving item:', item);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deleting item:', item);
  };

  React.useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setIsEditing(isCreating);
  }, [item, isCreating]);

  const payCategories = [
    { value: 'regular_hourly', label: 'Regular Hourly' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'commission', label: 'Commission' },
    { value: 'holiday_pay', label: 'Holiday Pay' },
    { value: 'sick_pay', label: 'Sick Pay' },
    { value: 'vacation_pay', label: 'Vacation Pay' },
    { value: 'reimbursement', label: 'Reimbursement' }
  ];

  const deductionTypes = [
    { value: 'pre_tax', label: 'Pre-Tax' },
    { value: 'post_tax', label: 'Post-Tax' },
    { value: 'garnishment', label: 'Garnishment' },
    { value: 'loan_repayment', label: 'Loan Repayment' }
  ];

  const taxTypes = [
    { value: 'taxable', label: 'Taxable' },
    { value: 'pre_tax', label: 'Pre-Tax' },
    { value: 'post_tax', label: 'Post-Tax' },
    { value: 'tax_exempt', label: 'Tax Exempt' }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[800px] max-w-none p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl">{title}</SheetTitle>
                <SheetDescription>
                  {isCreating 
                    ? `Configure a new ${itemType === 'earnings' ? 'earnings type' : 'deduction'} for payroll processing`
                    : `Manage settings and configuration for this ${itemType === 'earnings' ? 'earnings type' : 'deduction'}`
                  }
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isCreating && !isEditing && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClone}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </Button>
                  </>
                )}
                {isEditing && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!isCreating && (
              <div className="flex items-center gap-4 mt-4">
                <Badge variant={item?.is_active ? "default" : "secondary"}>
                  {item?.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {itemType === 'earnings' ? 'Earnings' : 'Deduction'}
                </Badge>
                {item && (
                  <Badge variant="outline" className="font-mono">
                    {item.code}
                  </Badge>
                )}
              </div>
            )}
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-5 w-full rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  General
                </TabsTrigger>
                <TabsTrigger value="taxation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Taxation
                </TabsTrigger>
                <TabsTrigger value="gl_mapping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  GL Mapping
                </TabsTrigger>
                <TabsTrigger value="limits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Limits & Rules
                </TabsTrigger>
                <TabsTrigger value="audit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" disabled={isCreating}>
                  Audit Trail
                </TabsTrigger>
              </TabsList>

              {/* General Information */}
              <TabsContent value="general" className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter descriptive name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter unique code"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter detailed description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData[itemType === 'earnings' ? 'pay_category' : 'deduction_type'] || ''} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        [itemType === 'earnings' ? 'pay_category' : 'deduction_type']: value 
                      }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(itemType === 'earnings' ? payCategories : deductionTypes).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="effective_date">Effective Date</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_start_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, effective_start_date: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Active Status</div>
                    <div className="text-sm text-muted-foreground">
                      Controls whether this item is available for use in payroll
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_active ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    disabled={!isEditing}
                  />
                </div>

                {itemType === 'earnings' && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Default Rate</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.01"
                          value={formData.rate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                          disabled={!isEditing}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="multiplier">Rate Multiplier</Label>
                        <Input
                          id="multiplier"
                          type="number"
                          step="0.1"
                          value={formData.default_rate_multiplier || '1'}
                          onChange={(e) => setFormData(prev => ({ ...prev, default_rate_multiplier: parseFloat(e.target.value) || 1 }))}
                          disabled={!isEditing}
                          placeholder="1.0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {itemType === 'deductions' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="calc_method">Calculation Method</Label>
                        <Select 
                          value={formData.calculation_method || ''} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, calculation_method: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select calculation method..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat_amount">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="custom_formula">Custom Formula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.calculation_method === 'flat_amount' && (
                        <div className="space-y-2">
                          <Label htmlFor="default_amount">Default Amount</Label>
                          <Input
                            id="default_amount"
                            type="number"
                            step="0.01"
                            value={formData.default_amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, default_amount: parseFloat(e.target.value) || 0 }))}
                            disabled={!isEditing}
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      {formData.calculation_method === 'percentage' && (
                        <div className="space-y-2">
                          <Label htmlFor="percentage_rate">Percentage Rate</Label>
                          <Input
                            id="percentage_rate"
                            type="number"
                            step="0.01"
                            value={formData.percentage_rate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, percentage_rate: parseFloat(e.target.value) || 0 }))}
                            disabled={!isEditing}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Taxation Settings */}
              <TabsContent value="taxation" className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tax_type">Tax Treatment</Label>
                  <Select 
                    value={formData.tax_type || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tax_type: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax treatment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {taxTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Tax Flags</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'subject_to_federal_tax', label: 'Federal Income Tax' },
                      { key: 'subject_to_state_tax', label: 'State Income Tax' },
                      { key: 'subject_to_social_security', label: 'Social Security' },
                      { key: 'subject_to_medicare', label: 'Medicare' },
                      { key: 'subject_to_futa', label: 'FUTA' },
                      { key: 'subject_to_suta', label: 'SUTA' }
                    ].map((flag) => (
                      <div key={flag.key} className="flex items-center justify-between p-3 border rounded">
                        <Label htmlFor={flag.key} className="text-sm">
                          {flag.label}
                        </Label>
                        <Switch
                          id={flag.key}
                          checked={formData[flag.key] ?? true}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [flag.key]: checked }))}
                          disabled={!isEditing}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {itemType === 'deductions' && (
                  <div className="space-y-2">
                    <Label htmlFor="w2_code">W-2 Reporting Code</Label>
                    <Input
                      id="w2_code"
                      value={formData.w2_reporting_code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, w2_reporting_code: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter W-2 code"
                    />
                  </div>
                )}
              </TabsContent>

              {/* GL Mapping */}
              <TabsContent value="gl_mapping" className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gl_account">GL Account</Label>
                  <Input
                    id="gl_account"
                    value={formData.gl_account || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, gl_account: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter GL account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_center">Cost Center</Label>
                  <Input
                    id="cost_center"
                    value={formData.cost_center || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_center: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter cost center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_code: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter department code"
                  />
                </div>
              </TabsContent>

              {/* Limits & Rules */}
              <TabsContent value="limits" className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min_amount">Minimum Amount</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      step="0.01"
                      value={formData.min_amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || 0 }))}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_amount">Maximum Amount</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      step="0.01"
                      value={formData.max_amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_amount: parseFloat(e.target.value) || 0 }))}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formula">Custom Formula</Label>
                  <Textarea
                    id="formula"
                    value={formData.custom_formula || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_formula: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter custom calculation formula"
                    rows={4}
                    className="font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Requires Employee Consent</div>
                    <div className="text-sm text-muted-foreground">
                      Employee must explicitly agree before this deduction is applied
                    </div>
                  </div>
                  <Switch
                    checked={formData.requires_employee_consent ?? false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_employee_consent: checked }))}
                    disabled={!isEditing}
                  />
                </div>
              </TabsContent>

              {/* Audit Trail */}
              <TabsContent value="audit" className="p-6">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Audit trail functionality coming soon...
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Actions */}
          {!isCreating && !isEditing && (
            <div className="border-t p-6 bg-muted/30">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    {item?.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};