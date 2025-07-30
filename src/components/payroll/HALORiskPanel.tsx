import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Activity,
  Clock,
  CheckCircle,
  Users,
  FileText
} from "lucide-react";

interface HALORiskData {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high';
  compliance_score: number;
  last_updated: string;
  risk_factors: {
    category: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }[];
  anomalies: {
    id: string;
    type: 'payroll' | 'tax' | 'compliance';
    severity: 'low' | 'medium' | 'high';
    description: string;
    detected_at: string;
    resolved: boolean;
  }[];
  trends: {
    period: string;
    risk_score: number;
    compliance_score: number;
  }[];
}

interface HALORiskPanelProps {
  companyId?: string;
  showDetailedView?: boolean;
}

export const HALORiskPanel: React.FC<HALORiskPanelProps> = ({ 
  companyId,
  showDetailedView = false 
}) => {
  const [riskData, setRiskData] = useState<HALORiskData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data - would be fetched from HALO API
  useEffect(() => {
    const mockData: HALORiskData = {
      overall_score: 85,
      risk_level: 'low',
      compliance_score: 92,
      last_updated: new Date().toISOString(),
      risk_factors: [
        {
          category: 'Tax Compliance',
          score: 95,
          issues: [],
          recommendations: ['Continue current practices', 'Monitor quarterly filings']
        },
        {
          category: 'Payroll Accuracy',
          score: 88,
          issues: ['2 overtime calculation discrepancies last month'],
          recommendations: ['Review overtime policies', 'Implement automated checks']
        },
        {
          category: 'Employee Data',
          score: 90,
          issues: ['3 employees missing tax forms'],
          recommendations: ['Update employee records', 'Send reminder notifications']
        }
      ],
      anomalies: [
        {
          id: '1',
          type: 'payroll',
          severity: 'medium',
          description: 'Unusual overtime spike in Engineering dept (+45% vs avg)',
          detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'tax',
          severity: 'low',
          description: 'FUTA cap reached for 3 employees',
          detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ],
      trends: [
        { period: 'Dec 2024', risk_score: 82, compliance_score: 89 },
        { period: 'Jan 2024', risk_score: 85, compliance_score: 92 },
        { period: 'Feb 2024', risk_score: 85, compliance_score: 92 }
      ]
    };

    setTimeout(() => {
      setRiskData(mockData);
      setLoading(false);
    }, 500);
  }, [companyId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskData) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!showDetailedView) {
    // Compact view for dashboard
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getRiskColor(riskData.risk_level)}`} />
              HALO Risk Score
            </CardTitle>
            <Badge variant={getRiskBadgeVariant(riskData.risk_level)}>
              {riskData.risk_level.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getRiskColor(riskData.risk_level)}`}>
                {riskData.overall_score}
              </div>
              <div className="text-sm text-muted-foreground">Overall Risk Score</div>
              <Progress 
                value={riskData.overall_score} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Compliance</div>
                <div className="text-2xl font-bold text-green-600">{riskData.compliance_score}</div>
              </div>
              <div>
                <div className="font-medium">Anomalies</div>
                <div className="text-2xl font-bold text-blue-600">
                  {riskData.anomalies.filter(a => !a.resolved).length}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-6 w-6 ${getRiskColor(riskData.risk_level)}`} />
            HALO Intelligence Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-bold ${getRiskColor(riskData.risk_level)}`}>
                      {riskData.overall_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                    <Progress value={riskData.overall_score} className="mt-2 h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {riskData.compliance_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Compliance</div>
                    <Progress value={riskData.compliance_score} className="mt-2 h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {riskData.anomalies.filter(a => !a.resolved).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Anomalies</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Factors</h3>
                {riskData.risk_factors.map((factor, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{factor.category}</h4>
                        <Badge variant={factor.score >= 90 ? 'default' : factor.score >= 70 ? 'secondary' : 'destructive'}>
                          {factor.score}
                        </Badge>
                      </div>
                      <Progress value={factor.score} className="mb-3 h-2" />
                      
                      {factor.issues.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-red-600 mb-1">Issues:</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {factor.issues.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm font-medium text-green-600 mb-1">Recommendations:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {factor.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payroll Anomaly Detection</h3>
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Run Scan
                </Button>
              </div>
              
              {riskData.anomalies.map((anomaly) => (
                <Card key={anomaly.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(anomaly.severity)}
                        <div>
                          <div className="font-medium">{anomaly.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)} • 
                            Detected {new Date(anomaly.detected_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={anomaly.resolved ? 'default' : 'secondary'}>
                          {anomaly.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {anomaly.resolved ? 'View' : 'Investigate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <h3 className="text-lg font-semibold">Compliance Score Tracking</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-600">{riskData.compliance_score}%</div>
                    <div className="text-muted-foreground">Current Compliance Score</div>
                  </div>
                  <Progress value={riskData.compliance_score} className="h-3" />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tax Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Federal Forms</span>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>State Forms</span>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Forms</span>
                        <Badge variant="secondary">1 Due</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Employee Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>W-4 Forms</span>
                        <Badge variant="default">Complete</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>I-9 Forms</span>
                        <Badge variant="secondary">3 Missing</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>State Forms</span>
                        <Badge variant="default">Complete</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Score Trends</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {riskData.trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="font-medium">{trend.period}</div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            Risk: <span className="font-medium">{trend.risk_score}</span>
                          </div>
                          <div className="text-sm">
                            Compliance: <span className="font-medium">{trend.compliance_score}</span>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};