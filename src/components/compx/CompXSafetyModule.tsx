import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Users,
  FileText,
  Plus,
  Eye,
  TrendingUp
} from "lucide-react";

interface SafetyReport {
  id: string;
  reportType: string;
  location: string;
  date: string;
  inspector: string;
  safetyScore: number;
  violations: string[];
  status: string;
}

interface TrainingRecord {
  id: string;
  employee: string;
  trainingType: string;
  completionDate: string;
  expiryDate: string;
  status: string;
}

export const CompXSafetyModule = () => {
  const [activeView, setActiveView] = useState("overview");

  // Mock safety data
  const safetyReports: SafetyReport[] = [
    {
      id: "1",
      reportType: "Monthly Safety Inspection",
      location: "Warehouse - Main Floor",
      date: "2024-01-15",
      inspector: "Mike Johnson",
      safetyScore: 87,
      violations: ["Blocked emergency exit", "Missing safety signs"],
      status: "Action Required"
    },
    {
      id: "2", 
      reportType: "Equipment Safety Check",
      location: "Production Line 2",
      date: "2024-01-12",
      inspector: "Sarah Wilson",
      safetyScore: 95,
      violations: [],
      status: "Compliant"
    }
  ];

  const trainingRecords: TrainingRecord[] = [
    {
      id: "1",
      employee: "John Smith",
      trainingType: "Forklift Operation",
      completionDate: "2023-12-15",
      expiryDate: "2024-12-15",
      status: "Current"
    },
    {
      id: "2",
      employee: "Maria Garcia", 
      trainingType: "OSHA 10-Hour",
      completionDate: "2023-11-20",
      expiryDate: "2024-11-20",
      status: "Expiring Soon"
    },
    {
      id: "3",
      employee: "David Johnson",
      trainingType: "Emergency Response",
      completionDate: "2023-10-01",
      expiryDate: "2024-01-01",
      status: "Expired"
    }
  ];

  const safetyMetrics = {
    overallScore: 87,
    inspectionsThisMonth: 5,
    violations: 3,
    trainingCompliance: 85,
    daysWithoutIncident: 45
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Current":
      case "Compliant":
        return "default";
      case "Expiring Soon":
      case "Action Required":
        return "secondary";
      case "Expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Safety Management</h2>
          <p className="text-muted-foreground">
            Monitor workplace safety, conduct inspections, and track training
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Training
          </Button>
        </div>
      </div>

      {/* Safety Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(safetyMetrics.overallScore)}`}>
              {safetyMetrics.overallScore}%
            </div>
            <Progress value={safetyMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safetyMetrics.inspectionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safetyMetrics.violations}</div>
            <p className="text-xs text-muted-foreground">Requiring action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Compliance</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safetyMetrics.trainingCompliance}%</div>
            <Progress value={safetyMetrics.trainingCompliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Without Incident</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{safetyMetrics.daysWithoutIncident}</div>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Safety Inspections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Inspections
            </CardTitle>
            <CardDescription>
              Latest safety inspection reports and findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safetyReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{report.reportType}</div>
                    <Badge variant={getStatusVariant(report.status) as any}>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {report.location} • {report.date} • {report.inspector}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Safety Score:</span>
                      <span className={`font-bold ${getScoreColor(report.safetyScore)}`}>
                        {report.safetyScore}%
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>

                  {report.violations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium text-amber-600 mb-1">
                        Violations Found:
                      </div>
                      <ul className="text-sm text-muted-foreground">
                        {report.violations.map((violation, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            {violation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Inspections
            </Button>
          </CardContent>
        </Card>

        {/* Training Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Training Status
            </CardTitle>
            <CardDescription>
              Employee safety training compliance and expiration tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{record.employee}</div>
                      <div className="text-sm text-muted-foreground">{record.trainingType}</div>
                    </div>
                    <Badge variant={getStatusVariant(record.status) as any}>
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <div className="font-medium">{record.completionDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <div className="font-medium">{record.expiryDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Training Records
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common safety management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Create Safety Report
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Inspection
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Assign Training
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};