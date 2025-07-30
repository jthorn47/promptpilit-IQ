import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  id: string;
  company_name: string;
  company_size: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
}

interface AnalyticsData {
  totalAssessments: number;
  completedAssessments: number;
  averageRiskScore: number;
  riskDistribution: { [key: string]: number };
  industryBreakdown: { [key: string]: number };
  companySizeBreakdown: { [key: string]: number };
  monthlyTrends: { month: string; count: number; avgScore: number }[];
}

export default function AssessmentAnalytics() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
      calculateAnalytics(data || []);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data: Assessment[]) => {
    const completed = data.filter(a => a.status === 'completed');
    const avgScore = completed.length > 0 
      ? Math.round(completed.reduce((sum, a) => sum + a.risk_score, 0) / completed.length)
      : 0;

    // Risk distribution
    const riskDistribution = completed.reduce((acc, assessment) => {
      acc[assessment.risk_level] = (acc[assessment.risk_level] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Industry breakdown
    const industryBreakdown = completed.reduce((acc, assessment) => {
      acc[assessment.industry] = (acc[assessment.industry] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Company size breakdown
    const companySizeBreakdown = completed.reduce((acc, assessment) => {
      acc[assessment.company_size] = (acc[assessment.company_size] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthAssessments = completed.filter(a => 
        a.created_at.slice(0, 7) === monthKey
      );
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthAssessments.length,
        avgScore: monthAssessments.length > 0 
          ? Math.round(monthAssessments.reduce((sum, a) => sum + a.risk_score, 0) / monthAssessments.length)
          : 0
      });
    }

    setAnalytics({
      totalAssessments: data.length,
      completedAssessments: completed.length,
      averageRiskScore: avgScore,
      riskDistribution,
      industryBreakdown,
      companySizeBreakdown,
      monthlyTrends
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "Assessments", href: "/admin/assessments" },
        { label: "Analytics" }
      ]} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessment Analytics</h1>
        <p className="text-muted-foreground">Insights and trends from risk assessments</p>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedAssessments} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageRiskScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all completed assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalAssessments > 0 
                    ? Math.round((analytics.completedAssessments / analytics.totalAssessments) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedAssessments} of {analytics.totalAssessments} assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Companies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.riskDistribution['High Risk'] || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Breakdown of companies by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.riskDistribution).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            level === 'Low Risk' ? 'default' :
                            level === 'Moderate Risk' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary"
                            style={{ 
                              width: `${(count / analytics.completedAssessments) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Breakdown</CardTitle>
                <CardDescription>Assessments by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.industryBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{industry}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary"
                            style={{ 
                              width: `${(count / analytics.completedAssessments) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>Assessment volume and average risk scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrends.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{month.month}</h4>
                      <p className="text-sm text-muted-foreground">{month.count} assessments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{month.avgScore}%</p>
                      <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Size Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Company Size Distribution</CardTitle>
              <CardDescription>Assessments by company size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics.companySizeBreakdown).map(([size, count]) => (
                  <div key={size} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{size}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}