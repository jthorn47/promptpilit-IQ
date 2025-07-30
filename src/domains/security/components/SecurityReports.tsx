import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Shield, AlertTriangle } from "lucide-react";

export const SecurityReports = () => {
  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`);
  };

  const reportTypes = [
    {
      title: "Security Assessment Report",
      description: "Comprehensive security posture assessment",
      icon: <Shield className="w-5 h-5" />,
      type: "assessment",
      lastGenerated: "2024-01-10"
    },
    {
      title: "Vulnerability Report",
      description: "Detailed vulnerability scan results and remediation",
      icon: <AlertTriangle className="w-5 h-5" />,
      type: "vulnerability",
      lastGenerated: "2024-01-09"
    },
    {
      title: "Compliance Report",
      description: "Security compliance status and framework adherence",
      icon: <FileText className="w-5 h-5" />,
      type: "compliance",
      lastGenerated: "2024-01-08"
    },
    {
      title: "Incident Response Report",
      description: "Security incident analysis and response summary",
      icon: <FileText className="w-5 h-5" />,
      type: "incident",
      lastGenerated: "2024-01-07"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Reports</CardTitle>
          <CardDescription>
            Generate comprehensive security reports for compliance and audit purposes
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
                    Last generated: {report.lastGenerated}
                  </Badge>
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
            Previously generated security reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Monthly Security Assessment - January 2024",
                type: "Assessment Report",
                date: "2024-01-10",
                size: "3.2 MB"
              },
              {
                name: "Vulnerability Scan Report - January 2024",
                type: "Vulnerability Report",
                date: "2024-01-09",
                size: "1.8 MB"
              },
              {
                name: "SOC 2 Compliance Report - Q4 2023",
                type: "Compliance Report",
                date: "2024-01-08",
                size: "4.1 MB"
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