import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Info, 
  DollarSign, 
  FileText, 
  Calculator,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PayType {
  id?: string;
  name: string;
  code: string;
  pay_category: 'earnings' | 'reimbursement' | 'fringe_benefit' | 'deduction' | 'other';
  description: string;
  is_taxable_federal: boolean;
  is_taxable_state: boolean;
  is_taxable_fica: boolean;
  is_taxable_medicare: boolean;
  is_taxable_sdi: boolean;
  is_taxable_sui: boolean;
  subject_to_overtime: boolean;
  counts_toward_hours_worked: boolean;
  includable_in_regular_rate: boolean;
  default_rate_multiplier: number;
  reportable_on_w2: boolean;
  w2_box_code: string;
  gl_mapping_code: string;
  state_specific_rules: any;
  is_system_default?: boolean;
  is_active: boolean;
  company_id?: string;
}

interface PayTypeFormProps {
  payType?: PayType | null;
  onSave: () => void;
  onCancel: () => void;
}

export const PayTypeForm: React.FC<PayTypeFormProps> = ({ payType, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PayType>({
    name: '',
    code: '',
    pay_category: 'earnings',
    description: '',
    is_taxable_federal: true,
    is_taxable_state: true,
    is_taxable_fica: true,
    is_taxable_medicare: true,
    is_taxable_sdi: true,
    is_taxable_sui: true,
    subject_to_overtime: true,
    counts_toward_hours_worked: true,
    includable_in_regular_rate: true,
    default_rate_multiplier: 1.0,
    reportable_on_w2: true,
    w2_box_code: '1',
    gl_mapping_code: '',
    state_specific_rules: {},
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (payType) {
      setFormData(payType);
    }
  }, [payType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      const userData = {
        ...formData,
        created_by: payType ? undefined : user.data.user?.id,
        updated_by: user.data.user?.id,
      };

      if (payType?.id) {
        // Update existing
        const { error } = await supabase
          .from('pay_types')
          .update(userData)
          .eq('id', payType.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('pay_types')
          .insert(userData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Pay type ${payType ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error: any) {
      console.error('Error saving pay type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save pay type",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-4 h-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="taxation">Taxation</TabsTrigger>
          <TabsTrigger value="calculation">Calculation</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Pay Type Name
                    <InfoTooltip content="Full descriptive name for this pay type (e.g., 'Holiday Pay')" />
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Holiday Pay"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code" className="flex items-center gap-2">
                    Code
                    <InfoTooltip content="Short internal code for this pay type (e.g., 'HOL')" />
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., HOL"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pay_category" className="flex items-center gap-2">
                  Pay Category
                  <InfoTooltip content="Categorizes the type of compensation for proper handling" />
                </Label>
                <Select value={formData.pay_category} onValueChange={(value) => handleInputChange('pay_category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earnings">Earnings</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                    <SelectItem value="fringe_benefit">Fringe Benefit</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  Description
                  <InfoTooltip content="Detailed description of when and how this pay type is used" />
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe when this pay type is used..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="default_rate_multiplier" className="flex items-center gap-2">
                  Default Rate Multiplier
                  <InfoTooltip content="Default multiplier for this pay type (e.g., 1.5 for overtime)" />
                </Label>
                <Input
                  id="default_rate_multiplier"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.default_rate_multiplier}
                  onChange={(e) => handleInputChange('default_rate_multiplier', parseFloat(e.target.value) || 1.0)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Tax Treatment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Federal Taxes</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_federal"
                      checked={formData.is_taxable_federal}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_federal', checked)}
                    />
                    <Label htmlFor="is_taxable_federal" className="flex items-center gap-2">
                      Federal Income Tax
                      <InfoTooltip content="Subject to federal income tax withholding" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_fica"
                      checked={formData.is_taxable_fica}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_fica', checked)}
                    />
                    <Label htmlFor="is_taxable_fica" className="flex items-center gap-2">
                      Social Security (FICA)
                      <InfoTooltip content="Subject to Social Security tax (6.2%)" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_medicare"
                      checked={formData.is_taxable_medicare}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_medicare', checked)}
                    />
                    <Label htmlFor="is_taxable_medicare" className="flex items-center gap-2">
                      Medicare
                      <InfoTooltip content="Subject to Medicare tax (1.45%)" />
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">State Taxes</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_state"
                      checked={formData.is_taxable_state}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_state', checked)}
                    />
                    <Label htmlFor="is_taxable_state" className="flex items-center gap-2">
                      State Income Tax
                      <InfoTooltip content="Subject to state income tax withholding" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_sdi"
                      checked={formData.is_taxable_sdi}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_sdi', checked)}
                    />
                    <Label htmlFor="is_taxable_sdi" className="flex items-center gap-2">
                      State Disability Insurance
                      <InfoTooltip content="Subject to state disability insurance (e.g., CA SDI)" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable_sui"
                      checked={formData.is_taxable_sui}
                      onCheckedChange={(checked) => handleInputChange('is_taxable_sui', checked)}
                    />
                    <Label htmlFor="is_taxable_sui" className="flex items-center gap-2">
                      State Unemployment Insurance
                      <InfoTooltip content="Subject to state unemployment insurance (employer tax)" />
                    </Label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Tax Treatment Notice</h4>
                    <p className="text-sm text-yellow-700">
                      Tax treatment may vary by state and specific circumstances. 
                      Consult with tax professionals for complex scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subject_to_overtime"
                    checked={formData.subject_to_overtime}
                    onCheckedChange={(checked) => handleInputChange('subject_to_overtime', checked)}
                  />
                  <Label htmlFor="subject_to_overtime" className="flex items-center gap-2">
                    Subject to Overtime Calculation
                    <InfoTooltip content="Include this pay type when calculating overtime premiums" />
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="counts_toward_hours_worked"
                    checked={formData.counts_toward_hours_worked}
                    onCheckedChange={(checked) => handleInputChange('counts_toward_hours_worked', checked)}
                  />
                  <Label htmlFor="counts_toward_hours_worked" className="flex items-center gap-2">
                    Counts Toward Hours Worked
                    <InfoTooltip content="Include hours for this pay type in total hours worked calculations" />
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includable_in_regular_rate"
                    checked={formData.includable_in_regular_rate}
                    onCheckedChange={(checked) => handleInputChange('includable_in_regular_rate', checked)}
                  />
                  <Label htmlFor="includable_in_regular_rate" className="flex items-center gap-2">
                    Include in Regular Rate of Pay
                    <InfoTooltip content="Include this pay type when calculating the regular rate for overtime purposes" />
                  </Label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">California Compliance</h4>
                    <p className="text-sm text-blue-700">
                      These settings ensure compliance with California Labor Code requirements 
                      for overtime calculations and regular rate determinations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reporting & Accounting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reportable_on_w2"
                  checked={formData.reportable_on_w2}
                  onCheckedChange={(checked) => handleInputChange('reportable_on_w2', checked)}
                />
                <Label htmlFor="reportable_on_w2" className="flex items-center gap-2">
                  Reportable on W-2
                  <InfoTooltip content="Include this pay type on employee W-2 forms" />
                </Label>
              </div>

              {formData.reportable_on_w2 && (
                <div>
                  <Label htmlFor="w2_box_code" className="flex items-center gap-2">
                    W-2 Box Code
                    <InfoTooltip content="Which box on the W-2 form to report this pay type (typically Box 1 for wages)" />
                  </Label>
                  <Select value={formData.w2_box_code} onValueChange={(value) => handleInputChange('w2_box_code', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Box 1 - Wages, tips, other compensation</SelectItem>
                      <SelectItem value="12a">Box 12a - Other compensation</SelectItem>
                      <SelectItem value="12b">Box 12b - Other compensation</SelectItem>
                      <SelectItem value="14">Box 14 - Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="gl_mapping_code" className="flex items-center gap-2">
                  GL Mapping Code (Optional)
                  <InfoTooltip content="General ledger account code for accounting system integration" />
                </Label>
                <Input
                  id="gl_mapping_code"
                  value={formData.gl_mapping_code}
                  onChange={(e) => handleInputChange('gl_mapping_code', e.target.value)}
                  placeholder="e.g., 5100-REG"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : (payType ? 'Update' : 'Create')} Pay Type
        </Button>
      </div>
    </form>
  );
};