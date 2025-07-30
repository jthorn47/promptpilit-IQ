import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertTriangle, CheckCircle, Calendar, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const BrokerComplianceCenter = () => {
  // Mock compliance data
  const complianceDocuments = [
    {
      id: 1,
      documentType: "agreement",
      documentName: "Partner Agreement 2024",
      status: "approved",
      expiryDate: "2024-12-31",
      uploadedAt: "2024-01-15",
      reviewedBy: "Legal Team"
    },
    {
      id: 2,
      documentType: "license",
      documentName: "Insurance Broker License",
      status: "approved",
      expiryDate: "2024-06-30",
      uploadedAt: "2024-01-10",
      reviewedBy: "Compliance Team"
    },
    {
      id: 3,
      documentType: "insurance",
      documentName: "Professional Liability Insurance",
      status: "pending",
      expiryDate: "2024-03-15",
      uploadedAt: "2024-01-20",
      reviewedBy: null
    },
    {
      id: 4,
      documentType: "tax_form",
      documentName: "W-9 Tax Form",
      status: "expired",
      expiryDate: "2023-12-31",
      uploadedAt: "2023-01-15",
      reviewedBy: "Finance Team"
    }
  ];

  const complianceRequirements = [
    {
      requirement: "Partner Agreement",
      status: "completed",
      dueDate: "2024-01-01",
      description: "Signed partnership agreement"
    },
    {
      requirement: "Insurance Documentation",
      status: "pending",
      dueDate: "2024-02-01",
      description: "Professional liability coverage"
    },
    {
      requirement: "License Verification",
      status: "completed",
      dueDate: "2024-01-15",
      description: "Valid insurance broker license"
    },
    {
      requirement: "Tax Documentation",
      status: "needs_renewal",
      dueDate: "2024-01-01",
      description: "Current W-9 or W-8 form"
    },
    {
      requirement: "Background Check",
      status: "completed",
      dueDate: "2024-01-01",
      description: "Clean background verification"
    }
  ];

  const statusColors = {
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    expired: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  };

  const requirementStatusColors = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    needs_renewal: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const completedRequirements = complianceRequirements.filter(req => req.status === 'completed').length;
  const complianceScore = Math.round((completedRequirements / complianceRequirements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Compliance Center</h2>
        <p className="text-muted-foreground">Manage your partnership compliance and documentation</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compliance Score
            </CardTitle>
            <CardDescription>
              Your overall compliance status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-foreground">
              {complianceScore}%
            </div>
            <Progress value={complianceScore} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {completedRequirements} of {complianceRequirements.length} requirements completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Action Required
            </CardTitle>
            <CardDescription>
              Items needing your immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tax form renewal required</p>
                <p className="text-xs text-muted-foreground">Due: January 1, 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Insurance renewal approaching</p>
                <p className="text-xs text-muted-foreground">Expires: March 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>
            Track your partnership compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{requirement.requirement}</h4>
                    <Badge className={requirementStatusColors[requirement.status as keyof typeof requirementStatusColors]}>
                      {requirement.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {requirement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(requirement.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {requirement.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : requirement.status === 'needs_renewal' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Upload and manage your compliance documents
              </CardDescription>
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.documentName}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {doc.documentType.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[doc.status as keyof typeof statusColors]}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(doc.expiryDate).toLocaleDateString()}
                      {new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {doc.reviewedBy || 'Pending review'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};