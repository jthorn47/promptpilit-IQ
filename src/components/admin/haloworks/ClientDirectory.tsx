import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pause,
  Eye,
  Settings,
  Users,
  CreditCard
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
} from '@/components/ui/dropdown-menu';

interface Client {
  id: string;
  name: string;
  status: 'active' | 'onboarding' | 'paused';
  employees: number;
  lastPayRun: string;
  fundingMethod: string;
  alerts: number;
  taxAccounts: number;
}

interface ClientDirectoryProps {
  onClientSelect: (clientId: string) => void;
}

export const ClientDirectory = ({ onClientSelect }: ClientDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock client data
  const clients: Client[] = [
    {
      id: 'cl_001',
      name: 'TechFlow Solutions',
      status: 'active',
      employees: 45,
      lastPayRun: '2024-01-15',
      fundingMethod: 'ACH',
      alerts: 0,
      taxAccounts: 3
    },
    {
      id: 'cl_002',
      name: 'Green Valley Manufacturing',
      status: 'active',
      employees: 127,
      lastPayRun: '2024-01-15',
      fundingMethod: 'Wire',
      alerts: 2,
      taxAccounts: 5
    },
    {
      id: 'cl_003',
      name: 'Sunrise Healthcare',
      status: 'onboarding',
      employees: 89,
      lastPayRun: 'N/A',
      fundingMethod: 'Pending',
      alerts: 1,
      taxAccounts: 0
    },
    {
      id: 'cl_004',
      name: 'Metro Construction LLC',
      status: 'paused',
      employees: 78,
      lastPayRun: '2024-01-01',
      fundingMethod: 'ACH',
      alerts: 3,
      taxAccounts: 4
    }
  ];

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'onboarding':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" />Onboarding</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return null;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('onboarding')}>Onboarding</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('paused')}>Paused</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Client Directory ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Last Pay Run</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Tax Accounts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {client.employees}
                    </div>
                  </TableCell>
                  <TableCell>{client.lastPayRun}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {client.fundingMethod}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.alerts > 0 ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        {client.alerts}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">0</Badge>
                    )}
                  </TableCell>
                  <TableCell>{client.taxAccounts}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onClientSelect(client.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onClientSelect(client.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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