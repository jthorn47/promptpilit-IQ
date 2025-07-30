import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface ScenarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenarioCreated: () => void;
}

interface ScenarioData {
  name: string;
  enrolledEmployees: number;
  tierDistribution: {
    employeeOnly: number;
    employeeSpouse: number;
    employeeChild: number;
    family: number;
  };
  assumedPremiums: {
    employeeOnly: number;
    employeeSpouse: number;
    employeeChild: number;
    family: number;
  };
  employerContribution: {
    type: 'percentage' | 'flat_dollar';
    employeeOnly: number;
    employeeSpouse: number;
    employeeChild: number;
    family: number;
  };
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  open,
  onOpenChange,
  onScenarioCreated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<ScenarioData>({
    name: '',
    enrolledEmployees: 150,
    tierDistribution: {
      employeeOnly: 40,
      employeeSpouse: 30,
      employeeChild: 20,
      family: 10
    },
    assumedPremiums: {
      employeeOnly: 650,
      employeeSpouse: 1200,
      employeeChild: 1100,
      family: 1850
    },
    employerContribution: {
      type: 'percentage',
      employeeOnly: 80,
      employeeSpouse: 75,
      employeeChild: 75,
      family: 70
    }
  });

  const calculateMonthlyCost = () => {
    const { enrolledEmployees, tierDistribution, assumedPremiums, employerContribution } = scenario;
    
    let totalCost = 0;
    
    // Calculate for each tier
    Object.keys(tierDistribution).forEach((tier) => {
      const tierKey = tier as keyof typeof tierDistribution;
      const employeeCount = Math.round((enrolledEmployees * tierDistribution[tierKey]) / 100);
      const premium = assumedPremiums[tierKey];
      const contribution = employerContribution.type === 'percentage' 
        ? (premium * employerContribution[tierKey]) / 100
        : employerContribution[tierKey];
      
      totalCost += employeeCount * contribution;
    });
    
    return totalCost;
  };

  const handleSave = async () => {
    if (!scenario.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a scenario name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const monthlyCost = calculateMonthlyCost();
      const annualCost = monthlyCost * 12;

      const { error } = await supabase
        .from('benefit_scenarios')
        .insert({
          company_id: 'demo-company-id', // In real app, get from auth context
          name: scenario.name,
          enrolled_employees: scenario.enrolledEmployees,
          tier_distribution: scenario.tierDistribution,
          employer_contribution: scenario.employerContribution,
          assumed_premiums: scenario.assumedPremiums,
          monthly_cost: monthlyCost,
          annual_cost: annualCost
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scenario created successfully"
      });

      onScenarioCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast({
        title: "Error",
        description: "Failed to save scenario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Cost Scenario</DialogTitle>
          <DialogDescription>
            Define enrollment assumptions and contribution strategies to model costs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scenarioName">Scenario Name</Label>
                <Input
                  id="scenarioName"
                  value={scenario.name}
                  onChange={(e) => setScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 2025 Budget Scenario"
                />
              </div>
              <div>
                <Label htmlFor="employeeCount">Number of Enrolled Employees</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={scenario.enrolledEmployees}
                  onChange={(e) => setScenario(prev => ({ 
                    ...prev, 
                    enrolledEmployees: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Coverage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Coverage Distribution (%)</CardTitle>
              <CardDescription>How employees are distributed across coverage tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(scenario.tierDistribution).map(([tier, value]) => (
                <div key={tier} className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="capitalize">
                      {tier.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => 
                      setScenario(prev => ({
                        ...prev,
                        tierDistribution: {
                          ...prev.tierDistribution,
                          [tier]: newValue[0]
                        }
                      }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="text-sm text-muted-foreground">
                Total: {Object.values(scenario.tierDistribution).reduce((sum, val) => sum + val, 0)}%
              </div>
            </CardContent>
          </Card>

          {/* Premium Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Premium Assumptions</CardTitle>
              <CardDescription>Average monthly premium per tier</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.entries(scenario.assumedPremiums).map(([tier, value]) => (
                <div key={tier} className="space-y-2">
                  <Label className="capitalize">
                    {tier.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => 
                      setScenario(prev => ({
                        ...prev,
                        assumedPremiums: {
                          ...prev.assumedPremiums,
                          [tier]: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    placeholder="Monthly premium"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Employer Contribution Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Employer Contribution Strategy</CardTitle>
              <CardDescription>How much the employer contributes per tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contribution Type</Label>
                <Select
                  value={scenario.employerContribution.type}
                  onValueChange={(value: 'percentage' | 'flat_dollar') => 
                    setScenario(prev => ({
                      ...prev,
                      employerContribution: {
                        ...prev.employerContribution,
                        type: value
                      }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage of Premium</SelectItem>
                    <SelectItem value="flat_dollar">Flat Dollar Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(scenario.employerContribution).map(([tier, value]) => {
                  if (tier === 'type') return null;
                  
                  return (
                    <div key={tier} className="space-y-2">
                      <Label className="capitalize">
                        {tier.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => 
                          setScenario(prev => ({
                            ...prev,
                            employerContribution: {
                              ...prev.employerContribution,
                              [tier]: parseInt(e.target.value) || 0
                            }
                          }))
                        }
                        placeholder={scenario.employerContribution.type === 'percentage' ? 'Percentage' : 'Dollar amount'}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cost Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${calculateMonthlyCost().toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Monthly Cost</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${(calculateMonthlyCost() * 12).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Annual Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Scenario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};