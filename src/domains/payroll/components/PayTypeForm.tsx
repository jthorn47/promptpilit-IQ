
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PayType } from '../types';
import { PayTypeEngine } from '../engine/PayTypeEngine';

export interface PayTypeFormProps {
  payType?: PayType;
  onSubmit: (payType: Partial<PayType>) => void;
  onCancel: () => void;
}

export const PayTypeForm: React.FC<PayTypeFormProps> = ({ payType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PayType>>({
    name: '',
    code: '',
    pay_category: 'earnings',
    description: '',
    rate: 0,
    default_rate_multiplier: 1.0,
    is_active: true,
    is_system_default: false,
    // Tax flags
    is_taxable_federal: true,
    is_taxable_state: true,
    is_taxable_fica: true,
    is_taxable_medicare: true,
    is_taxable_sdi: false,
    is_taxable_sui: true,
    // Processing flags
    subject_to_overtime: true,
    counts_toward_hours_worked: true,
    includable_in_regular_rate: true,
    reportable_on_w2: true,
    w2_box_code: '',
    gl_mapping_code: '',
    state_specific_rules: {},
    ...payType
  });

  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  useEffect(() => {
    if (formData.name && formData.code) {
      const validation = PayTypeEngine.validatePayTypeFlags(formData as PayType);
      setValidationResult(validation);
    }
  }, [formData]);

  const handleInputChange = (field: keyof PayType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationResult.valid) {
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the basic pay type details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Pay Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Regular Hours"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., REG"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe when this pay type is used"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate">Default Rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate || 0}
                onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="multiplier">Rate Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.01"
                value={formData.default_rate_multiplier}
                onChange={(e) => handleInputChange('default_rate_multiplier', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Treatment</CardTitle>
          <CardDescription>Configure how this pay type affects tax calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_taxable_federal"
                checked={formData.is_taxable_federal}
                onCheckedChange={(checked) => handleInputChange('is_taxable_federal', checked)}
              />
              <Label htmlFor="is_taxable_federal">Subject to Federal Income Tax</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_taxable_state"
                checked={formData.is_taxable_state}
                onCheckedChange={(checked) => handleInputChange('is_taxable_state', checked)}
              />
              <Label htmlFor="is_taxable_state">Subject to State Income Tax</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_taxable_fica"
                checked={formData.is_taxable_fica}
                onCheckedChange={(checked) => handleInputChange('is_taxable_fica', checked)}
              />
              <Label htmlFor="is_taxable_fica">Subject to Social Security Tax</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_taxable_medicare"
                checked={formData.is_taxable_medicare}
                onCheckedChange={(checked) => handleInputChange('is_taxable_medicare', checked)}
              />
              <Label htmlFor="is_taxable_medicare">Subject to Medicare Tax</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Rules</CardTitle>
          <CardDescription>Configure how this pay type is processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="subject_to_overtime"
                checked={formData.subject_to_overtime}
                onCheckedChange={(checked) => handleInputChange('subject_to_overtime', checked)}
              />
              <Label htmlFor="subject_to_overtime">Subject to Overtime</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="counts_toward_hours_worked"
                checked={formData.counts_toward_hours_worked}
                onCheckedChange={(checked) => handleInputChange('counts_toward_hours_worked', checked)}
              />
              <Label htmlFor="counts_toward_hours_worked">Counts Toward Hours Worked</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="includable_in_regular_rate"
                checked={formData.includable_in_regular_rate}
                onCheckedChange={(checked) => handleInputChange('includable_in_regular_rate', checked)}
              />
              <Label htmlFor="includable_in_regular_rate">Includable in Regular Rate</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="reportable_on_w2"
                checked={formData.reportable_on_w2}
                onCheckedChange={(checked) => handleInputChange('reportable_on_w2', checked)}
              />
              <Label htmlFor="reportable_on_w2">Reportable on W-2</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {!validationResult.valid && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Configuration Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {validationResult.valid && formData.name && (
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
          onClick={handleSubmit}
          disabled={!validationResult.valid}
        >
          Save Pay Type
        </Button>
      </div>
    </div>
  );
};
