import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePayGroups } from '@/hooks/useClientPayrollSettings';
import { Checkbox } from '@/components/ui/checkbox';

interface PayConfigurationFormProps {
  clientId: string;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PayConfigurationForm: React.FC<PayConfigurationFormProps> = ({
  clientId,
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [payFrequency, setPayFrequency] = useState(initialData?.pay_frequency || '');
  const [selectedPayGroups, setSelectedPayGroups] = useState<string[]>(initialData?.pay_group_ids || []);

  const { data: allPayGroups = [] } = usePayGroups();

  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'semi_monthly', label: 'Semi-Monthly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Filter pay groups by selected frequency
  const filteredPayGroups = allPayGroups.filter(pg => 
    !payFrequency || pg.pay_frequency === payFrequency
  );

  const handlePayGroupToggle = (payGroupId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayGroups([...selectedPayGroups, payGroupId]);
    } else {
      setSelectedPayGroups(selectedPayGroups.filter(id => id !== payGroupId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFrequency) return;

    onSave({
      pay_frequency: payFrequency,
      pay_group_ids: selectedPayGroups
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pay Frequency Selection */}
      <div className="space-y-2">
        <Label htmlFor="pay-frequency">Pay Frequency</Label>
        <Select value={payFrequency} onValueChange={setPayFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="Select pay frequency" />
          </SelectTrigger>
          <SelectContent>
            {payFrequencyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pay Groups Selection */}
      {payFrequency && (
        <div className="space-y-2">
          <Label>Pay Groups ({payFrequency.replace('_', '-')})</Label>
          <div className="border rounded-md p-4 space-y-3 max-h-60 overflow-y-auto">
            {filteredPayGroups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  No pay groups found for {payFrequency.replace('_', '-')} frequency
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Create pay groups in the Pay Group Manager
                </p>
              </div>
            ) : (
              filteredPayGroups.map(payGroup => {
                const employeeCount = typeof payGroup.employee_count === 'number' 
                  ? payGroup.employee_count 
                  : 0;
                
                return (
                  <div key={payGroup.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`paygroup-${payGroup.id}`}
                      checked={selectedPayGroups.includes(payGroup.id)}
                      onCheckedChange={(checked) => 
                        handlePayGroupToggle(payGroup.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`paygroup-${payGroup.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {payGroup.name}
                      </label>
                      <div className="text-xs text-muted-foreground mt-1">
                        {payGroup.description && (
                          <p>{payGroup.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span>👥 {employeeCount} employees</span>
                          {payGroup.next_pay_date && (
                            <span>📅 Next: {new Date(payGroup.next_pay_date).toLocaleDateString()}</span>
                          )}
                          {payGroup.default_cost_center && (
                            <span>🏢 {payGroup.default_cost_center}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!payFrequency || isLoading}
        >
          {initialData ? 'Update Configuration' : 'Add Configuration'}
        </Button>
      </div>
    </form>
  );
};