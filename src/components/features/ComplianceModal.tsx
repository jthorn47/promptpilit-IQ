import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Download,
  Search,
  Filter,
  BarChart3,
  Clock,
  Users,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  compliance: number;
  lastUpdated: string;
  nextReview: string;
  criticalLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Data Protection Policy',
    category: 'Security',
    status: 'active',
    compliance: 95,
    lastUpdated: '2024-01-10',
    nextReview: '2024-07-10',
    criticalLevel: 'high'
  },
  {
    id: '2',
    name: 'Employee Code of Conduct',
    category: 'HR',
    status: 'active',
    compliance: 88,
    lastUpdated: '2024-01-05',
    nextReview: '2024-06-05',
    criticalLevel: 'medium'
  },
  {
    id: '3',
    name: 'Financial Controls',
    category: 'Finance',
    status: 'active',
    compliance: 92,
    lastUpdated: '2024-01-15',
    nextReview: '2024-04-15',
    criticalLevel: 'critical'
  },
  {
    id: '4',
    name: 'IT Security Standards',
    category: 'IT',
    status: 'draft',
    compliance: 0,
    lastUpdated: '2024-01-12',
    nextReview: '2024-02-12',
    criticalLevel: 'high'
  }
];

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    user: 'John Smith',
    action: 'Policy Access',
    resource: 'Data Protection Policy',
    status: 'success',
    details: 'Viewed policy document'
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:25:10',
    user: 'Sarah Johnson',
    action: 'Policy Update',
    resource: 'Employee Code of Conduct',
    status: 'success',
    details: 'Updated section 3.2 - Remote Work Guidelines'
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:20:45',
    user: 'System',
    action: 'Compliance Check',
    resource: 'Financial Controls',
    status: 'warning',
    details: 'Compliance dropped below 90% threshold'
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:15:33',
    user: 'Mike Davis',
    action: 'Failed Access',
    resource: 'IT Security Standards',
    status: 'error',
    details: 'Insufficient permissions for document access'
  }
];

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const { toast } = useToast();

  const filteredPolicies = mockPolicies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const overallCompliance = Math.round(
    mockPolicies.filter(p => p.status === 'active').reduce((acc, p) => acc + p.compliance, 0) / 
    mockPolicies.filter(p => p.status === 'active').length
  );

  const handleGenerateReport = () => {
    toast({
      title: "Compliance Report Generated",
      description: "The compliance report has been generated and is ready for download.",
    });
  };

  const handleDownloadReport = (reportName: string) => {
    console.log(`Downloading ${reportName}...`);
    
    // Create mock PDF content
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${reportName}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    // Create blob and download
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `${reportName} has been downloaded to your Downloads folder.`,
    });
  };

  const handleExportAuditLog = () => {
    console.log('Exporting audit log...');
    
    // Create mock CSV content
    const csvContent = `Timestamp,User,Action,Resource,Status,IP Address
2024-01-15 10:30:00,john.smith@company.com,Document Access,Employee_Handbook.pdf,Success,192.168.1.100
2024-01-15 10:31:00,sarah.johnson@company.com,Policy Update,Data_Security_Policy.pdf,Success,192.168.1.101
2024-01-15 10:32:00,mike.davis@company.com,Document Download,Compliance_Report.pdf,Success,192.168.1.102
2024-01-15 10:33:00,emma.wilson@company.com,Permission Change,Access_Control,Success,192.168.1.103
2024-01-15 10:34:00,admin@company.com,Report Generation,Monthly_Compliance,Success,192.168.1.104`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit_log_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete", 
      description: "Audit log has been exported to your Downloads folder as audit_log_export.csv",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Compliance Management</span>
          </DialogTitle>
          <DialogDescription>
            Monitor and manage regulatory compliance across your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Progress value={overallCompliance} className="h-2" />
                    </div>
                    <span className="text-2xl font-bold">{overallCompliance}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {mockPolicies.filter(p => p.status === 'active').length}
                    </span>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">
                      {mockPolicies.filter(p => p.criticalLevel === 'critical' && p.compliance < 90).length}
                    </span>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>Track compliance performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Compliance trend chart visualization</p>
                    <p className="text-sm">Real-time compliance metrics and historical data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  New Policy
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 text-sm font-medium">
                <div className="col-span-3">Policy Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Compliance</div>
                <div className="col-span-2">Next Review</div>
                <div className="col-span-1">Priority</div>
              </div>

              <div className="divide-y max-h-64 overflow-y-auto">
                {filteredPolicies.map((policy) => (
                  <div 
                    key={policy.id} 
                    className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="col-span-3 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate font-medium">{policy.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {policy.category}
                    </div>
                    <div className="col-span-2">
                      <Badge className={`text-xs ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Progress value={policy.compliance} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{policy.compliance}%</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {policy.nextReview}
                    </div>
                    <div className="col-span-1">
                      <Badge className={`text-xs ${getCriticalColor(policy.criticalLevel)}`}>
                        {policy.criticalLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPolicy && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedPolicy.name}</CardTitle>
                      <CardDescription>Last updated: {selectedPolicy.lastUpdated}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport('Policy Document')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedPolicy.category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className={`text-xs ${getStatusColor(selectedPolicy.status)}`}>
                        {selectedPolicy.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Compliance Rate</Label>
                      <p className="font-medium">{selectedPolicy.compliance}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Priority Level</Label>
                      <Badge className={`text-xs ${getCriticalColor(selectedPolicy.criticalLevel)}`}>
                        {selectedPolicy.criticalLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Audit Trail</h3>
              <Button variant="outline" onClick={handleExportAuditLog}>
                <Download className="h-4 w-4 mr-2" />
                Export Audit Log
              </Button>
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 text-sm font-medium">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Action</div>
                <div className="col-span-3">Resource</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Details</div>
              </div>

              <div className="divide-y max-h-64 overflow-y-auto">
                {mockAuditEntries.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/30">
                    <div className="col-span-2 text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {entry.timestamp}
                    </div>
                    <div className="col-span-2 text-sm flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {entry.user}
                    </div>
                    <div className="col-span-2 text-sm font-medium">
                      {entry.action}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {entry.resource}
                    </div>
                    <div className="col-span-2 flex items-center space-x-1">
                      {getAuditStatusIcon(entry.status)}
                      <span className="text-sm capitalize">{entry.status}</span>
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Compliance Reports</h3>
              <Button onClick={handleGenerateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Monthly Compliance Report</CardTitle>
                  <CardDescription>Comprehensive monthly compliance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Generated: January 2024
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport('Monthly Compliance Report')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Policy Effectiveness Report</CardTitle>
                  <CardDescription>Analysis of policy compliance effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Generated: January 2024
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport('Policy Effectiveness Report')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Risk Assessment Report</CardTitle>
                  <CardDescription>Comprehensive risk analysis and mitigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Generated: January 2024
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport('Risk Assessment Report')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Audit Trail Summary</CardTitle>
                  <CardDescription>Summary of all audit activities and findings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Generated: January 2024
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport('Audit Trail Summary')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};