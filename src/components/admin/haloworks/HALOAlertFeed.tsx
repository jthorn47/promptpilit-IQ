import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  Users,
  Bot,
  Building2,
  CreditCard,
  TrendingUp,
  Shield
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface Alert {
  id: string;
  clientName: string;
  clientId: string;
  type: 'risk' | 'compliance' | 'funding' | 'forecast';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  status: 'unresolved' | 'in_progress' | 'resolved';
  assignedTo?: string;
  haloExplanation: string;
}

export const HALOAlertFeed = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  // Mock alert data
  const alerts: Alert[] = [
    {
      id: 'alert_001',
      clientName: 'TechFlow Solutions',
      clientId: 'cl_001',
      type: 'compliance',
      severity: 'high',
      title: 'Missing W-4 Forms',
      description: '3 new employees missing required tax forms',
      timestamp: '2024-01-16 09:30',
      status: 'unresolved',
      haloExplanation: 'HALO detected missing W-4 forms which will prevent accurate tax withholding calculations.'
    },
    {
      id: 'alert_002',
      clientName: 'Green Valley Manufacturing',
      clientId: 'cl_002',
      type: 'funding',
      severity: 'high',
      title: 'Insufficient Funds',
      description: 'Account balance $15K below required minimum for next payroll',
      timestamp: '2024-01-16 08:15',
      status: 'in_progress',
      assignedTo: 'Mike Chen',
      haloExplanation: 'Current account balance insufficient to cover projected payroll of $127K scheduled for 01/30.'
    },
    {
      id: 'alert_003',
      clientName: 'Sunrise Healthcare',
      clientId: 'cl_003',
      type: 'forecast',
      severity: 'medium',
      title: 'Payroll Cost Anomaly',
      description: 'Overtime costs 25% higher than historical average',
      timestamp: '2024-01-15 16:45',
      status: 'resolved',
      haloExplanation: 'HALO identified unusual overtime patterns suggesting potential scheduling inefficiencies.'
    },
    {
      id: 'alert_004',
      clientName: 'Metro Construction LLC',
      clientId: 'cl_004',
      type: 'risk',
      severity: 'medium',
      title: 'Late Timesheet Submissions',
      description: '12 employees submitted timesheets after deadline',
      timestamp: '2024-01-15 14:20',
      status: 'unresolved',
      haloExplanation: 'Consistent late submissions increase payroll processing risks and compliance issues.'
    }
  ];

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'risk': return <Shield className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'funding': return <CreditCard className="h-4 w-4" />;
      case 'forecast': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: Alert['type']) => {
    const colors = {
      risk: 'bg-red-100 text-red-800 border-red-200',
      compliance: 'bg-blue-100 text-blue-800 border-blue-200',
      funding: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      forecast: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <Badge className={colors[type]}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'unresolved':
        return <Badge variant="destructive">Unresolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAlerts(
      selectedAlerts.length === filteredAlerts.length 
        ? [] 
        : filteredAlerts.map(alert => alert.id)
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for alerts:`, selectedAlerts);
    // Implement bulk actions
    setSelectedAlerts([]);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Type: {typeFilter === 'all' ? 'All' : typeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('risk')}>Risk</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('compliance')}>Compliance</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('funding')}>Funding</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('forecast')}>Forecast</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Severity: {severityFilter === 'all' ? 'All' : severityFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSeverityFilter('all')}>All Severities</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter('high')}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter('medium')}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter('low')}>Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedAlerts.length} alert{selectedAlerts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('dismiss')}>
                  Bulk Dismiss
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('escalate')}>
                  Escalate
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('assign')}>
                  Assign to Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            HALO Alert Feed ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={() => handleSelectAlert(alert.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{alert.clientName}</p>
                        <p className="text-xs text-muted-foreground">{alert.clientId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(alert.type)}</TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell>
                    {alert.assignedTo ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-sm">{alert.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Bot className="h-4 w-4 mr-2" />
                          HALO Explanation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Assign to Team
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Admin Override
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Dismiss Alert
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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