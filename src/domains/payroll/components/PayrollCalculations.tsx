import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  AlertTriangle,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  company_id: string;
}

interface PayrollCalculationsProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

interface CalculationResult {
  employee_id: string;
  instructor_name: string;
  total_classes: number;
  total_class_pay: number;
  total_hours: number;
  overtime_hours: number;
  blended_rate: number;
  overtime_pay: number;
  gross_pay: number;
}

export const PayrollCalculations: React.FC<PayrollCalculationsProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      loadCalculations();
    }
  }, [selectedPeriod]);

  const loadCalculations = async () => {
    if (!selectedPeriod) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payroll_calculations')
        .select(`
          *,
          payroll_employees(instructor_name)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('gross_pay', { ascending: false });

      if (error) throw error;
      
      const formattedCalculations = data?.map(calc => ({
        employee_id: calc.payroll_employee_id,
        instructor_name: calc.payroll_employees?.instructor_name || 'Unknown',
        total_classes: calc.total_classes || 0,
        total_class_pay: calc.total_class_pay || 0,
        total_hours: (calc.total_regular_hours || 0) + (calc.total_overtime_hours || 0),
        overtime_hours: calc.total_overtime_hours || 0,
        blended_rate: calc.blended_rate || 0,
        overtime_pay: calc.overtime_pay || 0,
        gross_pay: calc.gross_pay || 0
      })) || [];

      setCalculations(formattedCalculations);
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayroll = async () => {
    if (!selectedPeriod) {
      toast({
        title: "Error",
        description: "No payroll period selected",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);
    setCalculationProgress(0);
    
    try {
      // Simulate progress steps
      const progressSteps = [
        { message: "Loading employee data...", progress: 20 },
        { message: "Calculating class pay...", progress: 40 },
        { message: "Processing time entries...", progress: 60 },
        { message: "Calculating overtime...", progress: 80 },
        { message: "Finalizing calculations...", progress: 100 }
      ];

      for (const step of progressSteps) {
        setCalculationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Call the edge function to calculate payroll
      const { data, error } = await supabase.functions.invoke('calculate-payroll-for-period', {
        body: { payroll_period_id: selectedPeriod.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll calculations completed successfully",
      });

      loadCalculations();
      onDataUpdate();
      
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast({
        title: "Error",
        description: "Failed to calculate payroll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
      setCalculationProgress(0);
    }
  };

  const handleRecalculate = async () => {
    // Clear existing calculations first
    try {
      await supabase
        .from('payroll_calculations')
        .delete()
        .eq('payroll_period_id', selectedPeriod?.id);
      
      setCalculations([]);
      handleCalculatePayroll();
    } catch (error) {
      console.error('Error clearing calculations:', error);
      toast({
        title: "Error",
        description: "Failed to clear existing calculations",
        variant: "destructive",
      });
    }
  };

  const totalGrossPay = calculations.reduce((sum, calc) => sum + calc.gross_pay, 0);
  const totalClassPay = calculations.reduce((sum, calc) => sum + calc.total_class_pay, 0);
  const totalOvertimePay = calculations.reduce((sum, calc) => sum + calc.overtime_pay, 0);
  const totalEmployees = calculations.length;

  if (!selectedPeriod) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="font-semibold text-yellow-800 mb-2">No Pay Period Selected</h3>
          <p className="text-yellow-700">
            Please select a pay period first to calculate payroll.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Calculations</h2>
          <p className="text-muted-foreground">
            Calculate California-compliant payroll with blended overtime rates
          </p>
        </div>
        
        <div className="flex gap-2">
          {calculations.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleRecalculate}
              disabled={calculating}
            >
              Recalculate
            </Button>
          )}
          <Button 
            onClick={handleCalculatePayroll}
            disabled={calculating}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {calculating ? 'Calculating...' : 'Calculate Payroll'}
          </Button>
        </div>
      </div>

      {/* Calculation Progress */}
      {calculating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-primary animate-pulse" />
                <span className="font-medium">Calculating Payroll...</span>
              </div>
              <Progress value={calculationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processing California wage & hour calculations with blended overtime rates
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Class Pay</p>
                  <p className="text-2xl font-bold text-blue-600">${totalClassPay.toFixed(2)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overtime Pay</p>
                  <p className="text-2xl font-bold text-orange-600">${totalOvertimePay.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gross Pay</p>
                  <p className="text-2xl font-bold text-green-600">${totalGrossPay.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculations Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payroll Calculations</span>
            {calculations.length > 0 && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Calculated
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No calculations performed yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Calculate Payroll" to process employee pay
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculations.map((calc) => (
                <div key={calc.employee_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">{calc.instructor_name}</h4>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        ${calc.gross_pay.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Gross Pay</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Classes</p>
                      <p className="font-semibold">{calc.total_classes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Class Pay</p>
                      <p className="font-semibold">${calc.total_class_pay.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Hours</p>
                      <p className="font-semibold">{calc.total_hours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overtime Hours</p>
                      <p className="font-semibold text-orange-600">{calc.overtime_hours.toFixed(1)}h</p>
                    </div>
                  </div>

                  {calc.overtime_hours > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Overtime Calculation (CA Blended Rate)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-orange-700">Blended Rate</p>
                          <p className="font-semibold">${calc.blended_rate.toFixed(2)}/hr</p>
                        </div>
                        <div>
                          <p className="text-orange-700">Overtime Pay (1.5x)</p>
                          <p className="font-semibold">${calc.overtime_pay.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">California Compliance</h3>
              <p className="text-sm text-blue-700">
                These calculations follow California Labor Code § 510 requirements for blended overtime rates. 
                Instructors who work both class-based and hourly positions receive overtime at 1.5x their blended rate 
                for hours exceeding 8 per day or 40 per week.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};