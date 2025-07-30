
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface DeductionInput {
  type: string;
  amount: number;
  isPreTax: boolean;
  annualLimit?: number;
  currentYTD?: number;
}

interface DeductionResult {
  grossPay: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  federalTaxableWages: number;
  californiaTaxableWages: number;
  ficaTaxableWages: number;
  estimatedTaxSavings: number;
}

export const AdvancedDeductionCalculator: React.FC = () => {
  const { measureTaxCalculation, metrics } = useAdvancedPerformance();
  const [grossPay, setGrossPay] = useState<number>(5000);
  const [deductions, setDeductions] = useState<DeductionInput[]>([
    { type: '401k', amount: 400, isPreTax: true, annualLimit: 23000, currentYTD: 4800 },
    { type: 'health_insurance', amount: 150, isPreTax: true, annualLimit: 0, currentYTD: 1800 },
    { type: 'parking', amount: 50, isPreTax: false, annualLimit: 0, currentYTD: 600 }
  ]);
  const [result, setResult] = useState<DeductionResult | null>(null);

  const deductionTypes = [
    { value: '401k', label: '401(k) Contribution', maxAnnual: 23000 },
    { value: 'health_insurance', label: 'Health Insurance', maxAnnual: 0 },
    { value: 'dental_insurance', label: 'Dental Insurance', maxAnnual: 0 },
    { value: 'vision_insurance', label: 'Vision Insurance', maxAnnual: 0 },
    { value: 'fsa_medical', label: 'Medical FSA', maxAnnual: 3200 },
    { value: 'fsa_dependent', label: 'Dependent Care FSA', maxAnnual: 5000 },
    { value: 'parking', label: 'Parking', maxAnnual: 0 },
    { value: 'transit', label: 'Transit', maxAnnual: 0 },
    { value: 'life_insurance', label: 'Life Insurance', maxAnnual: 0 },
    { value: 'disability_insurance', label: 'Disability Insurance', maxAnnual: 0 }
  ];

  const calculateDeductions = async () => {
    const calculation = await measureTaxCalculation(async () => {
      let preTaxTotal = 0;
      let postTaxTotal = 0;

      deductions.forEach(deduction => {
        if (deduction.isPreTax) {
          // Check annual limits
          if (deduction.annualLimit && deduction.currentYTD) {
            const remainingLimit = deduction.annualLimit - deduction.currentYTD;
            const allowedAmount = Math.min(deduction.amount, remainingLimit);
            preTaxTotal += Math.max(0, allowedAmount);
          } else {
            preTaxTotal += deduction.amount;
          }
        } else {
          postTaxTotal += deduction.amount;
        }
      });

      const federalTaxableWages = grossPay - preTaxTotal;
      const californiaTaxableWages = grossPay - preTaxTotal;
      const ficaTaxableWages = grossPay - preTaxTotal;

      // Estimate tax savings (simplified calculation)
      const federalTaxRate = 0.22; // Marginal rate
      const californiaTaxRate = 0.093; // CA marginal rate
      const ficaRate = 0.0765; // Combined SS + Medicare

      const estimatedTaxSavings = preTaxTotal * (federalTaxRate + californiaTaxRate + ficaRate);

      return {
        grossPay,
        preTaxDeductions: preTaxTotal,
        postTaxDeductions: postTaxTotal,
        federalTaxableWages,
        californiaTaxableWages,
        ficaTaxableWages,
        estimatedTaxSavings
      };
    }, 'Advanced Deduction Calculation');

    setResult(calculation);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { type: '401k', amount: 0, isPreTax: true, annualLimit: 0, currentYTD: 0 }]);
  };

  const updateDeduction = (index: number, field: keyof DeductionInput, value: any) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-set annual limits based on type
    if (field === 'type') {
      const deductionType = deductionTypes.find(d => d.value === value);
      if (deductionType) {
        updated[index].annualLimit = deductionType.maxAnnual;
      }
    }
    
    setDeductions(updated);
  };

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Advanced Deduction Calculator (CA/Federal)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grossPay">Gross Pay</Label>
              <Input
                id="grossPay"
                type="number"
                value={grossPay}
                onChange={(e) => setGrossPay(Number(e.target.value))}
                placeholder="Enter gross pay"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculateDeductions} className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Deductions</h3>
              <Button onClick={addDeduction} variant="outline" size="sm">
                Add Deduction
              </Button>
            </div>

            {deductions.map((deduction, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={deduction.type} 
                    onValueChange={(value) => updateDeduction(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deductionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={deduction.amount}
                    onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Pre-Tax</Label>
                  <Select 
                    value={deduction.isPreTax.toString()} 
                    onValueChange={(value) => updateDeduction(index, 'isPreTax', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Annual Limit</Label>
                  <Input
                    type="number"
                    value={deduction.annualLimit || ''}
                    onChange={(e) => updateDeduction(index, 'annualLimit', Number(e.target.value) || 0)}
                    placeholder="0 = No limit"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => removeDeduction(index)} 
                    variant="destructive" 
                    size="sm"
                    className="w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${result.preTaxDeductions.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Pre-Tax Deductions</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${result.postTaxDeductions.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Post-Tax Deductions</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  ${result.federalTaxableWages.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Federal Taxable</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${result.estimatedTaxSavings.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Est. Tax Savings</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">Tax Optimization Summary</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                By utilizing ${result.preTaxDeductions.toFixed(2)} in pre-tax deductions, you're saving approximately 
                ${result.estimatedTaxSavings.toFixed(2)} in combined Federal, California, and FICA taxes.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.averageResponseTime.toFixed(2)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.totalRequests}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
