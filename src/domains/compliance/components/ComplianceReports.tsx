import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, BarChart3 } from "lucide-react";
import { useCompliancePolicies } from '../hooks/useCompliancePolicies';
import { useComplianceAssessments } from '../hooks/useComplianceAssessments';

export const ComplianceReports = () => {
  const { policies } = useCompliancePolicies();
  const { assessments } = useComplianceAssessments();

  const generateReport = (type: string) => {
    // In a real implementation, this would generate and download the report
    console.log(`Generating ${type} report...`);
  };

  const reportTypes = [
    {
      title: "Compliance Summary",
      description: "Overview of all compliance policies and their current status",
      icon: <FileText className="w-5 h-5" />,
      type: "summary",
      count: policies.length
    },
    {
      title: "Assessment Results",
      description: "Detailed results from compliance assessments and audits",
      icon: <BarChart3 className="w-5 h-5" />,
      type: "assessments",
      count: assessments.length
    },
    {
      title: "Training Records",
      description: "Employee training completion and certification records",
      icon: <Calendar className="w-5 h-5" />,
      type: "training",
      count: 0 // Would come from training data
    },
    {
      title: "Regulatory Updates",
      description: "Recent changes in compliance requirements and regulations",
      icon: <FileText className="w-5 h-5" />,
      type: "regulatory",
      count: 3 // Static for now
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>
            Generate comprehensive compliance reports for audits and regulatory submissions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {report.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {report.count} {report.count === 1 ? 'record' : 'records'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  onClick={() => generateReport(report.type)}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            Previously generated compliance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Monthly Compliance Summary - December 2024",
                type: "Summary Report",
                date: "2024-12-15",
                size: "2.4 MB"
              },
              {
                name: "Annual Compliance Assessment - 2024",
                type: "Assessment Report",
                date: "2024-12-01",
                size: "5.1 MB"
              },
              {
                name: "Training Completion Report - Q4 2024",
                type: "Training Report",
                date: "2024-11-30",
                size: "1.8 MB"
              }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.size} • Generated {report.date}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};