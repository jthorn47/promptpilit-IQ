import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Download,
  Plus,
  Calculator,
  FileText,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PayrollPeriodManager } from './PayrollPeriodManager';
import { PayrollClassEntry } from './PayrollClassEntry';
import { PayrollTimeEntry } from './PayrollTimeEntry';
import { PayrollCalculations } from './PayrollCalculations';
import { PayrollReports } from './PayrollReports';
import { EmployeeTaxProfiles } from './EmployeeTaxProfiles';
import { PayTypesManager } from './PayTypesManager';
import { ReportUploadAnalysis } from './ReportUploadAnalysis';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  company_id: string;
}

interface PayrollSummary {
  total_employees: number;
  total_classes: number;
  total_hours: number;
  total_overtime_hours: number;
  total_gross_pay: number;
  pending_periods: number;
}

export const F45PayrollDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPayrollData();
  }, [user]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      // Check if user is available
      if (!user?.id) {
        console.log('No user available yet, waiting...');
        setLoading(false);
        return;
      }
      
      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Try to continue with a default company setup
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        console.log('No company_id found for user profile');
        // Set empty state
        setPayrollPeriods([]);
        setPayrollSummary({
          total_employees: 0,
          total_classes: 0,
          total_hours: 0,
          total_overtime_hours: 0,
          total_gross_pay: 0,
          pending_periods: 0
        });
        setLoading(false);
        return;
      }

      // Fetch payroll periods
      const { data: periods, error: periodsError } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('start_date', { ascending: true });

      if (periodsError) {
        console.error('Error fetching periods:', periodsError);
        setPayrollPeriods([]);
      } else {
        setPayrollPeriods(periods || []);
        
        // Set most recent period as selected
        if (periods && periods.length > 0) {
          setSelectedPeriod(periods[0]);
        }
      }

      // Fetch payroll summary
      await fetchPayrollSummary(profile.company_id);
      
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast({
        title: "Error",
        description: "Failed to load payroll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollSummary = async (companyId: string) => {
    try {
      // Get employees count
      const { data: employees } = await supabase
        .from('payroll_employees')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_active', true);

      // Get current period calculations
      const { data: calculations } = await supabase
        .from('payroll_calculations')
        .select('*')
        .eq('payroll_period_id', selectedPeriod?.id || '');

      // Get pending periods
      const { data: pendingPeriods } = await supabase
        .from('payroll_periods')
        .select('id')
        .eq('company_id', companyId)
        .in('status', ['draft', 'processing']);

      const summary: PayrollSummary = {
        total_employees: employees?.length || 0,
        total_classes: calculations?.reduce((sum, calc) => sum + calc.total_classes, 0) || 0,
        total_hours: calculations?.reduce((sum, calc) => sum + calc.total_regular_hours + calc.total_overtime_hours, 0) || 0,
        total_overtime_hours: calculations?.reduce((sum, calc) => sum + calc.total_overtime_hours, 0) || 0,
        total_gross_pay: calculations?.reduce((sum, calc) => sum + calc.gross_pay, 0) || 0,
        pending_periods: pendingPeriods?.length || 0
      };

      setPayrollSummary(summary);
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">F45 Payroll Management</h1>
          <p className="text-muted-foreground">California wage & hour compliant payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab('periods')}>
            <Plus className="w-4 h-4 mr-2" />
            New Period
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('reports')}>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Instructors</p>
                <p className="text-2xl font-bold">{payrollSummary?.total_employees || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{payrollSummary?.total_classes || 0}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{payrollSummary?.total_hours?.toFixed(1) || '0.0'}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold text-orange-600">{payrollSummary?.total_overtime_hours?.toFixed(1) || '0.0'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gross Pay</p>
                <p className="text-2xl font-bold text-green-600">${payrollSummary?.total_gross_pay?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Period Info */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Pay Period</span>
              <Badge className={getStatusColor(selectedPeriod.status)}>
                {selectedPeriod.status.charAt(0).toUpperCase() + selectedPeriod.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-semibold">
                  {new Date(selectedPeriod.start_date).toLocaleDateString()} - {new Date(selectedPeriod.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('calculations')}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Payroll
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('reports')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">California Wage & Hour Compliance</h3>
              <p className="text-sm text-yellow-700">
                This system calculates payroll in compliance with California Labor Code § 510, including 
                blended overtime rates for instructors who work both class-based and hourly positions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="periods">Pay Periods</TabsTrigger>
          <TabsTrigger value="classes">Class Entry</TabsTrigger>
          <TabsTrigger value="time">Time Entry</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="tax-profiles">Tax Settings</TabsTrigger>
          <TabsTrigger value="pay-types">Pay Types</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Pay Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollPeriods.slice(0, 5).map((period) => (
                    <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{period.period_type}</p>
                      </div>
                      <Badge className={getStatusColor(period.status)}>
                        {period.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('classes')}
                  >
                    <CalendarDays className="w-6 h-6 mb-2" />
                    Enter Classes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('time')}
                  >
                    <Clock className="w-6 h-6 mb-2" />
                    Enter Hours
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('calculations')}
                  >
                    <Calculator className="w-6 h-6 mb-2" />
                    Calculate Pay
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('reports')}
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <ReportUploadAnalysis 
            selectedPeriod={selectedPeriod}
            onDataUpdate={fetchPayrollData}
          />
        </TabsContent>

        <TabsContent value="periods">
          <PayrollPeriodManager 
            periods={payrollPeriods}
            selectedPeriod={selectedPeriod}
            onPeriodSelect={setSelectedPeriod}
            onPeriodsUpdate={fetchPayrollData}
          />
        </TabsContent>

        <TabsContent value="classes">
          <PayrollClassEntry 
            selectedPeriod={selectedPeriod}
            onDataUpdate={fetchPayrollData}
          />
        </TabsContent>

        <TabsContent value="time">
          <PayrollTimeEntry 
            selectedPeriod={selectedPeriod}
            onDataUpdate={fetchPayrollData}
          />
        </TabsContent>

        <TabsContent value="calculations">
          <PayrollCalculations 
            selectedPeriod={selectedPeriod}
            onDataUpdate={fetchPayrollData}
          />
        </TabsContent>

        <TabsContent value="tax-profiles">
          <EmployeeTaxProfiles />
        </TabsContent>

        <TabsContent value="pay-types">
          <PayTypesManager companyId="demo-company" />
        </TabsContent>

        <TabsContent value="reports">
          <PayrollReports 
            selectedPeriod={selectedPeriod}
            payrollSummary={payrollSummary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};