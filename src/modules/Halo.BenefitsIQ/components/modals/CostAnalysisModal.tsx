import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, Users, TrendingUp } from 'lucide-react';

interface CostAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

interface PlanTier {
  name: string;
  premium: number;
  enrolledCount: number;
}

export const CostAnalysisModal: React.FC<CostAnalysisModalProps> = ({
  open,
  onOpenChange,
  companyId
}) => {
  const [employerContributionPercent, setEmployerContributionPercent] = useState(85);
  const [planTiers, setPlanTiers] = useState<PlanTier[]>([
    { name: 'Employee Only', premium: 485, enrolledCount: 45 },
    { name: 'Employee + Spouse', premium: 1150, enrolledCount: 35 },
    { name: 'Employee + Children', premium: 920, enrolledCount: 25 },
    { name: 'Family', premium: 1650, enrolledCount: 40 }
  ]);

  const [results, setResults] = useState({
    totalMonthlyPremium: 0,
    totalAnnualPremium: 0,
    employerMonthlyContribution: 0,
    employerAnnualContribution: 0,
    employeeMonthlyContribution: 0,
    employeeAnnualContribution: 0,
    averagePerEmployee: 0,
    totalEmployees: 0
  });

  const calculateCosts = () => {
    const totalEmployees = planTiers.reduce((sum, tier) => sum + tier.enrolledCount, 0);
    const totalMonthlyPremium = planTiers.reduce((sum, tier) => sum + (tier.premium * tier.enrolledCount), 0);
    const totalAnnualPremium = totalMonthlyPremium * 12;
    
    const employerMonthlyContribution = totalMonthlyPremium * (employerContributionPercent / 100);
    const employerAnnualContribution = employerMonthlyContribution * 12;
    
    const employeeMonthlyContribution = totalMonthlyPremium - employerMonthlyContribution;
    const employeeAnnualContribution = employeeMonthlyContribution * 12;
    
    const averagePerEmployee = totalEmployees > 0 ? totalMonthlyPremium / totalEmployees : 0;

    setResults({
      totalMonthlyPremium,
      totalAnnualPremium,
      employerMonthlyContribution,
      employerAnnualContribution,
      employeeMonthlyContribution,
      employeeAnnualContribution,
      averagePerEmployee,
      totalEmployees
    });
  };

  useEffect(() => {
    calculateCosts();
  }, [planTiers, employerContributionPercent]);

  const updatePlanTier = (index: number, field: keyof PlanTier, value: number) => {
    const updatedTiers = [...planTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setPlanTiers(updatedTiers);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quick Cost Analysis
          </DialogTitle>
          <DialogDescription>
            Calculate estimated monthly and annual benefit costs based on current enrollment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Enrollment</CardTitle>
                <CardDescription>Enter premium costs and enrollment by tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {planTiers.map((tier, index) => (
                  <div key={tier.name} className="space-y-2">
                    <Label className="font-medium">{tier.name}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Monthly Premium</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={tier.premium}
                            onChange={(e) => updatePlanTier(index, 'premium', Number(e.target.value))}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Enrolled</Label>
                        <Input
                          type="number"
                          value={tier.enrolledCount}
                          onChange={(e) => updatePlanTier(index, 'enrolledCount', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contribution Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contribution Strategy</CardTitle>
                <CardDescription>Set employer contribution percentage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employer Contribution Percentage</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={employerContributionPercent}
                      onChange={(e) => setEmployerContributionPercent(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Typical range: 70-90% for employee-only coverage
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Employees</span>
                    <span className="font-medium">{results.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Cost per Employee</span>
                    <span className="font-medium">{formatCurrency(results.averagePerEmployee)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cost Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Costs */}
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Total Premium Costs</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly</span>
                      <span className="font-medium">{formatCurrency(results.totalMonthlyPremium)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual</span>
                      <span className="font-medium text-lg">{formatCurrency(results.totalAnnualPremium)}</span>
                    </div>
                  </div>
                </div>

                {/* Employer Costs */}
                <div className="space-y-4">
                  <h4 className="font-medium text-green-700">Employer Contribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly</span>
                      <span className="font-medium text-green-700">{formatCurrency(results.employerMonthlyContribution)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual</span>
                      <span className="font-medium text-lg text-green-700">{formatCurrency(results.employerAnnualContribution)}</span>
                    </div>
                  </div>
                </div>

                {/* Employee Costs */}
                <div className="space-y-4">
                  <h4 className="font-medium text-blue-700">Employee Contribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly</span>
                      <span className="font-medium text-blue-700">{formatCurrency(results.employeeMonthlyContribution)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual</span>
                      <span className="font-medium text-lg text-blue-700">{formatCurrency(results.employeeAnnualContribution)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={calculateCosts}>
              <Calculator className="h-4 w-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};