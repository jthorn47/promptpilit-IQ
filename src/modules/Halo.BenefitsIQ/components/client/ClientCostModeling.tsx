// Client Cost Modeling - Advanced cost scenarios and projections
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  PieChart,
  BarChart3,
  Save,
  Download,
  Plus,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientCostModelingProps {
  companyId: string;
}

interface CostScenario {
  id?: string;
  name: string;
  description: string;
  employeeCount: number;
  tierDistribution: {
    employee: number;
    employeeSpouse: number;
    employeeChildren: number;
    family: number;
  };
  monthlyPremiums: {
    medical: number;
    dental: number;
    vision: number;
    life: number;
  };
  employerContribution: {
    medical: number;
    dental: number;
    vision: number;
    life: number;
  };
  annualCost: number;
  projectedGrowth: number;
}

export const ClientCostModeling: React.FC<ClientCostModelingProps> = ({ 
  companyId 
}) => {
  const [scenarios, setScenarios] = useState<CostScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<CostScenario>({
    name: 'Current Plan',
    description: 'Existing benefit structure',
    employeeCount: 45,
    tierDistribution: {
      employee: 20,
      employeeSpouse: 12,
      employeeChildren: 8,
      family: 5
    },
    monthlyPremiums: {
      medical: 450,
      dental: 45,
      vision: 15,
      life: 25
    },
    employerContribution: {
      medical: 80,
      dental: 100,
      vision: 100,
      life: 100
    },
    annualCost: 0,
    projectedGrowth: 5.5
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateCosts();
    loadScenarios();
  }, [companyId]);

  const loadScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('benefit_scenarios')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setScenarios(data.map(scenario => ({
          id: scenario.id,
          name: scenario.name,
          description: '',
          employeeCount: scenario.enrolled_employees || 45,
          tierDistribution: (scenario.tier_distribution as any) || {
            employee: 20, employeeSpouse: 12, employeeChildren: 8, family: 5
          },
          monthlyPremiums: (scenario.assumed_premiums as any) || {
            medical: 450, dental: 45, vision: 15, life: 25
          },
          employerContribution: (scenario.employer_contribution as any) || {
            medical: 80, dental: 100, vision: 100, life: 100
          },
          annualCost: scenario.annual_cost || 0,
          projectedGrowth: 5.5
        })));
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  };

  const calculateCosts = () => {
    const { tierDistribution, monthlyPremiums, employerContribution } = activeScenario;
    
    let totalAnnualCost = 0;
    
    // Calculate for each tier
    Object.entries(tierDistribution).forEach(([tier, count]) => {
      const tierMultiplier = tier === 'family' ? 2.5 : tier === 'employeeSpouse' ? 1.8 : tier === 'employeeChildren' ? 1.6 : 1;
      
      Object.entries(monthlyPremiums).forEach(([benefit, premium]) => {
        const employerPct = employerContribution[benefit as keyof typeof employerContribution] / 100;
        const employerCost = premium * tierMultiplier * employerPct;
        totalAnnualCost += employerCost * count * 12;
      });
    });

    setActiveScenario(prev => ({
      ...prev,
      annualCost: Math.round(totalAnnualCost)
    }));
  };

  const saveScenario = async () => {
    try {
      setLoading(true);
      
      const scenarioData = {
        company_id: companyId,
        name: activeScenario.name,
        enrolled_employees: activeScenario.employeeCount,
        tier_distribution: activeScenario.tierDistribution as any,
        assumed_premiums: activeScenario.monthlyPremiums as any,
        employer_contribution: activeScenario.employerContribution as any,
        annual_cost: activeScenario.annualCost,
        monthly_cost: Math.round(activeScenario.annualCost / 12)
      };

      const { error } = await supabase
        .from('benefit_scenarios')
        .insert(scenarioData);

      if (error) throw error;
      
      await loadScenarios();
    } catch (error) {
      console.error('Error saving scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateScenarioField = (field: string, value: any) => {
    setActiveScenario(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: number) => {
    setActiveScenario(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CostScenario] as any,
        [field]: value
      }
    }));
    setTimeout(calculateCosts, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cost Modeling & Scenarios
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Model different benefit scenarios and project costs
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveScenario} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modeling Inputs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="demographics" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="premiums">Premiums</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            <TabsContent value="demographics">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input
                      id="scenario-name"
                      value={activeScenario.name}
                      onChange={(e) => updateScenarioField('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employee-count">Total Employees</Label>
                    <Input
                      id="employee-count"
                      type="number"
                      value={activeScenario.employeeCount}
                      onChange={(e) => updateScenarioField('employeeCount', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee-only">Employee Only</Label>
                      <Input
                        id="employee-only"
                        type="number"
                        value={activeScenario.tierDistribution.employee}
                        onChange={(e) => updateNestedField('tierDistribution', 'employee', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee-spouse">Employee + Spouse</Label>
                      <Input
                        id="employee-spouse"
                        type="number"
                        value={activeScenario.tierDistribution.employeeSpouse}
                        onChange={(e) => updateNestedField('tierDistribution', 'employeeSpouse', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee-children">Employee + Children</Label>
                      <Input
                        id="employee-children"
                        type="number"
                        value={activeScenario.tierDistribution.employeeChildren}
                        onChange={(e) => updateNestedField('tierDistribution', 'employeeChildren', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="family">Family</Label>
                      <Input
                        id="family"
                        type="number"
                        value={activeScenario.tierDistribution.family}
                        onChange={(e) => updateNestedField('tierDistribution', 'family', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="premiums">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Premiums (Employee Only)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medical-premium">Medical</Label>
                      <Input
                        id="medical-premium"
                        type="number"
                        value={activeScenario.monthlyPremiums.medical}
                        onChange={(e) => updateNestedField('monthlyPremiums', 'medical', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dental-premium">Dental</Label>
                      <Input
                        id="dental-premium"
                        type="number"
                        value={activeScenario.monthlyPremiums.dental}
                        onChange={(e) => updateNestedField('monthlyPremiums', 'dental', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vision-premium">Vision</Label>
                      <Input
                        id="vision-premium"
                        type="number"
                        value={activeScenario.monthlyPremiums.vision}
                        onChange={(e) => updateNestedField('monthlyPremiums', 'vision', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="life-premium">Life Insurance</Label>
                      <Input
                        id="life-premium"
                        type="number"
                        value={activeScenario.monthlyPremiums.life}
                        onChange={(e) => updateNestedField('monthlyPremiums', 'life', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contributions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employer Contribution %</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medical-contribution">Medical</Label>
                      <Input
                        id="medical-contribution"
                        type="number"
                        max="100"
                        value={activeScenario.employerContribution.medical}
                        onChange={(e) => updateNestedField('employerContribution', 'medical', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dental-contribution">Dental</Label>
                      <Input
                        id="dental-contribution"
                        type="number"
                        max="100"
                        value={activeScenario.employerContribution.dental}
                        onChange={(e) => updateNestedField('employerContribution', 'dental', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vision-contribution">Vision</Label>
                      <Input
                        id="vision-contribution"
                        type="number"
                        max="100"
                        value={activeScenario.employerContribution.vision}
                        onChange={(e) => updateNestedField('employerContribution', 'vision', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="life-contribution">Life Insurance</Label>
                      <Input
                        id="life-contribution"
                        type="number"
                        max="100"
                        value={activeScenario.employerContribution.life}
                        onChange={(e) => updateNestedField('employerContribution', 'life', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projections">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Projections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="projected-growth">Annual Premium Growth Rate (%)</Label>
                    <Input
                      id="projected-growth"
                      type="number"
                      step="0.1"
                      value={activeScenario.projectedGrowth}
                      onChange={(e) => updateScenarioField('projectedGrowth', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${Math.round(activeScenario.annualCost * 1.055).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Year 2 Projection</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${Math.round(activeScenario.annualCost * Math.pow(1.055, 2)).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Year 3 Projection</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${Math.round(activeScenario.annualCost * Math.pow(1.055, 4)).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">5-Year Projection</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${activeScenario.annualCost.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Annual Employer Cost</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Cost</span>
                  <span className="font-medium">${Math.round(activeScenario.annualCost / 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Per Employee/Month</span>
                  <span className="font-medium">${Math.round(activeScenario.annualCost / 12 / activeScenario.employeeCount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Per Employee/Year</span>
                  <span className="font-medium">${Math.round(activeScenario.annualCost / activeScenario.employeeCount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scenarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved scenarios yet
                  </p>
                ) : (
                  scenarios.map((scenario) => (
                    <div key={scenario.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${scenario.annualCost.toLocaleString()}/year
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};