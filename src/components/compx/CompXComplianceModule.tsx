import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Calendar,
  Shield,
  Plus,
  Eye,
  Download
} from "lucide-react";

interface ComplianceItem {
  id: string;
  requirementType: string;
  description: string;
  dueDate: string;
  completionDate?: string;
  status: string;
  responsiblePerson: string;
  priority: string;
  documents: string[];
}

export const CompXComplianceModule = () => {
  // Mock compliance data
  const complianceItems: ComplianceItem[] = [
    {
      id: "1",
      requirementType: "OSHA Reporting",
      description: "Submit annual 300A injury summary form",
      dueDate: "2024-03-01",
      status: "Pending",
      responsiblePerson: "Sarah Wilson",
      priority: "High",
      documents: []
    },
    {
      id: "2",
      requirementType: "Policy Review",
      description: "Annual safety policy review and update",
      dueDate: "2024-02-15",
      completionDate: "2024-02-10",
      status: "Complete",
      responsiblePerson: "Mike Johnson",
      priority: "Medium",
      documents: ["Safety_Policy_2024.pdf", "Review_Notes.pdf"]
    },
    {
      id: "3",
      requirementType: "Training Certification",
      description: "Renew safety coordinator certification",
      dueDate: "2024-01-30",
      status: "Overdue",
      responsiblePerson: "Lisa Davis",
      priority: "High",
      documents: []
    },
    {
      id: "4",
      requirementType: "Insurance Audit",
      description: "Workers' compensation insurance premium audit",
      dueDate: "2024-04-15",
      status: "Scheduled",
      responsiblePerson: "Jennifer Lee",
      priority: "Medium",
      documents: ["Audit_Schedule.pdf"]
    }
  ];

  const complianceMetrics = {
    totalRequirements: complianceItems.length,
    completeItems: complianceItems.filter(item => item.status === "Complete").length,
    overdueItems: complianceItems.filter(item => item.status === "Overdue").length,
    upcomingDeadlines: complianceItems.filter(item => {
      const dueDate = new Date(item.dueDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return dueDate <= thirtyDaysFromNow && item.status !== "Complete";
    }).length
  };

  const complianceScore = Math.round((complianceMetrics.completeItems / complianceMetrics.totalRequirements) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Complete":
        return "default";
      case "Overdue":
        return "destructive";
      case "Pending":
        return "secondary";
      case "Scheduled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-amber-100 text-amber-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Management</h2>
          <p className="text-muted-foreground">
            Track regulatory requirements and maintain compliance standards
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requirements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.totalRequirements}</div>
            <p className="text-xs text-muted-foreground">Active requirements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceMetrics.completeItems}</div>
            <p className="text-xs text-muted-foreground">Requirements met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceMetrics.overdueItems}</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30 days)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{complianceMetrics.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>
            All regulatory requirements and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceItems.map((item) => {
              const daysUntilDue = getDaysUntilDue(item.dueDate);
              
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-semibold">{item.requirementType}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                      <Badge variant={getStatusVariant(item.status) as any}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <div className="font-medium">{item.dueDate}</div>
                      {item.status !== "Complete" && (
                        <div className={`text-xs ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days remaining`}
                        </div>
                      )}
                    </div>
                    {item.completionDate && (
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <div className="font-medium text-green-600">{item.completionDate}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Responsible:</span>
                      <div className="font-medium">{item.responsiblePerson}</div>
                    </div>
                  </div>

                  {item.documents.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-muted-foreground">Documents:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.documents.map((doc, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            {doc}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {item.status !== "Complete" && (
                      <Button size="sm">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Actions</CardTitle>
          <CardDescription>
            Common compliance management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Audit
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              Export Documents
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              Policy Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};