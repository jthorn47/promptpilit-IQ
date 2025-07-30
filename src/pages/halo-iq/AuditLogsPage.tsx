import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, Download, Filter, Eye } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-20 14:32:15',
      user: 'john.doe@company.com',
      action: 'Employee Record Modified',
      resource: 'Employee ID: 12345',
      severity: 'medium',
      details: 'Updated salary information'
    },
    {
      id: 2,
      timestamp: '2024-01-20 13:45:22',
      user: 'admin@company.com',
      action: 'Policy Document Accessed',
      resource: 'HR Policy Manual v2.1',
      severity: 'low',
      details: 'Document downloaded'
    },
    {
      id: 3,
      timestamp: '2024-01-20 12:18:44',
      user: 'security@company.com',
      action: 'Failed Login Attempt',
      resource: 'System Login',
      severity: 'high',
      details: 'Multiple failed attempts from IP 192.168.1.100'
    },
    {
      id: 4,
      timestamp: '2024-01-20 11:22:10',
      user: 'hr.manager@company.com',
      action: 'Compliance Report Generated',
      resource: 'Q4 Compliance Report',
      severity: 'low',
      details: 'Quarterly compliance summary created'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <StandardPageLayout
      title="Audit Logs"
      subtitle="System audit trails and security logging"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search Audit Logs</CardTitle>
            <CardDescription>Filter and search through system audit trails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by user, action, or resource..." 
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Entries */}
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">User:</span> {log.user}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resource:</span> {log.resource}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Details:</span> {log.details}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardPageLayout>
  );
};