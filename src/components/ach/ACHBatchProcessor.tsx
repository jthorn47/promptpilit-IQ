import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Play, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Download,
  Eye,
  Settings
} from "lucide-react";

export const ACHBatchProcessor = () => {
  const [activeBatches, setActiveBatches] = useState([
    {
      id: "batch_001",
      name: "Weekly Payroll - Week 3",
      type: "Payroll",
      status: "ready",
      entries: 247,
      totalAmount: 124750.00,
      createdAt: "2024-01-15T09:00:00Z",
      scheduledDate: "2024-01-16",
      effectiveDate: "2024-01-17"
    },
    {
      id: "batch_002", 
      name: "Benefit Payments - January",
      type: "Benefits",
      status: "processing",
      entries: 89,
      totalAmount: 15600.00,
      createdAt: "2024-01-15T08:30:00Z",
      scheduledDate: "2024-01-16",
      effectiveDate: "2024-01-17"
    },
    {
      id: "batch_003",
      name: "Tax Remittance - Q4 2023",
      type: "Tax",
      status: "completed",
      entries: 12,
      totalAmount: 8900.00,
      createdAt: "2024-01-14T14:00:00Z",
      scheduledDate: "2024-01-15",
      effectiveDate: "2024-01-16"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Ready</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <FileCheck className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create New Batch</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              New Payroll Batch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Process Ready</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Process All Ready
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Files</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download NACHA
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure ACH
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Batches</TabsTrigger>
          <TabsTrigger value="history">Processing History</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current ACH Batches</CardTitle>
              <CardDescription>
                Manage and process ACH file batches for payroll, benefits, and tax payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono text-sm">{batch.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(batch.status)}
                          <span className="font-medium">{batch.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{batch.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(batch.status)}
                      </TableCell>
                      <TableCell>{batch.entries.toLocaleString()}</TableCell>
                      <TableCell>${batch.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(batch.effectiveDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {batch.status === "ready" && (
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          )}
                          {batch.status === "completed" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Processing History</CardTitle>
              <CardDescription>View completed and failed ACH processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Processing history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Batches</CardTitle>
              <CardDescription>View and manage upcoming ACH processing schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Scheduled batches will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};