import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Calculator, TrendingUp, Save, Download, Play } from 'lucide-react';
import { useCreateCostModel, useUpdateCostModel } from '../hooks/useBenefitsIQ';

interface CostModelerProps {
  companyId: string;
}

interface ModelScenario {
  name: string;
  type: 'contribution_change' | 'plan_design' | 'enrollment_scenario';
  inputs: {
    currentContribution: number;
    proposedContribution: number;
    employeeCount: number;
    averageSalary: number;
    planType: string;
    deductible: number;
    coinsurance: number;
    outOfPocketMax: number;
  };
  results?: {
    employerSavings: number;
    employeeImpact: number;
    totalCostChange: number;
    participationImpact: number;
  };
}

export const CostModeler: React.FC<CostModelerProps> = ({ companyId }) => {
  console.log('🔧 CostModeler component rendering with companyId:', companyId);
  const [activeModel, setActiveModel] = useState<ModelScenario>({
    name: 'New Cost Model',
    type: 'contribution_change',
    inputs: {
      currentContribution: 80,
      proposedContribution: 75,
      employeeCount: 150,
      averageSalary: 65000,
      planType: 'ppo',
      deductible: 1500,
      coinsurance: 80,
      outOfPocketMax: 6000
    }
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [savedModels, setSavedModels] = useState<ModelScenario[]>([]);

  const createModel = useCreateCostModel();
  const updateModel = useUpdateCostModel();

  const calculateModel = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock calculation results
    const results = {
      employerSavings: calculateEmployerSavings(),
      employeeImpact: calculateEmployeeImpact(),
      totalCostChange: calculateTotalCostChange(),
      participationImpact: calculateParticipationImpact()
    };

    setActiveModel(prev => ({ ...prev, results }));
    setIsCalculating(false);
  };

  const calculateEmployerSavings = () => {
    const { currentContribution, proposedContribution, employeeCount, averageSalary } = activeModel.inputs;
    const contributionDiff = (currentContribution - proposedContribution) / 100;
    const avgMonthlyCost = (averageSalary * 0.15) / 12; // Assume 15% of salary for benefits
    return contributionDiff * avgMonthlyCost * employeeCount * 12;
  };

  const calculateEmployeeImpact = () => {
    const { currentContribution, proposedContribution, averageSalary } = activeModel.inputs;
    const contributionDiff = (proposedContribution - currentContribution) / 100;
    const avgMonthlyCost = (averageSalary * 0.15) / 12;
    return contributionDiff * avgMonthlyCost * 12;
  };

  const calculateTotalCostChange = () => {
    const employerSavings = calculateEmployerSavings();
    const employeeImpact = calculateEmployeeImpact();
    return employerSavings + (employeeImpact * activeModel.inputs.employeeCount);
  };

  const calculateParticipationImpact = () => {
    const { currentContribution, proposedContribution } = activeModel.inputs;
    const contributionIncrease = proposedContribution - currentContribution;
    // Simple model: each 5% increase in employee contribution reduces participation by 2%
    return Math.max(0, contributionIncrease * -0.4);
  };

  const saveModel = async () => {
    try {
      await createModel.mutateAsync({
        company_id: companyId,
        model_name: activeModel.name,
        model_type: activeModel.type,
        base_data: { inputs: activeModel.inputs },
        scenario_data: { results: activeModel.results },
        calculated_results: activeModel.results || {},
        created_by: 'current-user-id', // TODO: Get from auth
        is_saved: true
      });
      
      setSavedModels(prev => [...prev, activeModel]);
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cost Modeler</h2>
          <p className="text-muted-foreground">Simulate contribution changes and plan design scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveModel} disabled={!activeModel.results}>
            <Save className="h-4 w-4 mr-2" />
            Save Model
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button onClick={calculateModel} disabled={isCalculating}>
            <Play className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Run Model'}
          </Button>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
              <CardDescription>Configure your cost modeling scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="contribution" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="contribution">Contribution</TabsTrigger>
                  <TabsTrigger value="plan">Plan Design</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                </TabsList>

                <TabsContent value="contribution" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Current Employer Contribution</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[activeModel.inputs.currentContribution]}
                          onValueChange={(value) => 
                            setActiveModel(prev => ({
                              ...prev,
                              inputs: { ...prev.inputs, currentContribution: value[0] }
                            }))
                          }
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0%</span>
                          <span className="font-medium">{activeModel.inputs.currentContribution}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Proposed Employer Contribution</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[activeModel.inputs.proposedContribution]}
                          onValueChange={(value) => 
                            setActiveModel(prev => ({
                              ...prev,
                              inputs: { ...prev.inputs, proposedContribution: value[0] }
                            }))
                          }
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0%</span>
                          <span className="font-medium">{activeModel.inputs.proposedContribution}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Preview */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Impact Preview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Employee Contribution Change:</span>
                        <div className="font-medium">
                          {activeModel.inputs.currentContribution > activeModel.inputs.proposedContribution ? (
                            <span className="text-red-600">
                              +{activeModel.inputs.currentContribution - activeModel.inputs.proposedContribution}%
                            </span>
                          ) : (
                            <span className="text-green-600">
                              {activeModel.inputs.proposedContribution - activeModel.inputs.currentContribution}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Strategy Type:</span>
                        <div className="font-medium">
                          {activeModel.inputs.currentContribution > activeModel.inputs.proposedContribution 
                            ? 'Cost Shifting' 
                            : 'Enhanced Benefits'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="planType">Plan Type</Label>
                      <Select 
                        value={activeModel.inputs.planType} 
                        onValueChange={(value) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, planType: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hmo">HMO</SelectItem>
                          <SelectItem value="ppo">PPO</SelectItem>
                          <SelectItem value="epo">EPO</SelectItem>
                          <SelectItem value="hdhp">HDHP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deductible">Annual Deductible</Label>
                      <Input
                        type="number"
                        value={activeModel.inputs.deductible}
                        onChange={(e) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, deductible: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coinsurance">Coinsurance (%)</Label>
                      <Input
                        type="number"
                        value={activeModel.inputs.coinsurance}
                        onChange={(e) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, coinsurance: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outOfPocketMax">Out-of-Pocket Maximum</Label>
                      <Input
                        type="number"
                        value={activeModel.inputs.outOfPocketMax}
                        onChange={(e) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, outOfPocketMax: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Input
                        type="number"
                        value={activeModel.inputs.employeeCount}
                        onChange={(e) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, employeeCount: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="averageSalary">Average Salary</Label>
                      <Input
                        type="number"
                        value={activeModel.inputs.averageSalary}
                        onChange={(e) => 
                          setActiveModel(prev => ({
                            ...prev,
                            inputs: { ...prev.inputs, averageSalary: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Results</CardTitle>
              <CardDescription>Financial impact analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {activeModel.results ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(activeModel.results.employerSavings)}
                    </div>
                    <div className="text-sm text-green-600">Annual Employer Savings</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Employee Impact:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(activeModel.results.employeeImpact)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Cost Change:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(activeModel.results.totalCostChange)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Participation Impact:</span>
                      <span className="font-medium text-orange-600">
                        {formatPercentage(activeModel.results.participationImpact)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Badge className="w-full justify-center bg-blue-100 text-blue-800">
                      Model Complete
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Configure parameters and run model to see results</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Scenarios</CardTitle>
              <CardDescription>Common modeling scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveModel(prev => ({
                    ...prev,
                    inputs: { ...prev.inputs, currentContribution: 80, proposedContribution: 75 }
                  }))}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  80% to 75% Contribution
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveModel(prev => ({
                    ...prev,
                    inputs: { ...prev.inputs, deductible: 2000, outOfPocketMax: 7000 }
                  }))}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Higher Deductible Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setActiveModel(prev => ({
                    ...prev,
                    inputs: { ...prev.inputs, planType: 'hdhp', deductible: 3000 }
                  }))}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  HDHP with HSA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};