import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, AlertCircle, CheckCircle, Clock, User } from "lucide-react";

export const ACHAuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock audit trail data
  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      action: "batch_created",
      resource: "ACH Batch",
      resourceId: "batch_001",
      performedBy: "john.doe@company.com",
      ipAddress: "192.168.1.100",
      details: "Created new ACH batch for payroll processing",
      status: "success",
      metadata: {
        batchAmount: 125000,
        employeeCount: 45,
        effectiveDate: "2024-01-16"
      }
    },
    {
      id: "2",
      timestamp: "2024-01-15T10:35:00Z",
      action: "bank_account_added",
      resource: "Employee Bank Account",
      resourceId: "emp_001",
      performedBy: "jane.smith@company.com",
      ipAddress: "192.168.1.101",
      details: "Added new bank account for employee",
      status: "success",
      metadata: {
        employeeName: "Alice Johnson",
        accountType: "checking",
        routingNumber: "****5678"
      }
    },
    {
      id: "3",
      timestamp: "2024-01-15T11:00:00Z",
      action: "nacha_file_generated",
      resource: "NACHA File",
      resourceId: "nacha_001",
      performedBy: "system",
      ipAddress: "127.0.0.1",
      details: "Generated NACHA file for batch processing",
      status: "success",
      metadata: {
        fileSize: "15.2KB",
        recordCount: 45,
        totalAmount: 125000
      }
    },
    {
      id: "4",
      timestamp: "2024-01-15T11:15:00Z",
      action: "batch_submitted",
      resource: "ACH Batch",
      resourceId: "batch_001",
      performedBy: "john.doe@company.com",
      ipAddress: "192.168.1.100",
      details: "Submitted ACH batch to processing",
      status: "success",
      metadata: {
        submissionId: "sub_12345",
        bankDestination: "JPMC"
      }
    },
    {
      id: "5",
      timestamp: "2024-01-15T09:45:00Z",
      action: "routing_validation_failed",
      resource: "Employee Bank Account",
      resourceId: "emp_002",
      performedBy: "jane.smith@company.com",
      ipAddress: "192.168.1.101",
      details: "Routing number validation failed",
      status: "error",
      metadata: {
        employeeName: "Bob Wilson",
        routingNumber: "****9999",
        errorCode: "INVALID_ROUTING"
      }
    },
    {
      id: "6",
      timestamp: "2024-01-15T12:30:00Z",
      action: "batch_processed",
      resource: "ACH Batch",
      resourceId: "batch_001",
      performedBy: "system",
      ipAddress: "127.0.0.1",
      details: "ACH batch processing completed",
      status: "success",
      metadata: {
        processedCount: 45,
        successCount: 43,
        failedCount: 2
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ACH Audit Trail</CardTitle>
          <CardDescription>
            Complete audit log of all ACH operations and system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Audit Log Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.resource}</span>
                        <span className="text-sm text-muted-foreground">{log.resourceId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{log.performedBy}</span>
                          <span className="text-xs text-muted-foreground">{log.ipAddress}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={log.details}>
                        {log.details}
                      </div>
                      {log.metadata && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(log.metadata).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">83%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Failed Events</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};