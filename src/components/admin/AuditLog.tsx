import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, 
  FileSignature, 
  UserCheck, 
  Search, 
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'signature_created' | 'signature_updated' | 'signature_applied' | 'signature_viewed' | 'template_locked' | 'template_unlocked';
  templateName: string;
  department: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: {
    previousValue?: string;
    newValue?: string;
    reason?: string;
  };
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'signature_applied',
    templateName: 'HR Employment Contract',
    department: 'hr',
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Employee onboarding process'
    }
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@company.com',
    action: 'signature_created',
    templateName: 'Finance Approval Form',
    department: 'finance',
    timestamp: '2024-01-15T09:45:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      newValue: 'New signature template for budget approvals'
    }
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@company.com',
    action: 'signature_updated',
    templateName: 'Operations Safety Agreement',
    department: 'operations',
    timestamp: '2024-01-15T08:20:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      previousValue: 'Standard safety protocols',
      newValue: 'Enhanced safety protocols with new requirements'
    }
  },
  {
    id: '4',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'template_locked',
    templateName: 'HR Employment Contract',
    department: 'hr',
    timestamp: '2024-01-15T07:15:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Template finalized and approved by legal'
    }
  },
  {
    id: '5',
    userId: '4',
    userName: 'Emily Brown',
    userEmail: 'emily@company.com',
    action: 'signature_viewed',
    templateName: 'Sales Commission Agreement',
    department: 'sales',
    timestamp: '2024-01-14T16:30:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    details: {}
  },
  {
    id: '6',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@company.com',
    action: 'signature_applied',
    templateName: 'Finance Approval Form',
    department: 'finance',
    timestamp: '2024-01-14T15:45:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      reason: 'Q1 budget approval process'
    }
  },
  {
    id: '7',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@company.com',
    action: 'template_unlocked',
    templateName: 'Operations Safety Agreement',
    department: 'operations',
    timestamp: '2024-01-14T14:20:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Updates required due to new safety regulations'
    }
  },
  {
    id: '8',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'signature_viewed',
    templateName: 'HR Employment Contract',
    department: 'hr',
    timestamp: '2024-01-14T13:10:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {}
  },
  {
    id: '9',
    userId: '4',
    userName: 'Emily Brown',
    userEmail: 'emily@company.com',
    action: 'signature_applied',
    templateName: 'Sales Commission Agreement',
    department: 'sales',
    timestamp: '2024-01-14T12:25:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    details: {
      reason: 'New sales team member onboarding'
    }
  },
  {
    id: '10',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@company.com',
    action: 'signature_updated',
    templateName: 'Finance Approval Form',
    department: 'finance',
    timestamp: '2024-01-14T11:40:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      previousValue: 'Standard approval workflow',
      newValue: 'Enhanced approval workflow with additional validation'
    }
  },
  {
    id: '11',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@company.com',
    action: 'signature_created',
    templateName: 'Operations Incident Report',
    department: 'operations',
    timestamp: '2024-01-14T10:15:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      newValue: 'New incident reporting template for operations team'
    }
  },
  {
    id: '12',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'signature_applied',
    templateName: 'HR Performance Review',
    department: 'hr',
    timestamp: '2024-01-14T09:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Annual performance review cycle'
    }
  },
  {
    id: '13',
    userId: '4',
    userName: 'Emily Brown',
    userEmail: 'emily@company.com',
    action: 'signature_viewed',
    templateName: 'Sales Commission Agreement',
    department: 'sales',
    timestamp: '2024-01-14T08:45:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    details: {}
  },
  {
    id: '14',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@company.com',
    action: 'template_locked',
    templateName: 'Finance Approval Form',
    department: 'finance',
    timestamp: '2024-01-14T07:50:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      reason: 'Template approved by finance director'
    }
  },
  {
    id: '15',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@company.com',
    action: 'signature_applied',
    templateName: 'Operations Safety Agreement',
    department: 'operations',
    timestamp: '2024-01-13T16:20:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Safety training completion certification'
    }
  },
  {
    id: '16',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'signature_updated',
    templateName: 'HR Employment Contract',
    department: 'hr',
    timestamp: '2024-01-13T15:35:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      previousValue: 'Standard employment terms',
      newValue: 'Updated employment terms with remote work policy'
    }
  },
  {
    id: '17',
    userId: '4',
    userName: 'Emily Brown',
    userEmail: 'emily@company.com',
    action: 'signature_created',
    templateName: 'Sales Territory Agreement',
    department: 'sales',
    timestamp: '2024-01-13T14:10:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    details: {
      newValue: 'New territory assignment template for sales team'
    }
  },
  {
    id: '18',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@company.com',
    action: 'signature_viewed',
    templateName: 'Finance Approval Form',
    department: 'finance',
    timestamp: '2024-01-13T13:25:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {}
  },
  {
    id: '19',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@company.com',
    action: 'template_unlocked',
    templateName: 'Operations Incident Report',
    department: 'operations',
    timestamp: '2024-01-13T12:40:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Template revision requested by operations manager'
    }
  },
  {
    id: '20',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@company.com',
    action: 'signature_applied',
    templateName: 'HR Performance Review',
    department: 'hr',
    timestamp: '2024-01-13T11:55:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      reason: 'Mid-year performance evaluation'
    }
  }
];

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || event.action === selectedAction;
    const matchesDepartment = selectedDepartment === 'all' || event.department === selectedDepartment;
    const matchesUser = selectedUser === 'all' || event.userId === selectedUser;
    
    return matchesSearch && matchesAction && matchesDepartment && matchesUser;
  });

  const uniqueUsers = Array.from(new Set(events.map(event => ({ id: event.userId, name: event.userName }))))
    .filter((user, index, self) => self.findIndex(u => u.id === user.id) === index);

  const uniqueDepartments = Array.from(new Set(events.map(event => event.department)));

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'signature_created': return <FileSignature className="w-4 h-4 text-blue-500" />;
      case 'signature_updated': return <FileSignature className="w-4 h-4 text-orange-500" />;
      case 'signature_applied': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'signature_viewed': return <Activity className="w-4 h-4 text-gray-500" />;
      case 'template_locked': return <Activity className="w-4 h-4 text-red-500" />;
      case 'template_unlocked': return <Activity className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'signature_created': return 'bg-blue-100 text-blue-800';
      case 'signature_updated': return 'bg-orange-100 text-orange-800';
      case 'signature_applied': return 'bg-green-100 text-green-800';
      case 'signature_viewed': return 'bg-gray-100 text-gray-800';
      case 'template_locked': return 'bg-red-100 text-red-800';
      case 'template_unlocked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Audit Log
        </CardTitle>
        <CardDescription>
          Last 20 signature and template events per user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="signature_created">Signature Created</SelectItem>
                <SelectItem value="signature_updated">Signature Updated</SelectItem>
                <SelectItem value="signature_applied">Signature Applied</SelectItem>
                <SelectItem value="signature_viewed">Signature Viewed</SelectItem>
                <SelectItem value="template_locked">Template Locked</SelectItem>
                <SelectItem value="template_unlocked">Template Unlocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="user">User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.slice(0, 20).map(event => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">
                          {format(new Date(event.timestamp), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{event.userName}</div>
                        <div className="text-xs text-muted-foreground">{event.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getActionColor(event.action)}>
                      {getActionIcon(event.action)}
                      <span className="ml-1">{formatAction(event.action)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{event.templateName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {event.department.charAt(0).toUpperCase() + event.department.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs">
                      {event.details.reason || event.details.newValue || event.details.previousValue || 'No additional details'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit events found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}