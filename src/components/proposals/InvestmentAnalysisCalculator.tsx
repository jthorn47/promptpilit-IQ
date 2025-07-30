import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InvestmentAnalysisConfig {
  id: string;
  company_id: string;
  config_name: string;
  hourly_admin_cost: number;
  hourly_manager_cost: number;
  overhead_multiplier?: number;
  aso_cost_per_employee: number;
  service_pricing?: any;
  industry_benchmarks?: any;
  avg_hiring_cost: number;
  compliance_risk_factor: number;
  created_at: string;
  updated_at: string;
}

interface CalculationResults {
  currentCosts: {
    hrStaffCosts: number;
    benefitsAdminCosts: number;
    complianceCosts: number;
    trainingCosts: number;
    systemsCosts: number;
    totalCosts: number;
  };
  proposedCosts: {
    monthlyServiceFee: number;
    implementationCost: number;
    totalFirstYear: number;
    ongoingAnnual: number;
  };
  savings: {
    firstYearSavings: number;
    ongoingAnnualSavings: number;
    threeYearSavings: number;
    roiPercentage: number;
    paybackMonths: number;
  };
}

interface InvestmentAnalysisCalculatorProps {
  companyData?: {
    max_employees: number;
    industry?: string;
  };
  onResultsChange?: (results: CalculationResults) => void;
}

export default function InvestmentAnalysisCalculator({ 
  companyData,
  onResultsChange 
}: InvestmentAnalysisCalculatorProps) {
  const [config, setConfig] = useState<InvestmentAnalysisConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Input parameters
  const [employees, setEmployees] = useState(companyData?.max_employees || 50);
  const [avgSalary, setAvgSalary] = useState(65000);
  const [hrStaffCount, setHrStaffCount] = useState(1);
  const [hrSalary, setHrSalary] = useState(75000);
  const [benefitsComplexity, setBenefitsComplexity] = useState([50]); // 0-100 scale
  const [complianceRisk, setComplianceRisk] = useState([30]); // 0-100 scale
  
  // Calculation results
  const [results, setResults] = useState<CalculationResults | null>(null);

  useEffect(() => {
    fetchInvestmentConfig();
  }, []);

  useEffect(() => {
    if (config) {
      calculateInvestmentAnalysis();
    }
  }, [employees, avgSalary, hrStaffCount, hrSalary, benefitsComplexity, complianceRisk, config]);

  const fetchInvestmentConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_analysis_configs')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching investment config:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInvestmentAnalysis = () => {
    if (!config) return;

    // Current costs calculation
    const hrStaffCosts = hrStaffCount * hrSalary * (config.overhead_multiplier || 1.3);
    const benefitsAdminCosts = employees * (100 + benefitsComplexity[0] * 2); // Base $100 + complexity factor
    const complianceCosts = Math.max(5000, employees * 50 * (1 + complianceRisk[0] / 100));
    const trainingCosts = employees * 200; // $200 per employee per year
    const systemsCosts = Math.max(2000, employees * 25); // HRIS and other systems
    const totalCurrentCosts = hrStaffCosts + benefitsAdminCosts + complianceCosts + trainingCosts + systemsCosts;

    // Proposed costs (from service pricing in config)
    const baseServiceFee = config.service_pricing?.base_monthly_fee || 2500;
    const perEmployeeFee = config.service_pricing?.per_employee_fee || 45;
    const monthlyServiceFee = baseServiceFee + (employees * perEmployeeFee);
    const implementationCost = config.service_pricing?.implementation_fee || 5000;
    const totalFirstYear = (monthlyServiceFee * 12) + implementationCost;
    const ongoingAnnual = monthlyServiceFee * 12;

    // Savings calculation
    const firstYearSavings = totalCurrentCosts - totalFirstYear;
    const ongoingAnnualSavings = totalCurrentCosts - ongoingAnnual;
    const threeYearSavings = (totalCurrentCosts * 3) - (totalFirstYear + (ongoingAnnual * 2));
    const roiPercentage = totalFirstYear > 0 ? (firstYearSavings / totalFirstYear) * 100 : 0;
    const paybackMonths = firstYearSavings > 0 ? (implementationCost / (firstYearSavings / 12)) : 0;

    const calculationResults: CalculationResults = {
      currentCosts: {
        hrStaffCosts,
        benefitsAdminCosts,
        complianceCosts,
        trainingCosts,
        systemsCosts,
        totalCosts: totalCurrentCosts,
      },
      proposedCosts: {
        monthlyServiceFee,
        implementationCost,
        totalFirstYear,
        ongoingAnnual,
      },
      savings: {
        firstYearSavings,
        ongoingAnnualSavings,
        threeYearSavings,
        roiPercentage,
        paybackMonths,
      },
    };

    setResults(calculationResults);
    onResultsChange?.(calculationResults);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Analysis Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Company Details
              </h4>
              
              <div className="space-y-2">
                <Label>Number of Employees</Label>
                <Input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Average Employee Salary</Label>
                <Input
                  type="number"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current HR Structure
              </h4>
              
              <div className="space-y-2">
                <Label>Internal HR Staff Count</Label>
                <Input
                  type="number"
                  value={hrStaffCount}
                  onChange={(e) => setHrStaffCount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Average HR Staff Salary</Label>
                <Input
                  type="number"
                  value={hrSalary}
                  onChange={(e) => setHrSalary(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Benefits Administration Complexity: {benefitsComplexity[0]}%</Label>
              <Slider
                value={benefitsComplexity}
                onValueChange={setBenefitsComplexity}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher complexity = more plans, carriers, and administrative overhead
              </p>
            </div>

            <div className="space-y-2">
              <Label>Compliance Risk Level: {complianceRisk[0]}%</Label>
              <Slider
                value={complianceRisk}
                onValueChange={setComplianceRisk}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher risk = more regulatory requirements and potential penalties
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Current Costs Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Current Annual HR Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>HR Staff Costs (incl. overhead)</span>
                  <span className="font-medium">{formatCurrency(results.currentCosts.hrStaffCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Benefits Administration</span>
                  <span className="font-medium">{formatCurrency(results.currentCosts.benefitsAdminCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance & Legal</span>
                  <span className="font-medium">{formatCurrency(results.currentCosts.complianceCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training & Development</span>
                  <span className="font-medium">{formatCurrency(results.currentCosts.trainingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HR Systems & Technology</span>
                  <span className="font-medium">{formatCurrency(results.currentCosts.systemsCosts)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Annual Costs</span>
                    <span>{formatCurrency(results.currentCosts.totalCosts)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposed Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Easeworks Service Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Monthly Service Fee</span>
                  <span className="font-medium">{formatCurrency(results.proposedCosts.monthlyServiceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>One-time Implementation</span>
                  <span className="font-medium">{formatCurrency(results.proposedCosts.implementationCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>First Year Total</span>
                  <span className="font-medium">{formatCurrency(results.proposedCosts.totalFirstYear)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Ongoing Annual Cost</span>
                    <span>{formatCurrency(results.proposedCosts.ongoingAnnual)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Investment Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.savings.firstYearSavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">First Year Savings</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.savings.ongoingAnnualSavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Savings</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.savings.roiPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI Percentage</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                    <Clock className="h-5 w-5" />
                    {results.savings.paybackMonths.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Payback (Months)</div>
                </div>
                
                <div className="text-center p-4 bg-indigo-50 rounded-lg md:col-span-2">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(results.savings.threeYearSavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Three Year Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}