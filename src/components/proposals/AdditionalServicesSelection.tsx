import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Users, Calendar, Percent, Info, Calculator, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type BillingType = 'flat_fee_onetime' | 'flat_fee_recurring' | 'per_employee' | 'pepm' | 'percentage_payroll';

interface AdditionalFee {
  id: string;
  fee_name: string;
  description: string;
  default_cost: number;
  billing_type: BillingType;
  default_inclusion: boolean;
  editable_at_company_level: boolean;
  display_in_proposal: boolean;
  include_in_roi_calculation: boolean;
  is_active: boolean;
  sort_order: number;
}

interface SelectedFee {
  fee_id: string;
  is_included: boolean;
  custom_cost: number | null;
  notes: string;
}

interface AdditionalServicesSelectionProps {
  companyId: string;
  workflowId?: string;
  employeeCount: number;
  annualPayroll: number;
  selectedFees: SelectedFee[];
  onFeesChange: (fees: SelectedFee[]) => void;
  onTotalChange: (total: number) => void;
  readonly?: boolean;
}

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  flat_fee_onetime: 'One-time Fee',
  flat_fee_recurring: 'Monthly Fee',
  per_employee: 'Per Employee',
  pepm: 'Per Employee/Month',
  percentage_payroll: '% of Payroll'
};

const BILLING_TYPE_ICONS: Record<BillingType, any> = {
  flat_fee_onetime: DollarSign,
  flat_fee_recurring: Calendar,
  per_employee: Users,
  pepm: Users,
  percentage_payroll: Percent
};

