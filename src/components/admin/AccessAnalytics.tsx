import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { PermissionGuard } from "@/components/PermissionGuard";
import { AccessLogsViewer } from "./analytics/AccessLogsViewer";
import { PermissionEvaluationHistory } from "./analytics/PermissionEvaluationHistory";
import { AuditTrailViewer } from "./analytics/AuditTrailViewer";
import { UsageAnalytics } from "./analytics/UsageAnalytics";
import { IntelligenceAlerts } from "./analytics/IntelligenceAlerts";
import { 
  Activity, 
  Shield, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  Download,
  Search,
  Filter
} from "lucide-react";

export function AccessAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedOutcome, setSelectedOutcome] = useState("all");

  const handleExportData = (type: string) => {
    // Export functionality would be implemented here
    console.log(`Exporting ${type} data for range:`, dateRange);
  };

  return (
    <PermissionGuard 
      requiredPermission="admin_panel:view" 
      fallback={
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Access denied. You need Super Admin privileges to view access analytics.</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Access Intelligence & Analytics</h1>
            <p className="text-muted-foreground">
              Monitor permissions, audit access, and analyze usage patterns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData('full')}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Global Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Global Filters
            </CardTitle>
            <CardDescription>
              Apply filters across all analytics views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <SimpleDatePicker 
                    selected={dateRange.from} 
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || prev.from }))}
                    placeholderText="From"
                  />
                  <SimpleDatePicker 
                    selected={dateRange.to} 
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || prev.to }))}
                    placeholderText="To"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="User email, module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="hroiq">HRO IQ</SelectItem>
                    <SelectItem value="vault">Vault</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="timetrack">Time IQ</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Outcome</label>
                <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="granted">Access Granted</SelectItem>
                    <SelectItem value="denied">Access Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Access Logs
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permission Evaluations
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <AccessLogsViewer 
              dateRange={dateRange}
              searchQuery={searchQuery}
              selectedModule={selectedModule}
              selectedOutcome={selectedOutcome}
            />
          </TabsContent>

          <TabsContent value="evaluations">
            <PermissionEvaluationHistory 
              dateRange={dateRange}
              searchQuery={searchQuery}
              selectedModule={selectedModule}
              selectedOutcome={selectedOutcome}
            />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrailViewer 
              dateRange={dateRange}
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <UsageAnalytics 
              dateRange={dateRange}
              selectedModule={selectedModule}
            />
          </TabsContent>

          <TabsContent value="intelligence">
            <IntelligenceAlerts 
              dateRange={dateRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}