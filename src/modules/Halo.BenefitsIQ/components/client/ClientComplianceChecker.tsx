// Client Compliance Checker - ACA and compliance monitoring
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  RefreshCw,
  Info,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientComplianceCheckerProps {
  companyId: string;
}

interface ComplianceRule {
  id: string;
  category: 'ACA' | 'ERISA' | 'HIPAA' | 'State';
  rule: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'warning' | 'needs-review';
  lastChecked: string;
  nextReview: string;
  details?: string;
}

interface ACAAffordabilityTest {
  planName: string;
  employeePremium: number;
  safeHarborThreshold: number;
  isAffordable: boolean;
  safeHarborMethod: string;
}

interface MinimumValueTest {
  planName: string;
  mvPercentage: number;
  isCompliant: boolean;
  details: string;
}

export const ClientComplianceChecker: React.FC<ClientComplianceCheckerProps> = ({ 
  companyId 
}) => {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [acaTests, setAcaTests] = useState<ACAAffordabilityTest[]>([]);
  const [mvTests, setMvTests] = useState<MinimumValueTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<string>('');

  useEffect(() => {
    loadComplianceData();
  }, [companyId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Mock compliance data - in real app, this would come from compliance checks
      setComplianceRules([
        {
          id: '1',
          category: 'ACA',
          rule: 'Employer Shared Responsibility',
          description: 'Offer minimum essential coverage to full-time employees',
          status: 'compliant',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-02-15T10:00:00Z',
          details: 'All full-time employees (45/45) have been offered qualifying coverage'
        },
        {
          id: '2',
          category: 'ACA',
          rule: 'Affordability Test',
          description: 'Employee contribution must not exceed 9.12% of household income',
          status: 'compliant',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-02-15T10:00:00Z',
          details: 'All plans pass affordability using Federal Poverty Level safe harbor'
        },
        {
          id: '3',
          category: 'ACA',
          rule: 'Minimum Value',
          description: 'Plans must cover at least 60% of covered medical expenses',
          status: 'compliant',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-02-15T10:00:00Z',
          details: 'All medical plans exceed 60% minimum value threshold'
        },
        {
          id: '4',
          category: 'ACA',
          rule: '1094-C/1095-C Reporting',
          description: 'Annual information reporting to IRS and employees',
          status: 'warning',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-03-31T10:00:00Z',
          details: '2023 forms due by March 31, 2024'
        },
        {
          id: '5',
          category: 'ERISA',
          rule: 'Summary Plan Description',
          description: 'Provide SPDs to participants within required timeframes',
          status: 'compliant',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-12-31T10:00:00Z',
          details: 'All SPDs distributed and up to date'
        },
        {
          id: '6',
          category: 'HIPAA',
          rule: 'Privacy Rule Compliance',
          description: 'Protect health information privacy and security',
          status: 'compliant',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-06-15T10:00:00Z',
          details: 'Privacy policies in place, staff trained'
        },
        {
          id: '7',
          category: 'State',
          rule: 'State Continuation Coverage',
          description: 'Comply with state-specific continuation requirements',
          status: 'needs-review',
          lastChecked: '2024-01-15T10:00:00Z',
          nextReview: '2024-01-30T10:00:00Z',
          details: 'Review required due to recent state law changes'
        }
      ]);

      setAcaTests([
        {
          planName: 'Blue Cross PPO Standard',
          employeePremium: 90,
          safeHarborThreshold: 103.50,
          isAffordable: true,
          safeHarborMethod: 'Federal Poverty Level'
        },
        {
          planName: 'Aetna HMO Plus',
          employeePremium: 76,
          safeHarborThreshold: 103.50,
          isAffordable: true,
          safeHarborMethod: 'Federal Poverty Level'
        }
      ]);

      setMvTests([
        {
          planName: 'Blue Cross PPO Standard',
          mvPercentage: 68.5,
          isCompliant: true,
          details: 'Meets minimum value with comprehensive medical coverage'
        },
        {
          planName: 'Aetna HMO Plus',
          mvPercentage: 72.3,
          isCompliant: true,
          details: 'Exceeds minimum value threshold significantly'
        }
      ]);

      setLastScan('2024-01-15T10:00:00Z');
      setLoading(false);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'needs-review': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-50 text-green-700';
      case 'warning': return 'bg-yellow-50 text-yellow-700';
      case 'non-compliant': return 'bg-red-50 text-red-700';
      case 'needs-review': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'warning': return 'Warning';
      case 'non-compliant': return 'Non-Compliant';
      case 'needs-review': return 'Needs Review';
      default: return 'Unknown';
    }
  };

  const getCategorySummary = (category: string) => {
    const categoryRules = complianceRules.filter(rule => rule.category === category);
    const compliant = categoryRules.filter(rule => rule.status === 'compliant').length;
    const total = categoryRules.length;
    const hasIssues = categoryRules.some(rule => rule.status === 'non-compliant' || rule.status === 'warning');
    
    return { compliant, total, hasIssues };
  };

  const runComplianceCheck = async () => {
    setLoading(true);
    // Simulate compliance check
    setTimeout(() => {
      setLastScan(new Date().toISOString());
      setLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Monitoring
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor ACA, ERISA, HIPAA, and state compliance requirements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={runComplianceCheck} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Run Check
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
          {lastScan && (
            <p className="text-xs text-muted-foreground mt-2">
              Last scan: {new Date(lastScan).toLocaleString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['ACA', 'ERISA', 'HIPAA', 'State'].map((category) => {
          const summary = getCategorySummary(category);
          return (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category}</h3>
                  {summary.hasIssues ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {summary.compliant}/{summary.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rules Compliant
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="aca">ACA Testing</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {['ACA', 'ERISA', 'HIPAA', 'State'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category} Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceRules
                      .filter(rule => rule.category === category)
                      .map((rule) => (
                        <div key={rule.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="mt-1">
                            {getStatusIcon(rule.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{rule.rule}</h3>
                              <Badge className={getStatusColor(rule.status)}>
                                {getStatusText(rule.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {rule.description}
                            </p>
                            {rule.details && (
                              <p className="text-sm text-gray-700">
                                {rule.details}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Last checked: {new Date(rule.lastChecked).toLocaleDateString()}</span>
                              <span>Next review: {new Date(rule.nextReview).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="aca">
          <div className="space-y-6">
            {/* ACA Affordability Test */}
            <Card>
              <CardHeader>
                <CardTitle>ACA Affordability Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Employee contribution cannot exceed 9.12% of household income (2024 rate)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acaTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{test.planName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Safe Harbor Method: {test.safeHarborMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {test.isAffordable ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={test.isAffordable ? 'text-green-600' : 'text-red-600'}>
                            {test.isAffordable ? 'Affordable' : 'Not Affordable'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Employee: ${test.employeePremium} / Threshold: ${test.safeHarborThreshold}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Minimum Value Test */}
            <Card>
              <CardHeader>
                <CardTitle>Minimum Value Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Plans must pay at least 60% of covered medical expenses
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mvTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{test.planName}</h3>
                        <p className="text-sm text-muted-foreground">{test.details}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {test.isCompliant ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={test.isCompliant ? 'text-green-600' : 'text-red-600'}>
                            {test.mvPercentage}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {test.isCompliant ? 'Meets Standard' : 'Below Threshold'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reporting">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <h3 className="font-medium">ACA 1094-C/1095-C Forms</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Annual information reporting due March 31, 2024
                    </p>
                    <Button size="sm" variant="outline">
                      Generate Forms
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <h3 className="font-medium">ERISA Form 5500</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Annual return/report for employee benefit plans
                    </p>
                    <Button size="sm" variant="outline">
                      View Requirements
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <h3 className="font-medium">Summary Annual Report</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Required participant disclosure for ERISA plans
                    </p>
                    <Button size="sm" variant="outline">
                      Generate SAR
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <h3 className="font-medium">COBRA Notices</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      General and election notices for qualifying events
                    </p>
                    <Button size="sm" variant="outline">
                      View Templates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Compliance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border-l-4 border-red-500 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-red-900">March 31, 2024</h3>
                        <p className="text-sm text-red-700">ACA 1094-C/1095-C Forms Due</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Due Soon</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-yellow-900">July 31, 2024</h3>
                        <p className="text-sm text-yellow-700">Form 5500 Filing Deadline</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-blue-900">December 31, 2024</h3>
                        <p className="text-sm text-blue-700">SPD Distribution Review</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Future</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};