export const AdditionalServicesSelection = ({
  companyId,
  workflowId,
  employeeCount,
  annualPayroll,
  selectedFees,
  onFeesChange,
  onTotalChange,
  readonly = false
}: AdditionalServicesSelectionProps) => {
  const [availableFees, setAvailableFees] = useState<AdditionalFee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableFees();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [selectedFees, availableFees, employeeCount, annualPayroll]);

  const loadAvailableFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('propgen_additional_fees')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAvailableFees(data || []);
    } catch (error) {
      console.error('Error loading additional fees:', error);
      toast({
        title: "Error",
        description: "Failed to load additional fees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFeeAmount = (fee: AdditionalFee, customCost?: number): number => {
    const cost = customCost ?? fee.default_cost;
    
    switch (fee.billing_type) {
      case 'flat_fee_onetime':
        return cost;
      case 'flat_fee_recurring':
        return cost * 12; // Annual cost
      case 'per_employee':
        return cost * employeeCount;
      case 'pepm':
        return cost * employeeCount * 12; // Annual cost
      case 'percentage_payroll':
        return (cost / 100) * annualPayroll;
      default:
        return cost;
    }
  };

  const calculateTotal = () => {
    const total = selectedFees.reduce((sum, selectedFee) => {
      if (!selectedFee.is_included) return sum;
      
      const fee = availableFees.find(f => f.id === selectedFee.fee_id);
      if (!fee || !fee.include_in_roi_calculation) return sum;
      
      return sum + calculateFeeAmount(fee, selectedFee.custom_cost || undefined);
    }, 0);
    
    onTotalChange(total);
  };

  const updateSelectedFee = (feeId: string, updates: Partial<SelectedFee>) => {
    const updatedFees = selectedFees.map(sf => 
      sf.fee_id === feeId ? { ...sf, ...updates } : sf
    );
    
    // If fee not in selected list, add it
    if (!selectedFees.find(sf => sf.fee_id === feeId)) {
      const fee = availableFees.find(f => f.id === feeId);
      if (fee) {
        updatedFees.push({
          fee_id: feeId,
          is_included: false,
          custom_cost: null,
          notes: '',
          ...updates
        });
      }
    }
    
    onFeesChange(updatedFees);
  };

  const getSelectedFee = (feeId: string): SelectedFee => {
    return selectedFees.find(sf => sf.fee_id === feeId) || {
      fee_id: feeId,
      is_included: false,
      custom_cost: null,
      notes: ''
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCostDisplay = (fee: AdditionalFee, customCost?: number) => {
    const cost = customCost ?? fee.default_cost;
    const annualAmount = calculateFeeAmount(fee, customCost);
    
    switch (fee.billing_type) {
      case 'percentage_payroll':
        return `${cost}% of payroll (${formatCurrency(annualAmount)} annually)`;
      case 'per_employee':
        return `${formatCurrency(cost)} × ${employeeCount} employees = ${formatCurrency(annualAmount)}`;
      case 'pepm':
        return `${formatCurrency(cost)} × ${employeeCount} employees × 12 months = ${formatCurrency(annualAmount)}`;
      case 'flat_fee_recurring':
        return `${formatCurrency(cost)}/month (${formatCurrency(annualAmount)} annually)`;
      default:
        return formatCurrency(annualAmount);
    }
  };

  const getTotalAnnualCost = () => {
    return selectedFees.reduce((sum, selectedFee) => {
      if (!selectedFee.is_included) return sum;
      
      const fee = availableFees.find(f => f.id === selectedFee.fee_id);
      if (!fee) return sum;
      
      return sum + calculateFeeAmount(fee, selectedFee.custom_cost || undefined);
    }, 0);
  };

  const getROITotal = () => {
    return selectedFees.reduce((sum, selectedFee) => {
      if (!selectedFee.is_included) return sum;
      
      const fee = availableFees.find(f => f.id === selectedFee.fee_id);
      if (!fee || !fee.include_in_roi_calculation) return sum;
      
      return sum + calculateFeeAmount(fee, selectedFee.custom_cost || undefined);
    }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading additional services...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Additional Services Selection</h3>
          <p className="text-sm text-muted-foreground">
            Choose optional value-added services to include in this proposal
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Employee Count: {employeeCount}</div>
          <div className="text-sm text-muted-foreground">Annual Payroll: {formatCurrency(annualPayroll)}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {availableFees.map((fee) => {
          const selectedFee = getSelectedFee(fee.id);
          const IconComponent = BILLING_TYPE_ICONS[fee.billing_type];
          const isIncluded = selectedFee.is_included;
          
          return (
            <Card key={fee.id} className={`transition-all ${isIncluded ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{fee.fee_name}</CardTitle>
                        <Badge variant="outline">
                          {BILLING_TYPE_LABELS[fee.billing_type]}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {fee.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCostDisplay(fee, selectedFee.custom_cost || undefined)}
                      </div>
                      {fee.include_in_roi_calculation && (
                        <div className="text-xs text-muted-foreground">Included in ROI</div>
                      )}
                    </div>
                    {!readonly && (
                      <Switch
                        checked={isIncluded}
                        onCheckedChange={(checked) => 
                          updateSelectedFee(fee.id, { is_included: checked })
                        }
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isIncluded && (
                <CardContent className="pt-0 space-y-4">
                  {fee.editable_at_company_level && !readonly && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cost-${fee.id}`} className="text-sm">
                          Custom Cost {fee.billing_type === 'percentage_payroll' ? '(%)' : '($)'}
                        </Label>
                        <Input
                          id={`cost-${fee.id}`}
                          type="number"
                          step={fee.billing_type === 'percentage_payroll' ? '0.01' : '1'}
                          placeholder={`Default: ${fee.default_cost}`}
                          value={selectedFee.custom_cost || ''}
                          onChange={(e) => 
                            updateSelectedFee(fee.id, { 
                              custom_cost: e.target.value ? parseFloat(e.target.value) : null 
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`notes-${fee.id}`} className="text-sm">Notes</Label>
                        <Input
                          id={`notes-${fee.id}`}
                          placeholder="Add custom notes..."
                          value={selectedFee.notes}
                          onChange={(e) => 
                            updateSelectedFee(fee.id, { notes: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                  
                  {isIncluded && (
                    <Alert>
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Annual Cost: {formatCurrency(calculateFeeAmount(fee, selectedFee.custom_cost || undefined))}</strong>
                        {!fee.include_in_roi_calculation && (
                          <span className="text-muted-foreground ml-2">(Not included in ROI calculation)</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {availableFees.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Additional Services Available</h3>
              <p className="text-muted-foreground">
                Contact your administrator to configure additional services
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Additional Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(getTotalAnnualCost())}
            </div>
            <div className="text-sm text-muted-foreground">Annual cost</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ROI Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getROITotal())}
            </div>
            <div className="text-sm text-muted-foreground">Included in ROI calculation</div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Additional services are optional value-added offerings that enhance your HR solution. 
          Services marked "Included in ROI" will be factored into the investment analysis, while others are proposal-only items.
          Employee-based fees are automatically calculated using your headcount of {employeeCount} employees.
        </AlertDescription>
      </Alert>
    </div>
  );
};