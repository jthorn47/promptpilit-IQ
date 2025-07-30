import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate?: number;
  salary?: number;
  pay_type: 'hourly' | 'salary';
  is_exempt?: boolean;
  location?: string;
  state?: string;
  city?: string;
  job_title?: string;
}

interface WageRule {
  id: string;
  jurisdiction_level: string;
  jurisdiction_name: string;
  state_code?: string;
  city_name?: string;
  minimum_hourly?: number;
  tipped_hourly?: number;
  exempt_weekly?: number;
  exempt_annual?: number;
  effective_date: string;
  source_url?: string;
  is_override: boolean;
}

interface ComplianceResult {
  status: 'compliant' | 'non_compliant' | 'insufficient_data';
  applicable_rule?: WageRule;
  required_rate?: number;
  actual_rate?: number;
  gap_amount?: number;
  message: string;
}

interface WageCheckIQProps {
  employee: Employee;
  companyId?: string;
}

export const WageCheckIQ: React.FC<WageCheckIQProps> = ({ employee, companyId }) => {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [allRules, setAllRules] = useState<WageRule[]>([]);

  useEffect(() => {
    checkWageCompliance();
  }, [employee]);

  const checkWageCompliance = async () => {
    try {
      setLoading(true);
      
      // Get applicable wage rules for this employee's location
      const { data: rules, error } = await supabase
        .from('wage_rules')
        .select('*')
        .eq('is_active', true)
        .order('jurisdiction_level', { ascending: false }); // City > County > State > Federal

      if (error) throw error;

      setAllRules(rules || []);

      // Find the most specific applicable rule
      const applicableRule = findApplicableRule(rules || [], employee);
      
      if (!applicableRule) {
        setComplianceResult({
          status: 'insufficient_data',
          message: `No wage data available for ${employee.state || 'location'}`
        });
        return;
      }

      // Calculate compliance
      const result = calculateCompliance(employee, applicableRule);
      setComplianceResult(result);

      // Store compliance check in database
      if (companyId) {
        await supabase.from('employee_wage_compliance').insert([{
          employee_id: employee.id,
          compliance_status: result.status,
          wage_type: employee.pay_type,
          applicable_jurisdiction: applicableRule.jurisdiction_name,
          required_rate: result.required_rate,
          actual_rate: result.actual_rate,
          gap_amount: result.gap_amount,
          wage_rule_id: applicableRule.id,
          violation_details: result.status === 'non_compliant' ? { message: result.message } : null
        }]);
      }

    } catch (error) {
      console.error('Error checking wage compliance:', error);
      toast.error('Failed to check wage compliance');
      setComplianceResult({
        status: 'insufficient_data',
        message: 'Error checking compliance'
      });
    } finally {
      setLoading(false);
    }
  };

  const findApplicableRule = (rules: WageRule[], emp: Employee): WageRule | null => {
    // Priority: City > County > State > Federal
    const stateCode = emp.state?.toUpperCase();
    
    // Try to find city-specific rule
    if (emp.city) {
      const cityRule = rules.find(rule => 
        rule.jurisdiction_level === 'city' && 
        rule.city_name?.toLowerCase() === emp.city?.toLowerCase() &&
        rule.state_code === stateCode
      );
      if (cityRule) return cityRule;
    }

    // Try to find state-specific rule
    if (stateCode) {
      const stateRule = rules.find(rule => 
        rule.jurisdiction_level === 'state' && 
        rule.state_code === stateCode
      );
      if (stateRule) return stateRule;
    }

    // Fall back to federal rule
    const federalRule = rules.find(rule => rule.jurisdiction_level === 'federal');
    return federalRule || null;
  };

  const calculateCompliance = (emp: Employee, rule: WageRule): ComplianceResult => {
    if (emp.pay_type === 'hourly') {
      const actualRate = emp.hourly_rate || 0;
      const requiredRate = rule.minimum_hourly || 0;
      
      if (actualRate >= requiredRate) {
        return {
          status: 'compliant',
          applicable_rule: rule,
          required_rate: requiredRate,
          actual_rate: actualRate,
          message: `Compliant: $${actualRate.toFixed(2)}/hr meets $${requiredRate.toFixed(2)}/hr minimum`
        };
      } else {
        const gap = requiredRate - actualRate;
        return {
          status: 'non_compliant',
          applicable_rule: rule,
          required_rate: requiredRate,
          actual_rate: actualRate,
          gap_amount: gap,
          message: `Non-compliant: $${actualRate.toFixed(2)}/hr is $${gap.toFixed(2)} below required $${requiredRate.toFixed(2)}/hr`
        };
      }
    } else {
      // Salary/Exempt worker
      const annualSalary = emp.salary || 0;
      const requiredAnnual = rule.exempt_annual || 0;
      
      if (!requiredAnnual) {
        return {
          status: 'insufficient_data',
          applicable_rule: rule,
          message: 'No exempt salary threshold data available for this jurisdiction'
        };
      }
      
      if (annualSalary >= requiredAnnual) {
        return {
          status: 'compliant',
          applicable_rule: rule,
          required_rate: requiredAnnual,
          actual_rate: annualSalary,
          message: `Compliant: $${annualSalary.toLocaleString()}/year meets $${requiredAnnual.toLocaleString()}/year minimum`
        };
      } else {
        const gap = requiredAnnual - annualSalary;
        return {
          status: 'non_compliant',
          applicable_rule: rule,
          required_rate: requiredAnnual,
          actual_rate: annualSalary,
          gap_amount: gap,
          message: `Non-compliant: $${annualSalary.toLocaleString()}/year is $${gap.toLocaleString()} below required $${requiredAnnual.toLocaleString()}/year`
        };
      }
    }
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>;
    
    if (!complianceResult) return <Badge variant="secondary">Unknown</Badge>;

    switch (complianceResult.status) {
      case 'compliant':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">✅ Compliant</Badge>;
      case 'non_compliant':
        return <Badge variant="destructive">⚠️ Non-Compliant</Badge>;
      case 'insufficient_data':
        return <Badge variant="secondary">🛑 Insufficient Data</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    
    switch (complianceResult?.status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'insufficient_data':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            WageCheckIQ
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          {complianceResult?.message || 'Checking wage compliance...'}
        </div>
        
        {complianceResult?.applicable_rule && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Based on {complianceResult.applicable_rule.jurisdiction_name} rates</span>
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    Wage Compliance Details - {employee.first_name} {employee.last_name}
                  </DialogTitle>
                </DialogHeader>
                <WageComplianceDetails 
                  employee={employee}
                  complianceResult={complianceResult}
                  allRules={allRules}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={checkWageCompliance}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          {complianceResult?.applicable_rule?.source_url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a 
                href={complianceResult.applicable_rule.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Source
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface WageComplianceDetailsProps {
  employee: Employee;
  complianceResult: ComplianceResult;
  allRules: WageRule[];
}

const WageComplianceDetails: React.FC<WageComplianceDetailsProps> = ({ 
  employee, 
  complianceResult, 
  allRules 
}) => {
  const applicableRules = allRules.filter(rule => {
    const stateCode = employee.state?.toUpperCase();
    return rule.jurisdiction_level === 'federal' || rule.state_code === stateCode;
  });

  return (
    <div className="space-y-6">
      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Employee Information</h4>
          <div className="space-y-1 text-sm">
            <div>Name: {employee.first_name} {employee.last_name}</div>
            <div>Pay Type: {employee.pay_type}</div>
            <div>
              Current Rate: {employee.pay_type === 'hourly' 
                ? `$${employee.hourly_rate?.toFixed(2) || '0.00'}/hr`
                : `$${employee.salary?.toLocaleString() || '0'}/year`
              }
            </div>
            <div>Location: {employee.city ? `${employee.city}, ` : ''}{employee.state || 'Unknown'}</div>
            <div>Job Title: {employee.job_title || 'Not specified'}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Compliance Status</h4>
          <div className="space-y-1 text-sm">
            <div>Status: {getStatusBadge()}</div>
            <div>
              Required Rate: {complianceResult.required_rate 
                ? (employee.pay_type === 'hourly' 
                  ? `$${complianceResult.required_rate.toFixed(2)}/hr`
                  : `$${complianceResult.required_rate.toLocaleString()}/year`)
                : 'N/A'
              }
            </div>
            {complianceResult.gap_amount && (
              <div className="text-destructive">
                Gap: ${employee.pay_type === 'hourly' 
                  ? complianceResult.gap_amount.toFixed(2)
                  : complianceResult.gap_amount.toLocaleString()
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicable Rules */}
      <div>
        <h4 className="font-medium mb-2">Applicable Wage Rules</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jurisdiction</TableHead>
              <TableHead>Min Hourly</TableHead>
              <TableHead>Exempt Annual</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicableRules.map((rule) => (
              <TableRow 
                key={rule.id}
                className={rule.id === complianceResult.applicable_rule?.id ? 'bg-muted' : ''}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{rule.jurisdiction_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.jurisdiction_level} {rule.state_code && `(${rule.state_code})`}
                    </div>
                  </div>
                </TableCell>
                <TableCell>${rule.minimum_hourly?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>${rule.exempt_annual?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>{format(new Date(rule.effective_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {rule.is_override ? (
                    <Badge variant="secondary">Manual Override</Badge>
                  ) : (
                    <Badge variant="outline">Government Source</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  function getStatusBadge() {
    switch (complianceResult.status) {
      case 'compliant':
        return <Badge variant="default" className="bg-green-500">Compliant</Badge>;
      case 'non_compliant':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case 'insufficient_data':
        return <Badge variant="secondary">Insufficient Data</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }
};