import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { FormattedAssessmentReport } from "@/components/assessments/FormattedAssessmentReport";

interface Assessment {
  id: string;
  company_name: string;
  company_email: string;
  company_size: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
  ai_report?: any;
}

export default function AssessmentReports() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Assessment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .not('ai_report', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      console.error('Error fetching assessment reports:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (assessment: Assessment) => {
    const reportContent = assessment.ai_report || 'No AI report available';
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assessment.company_name}-assessment-report-${format(new Date(assessment.created_at), 'yyyy-MM-dd')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'success';
      case 'Moderate Risk':
        return 'warning';
      case 'High Risk':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "Assessments", href: "/admin/assessments" },
        { label: "Reports" }
      ]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Reports</h1>
          <p className="text-muted-foreground">AI-generated assessment reports and analysis</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4">
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports available</h3>
              <p className="text-muted-foreground">
                Assessment reports will appear here once AI analysis is completed
              </p>
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{assessment.company_name} - Assessment Report</h3>
                      <Badge variant={getRiskColor(assessment.risk_level) as any}>
                        {assessment.risk_level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Company:</span>
                        <p className="font-medium">{assessment.company_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <p className="font-medium">{assessment.industry}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <p className="font-medium">{assessment.risk_score}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{format(new Date(assessment.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedReport(assessment)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReport(assessment)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-auto bg-white w-full">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedReport.company_name} - Assessment Report
                  </CardTitle>
                  <CardDescription>
                    Generated on {format(new Date(selectedReport.created_at), 'MMMM dd, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadReport(selectedReport)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <FormattedAssessmentReport assessment={selectedReport} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}