import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Subscription {
  id: string;
  company_name: string;
  subscription_type: string;
  status: string;
  monthly_value: number;
  start_date: string;
  next_billing_date: string;
  contract_length: number;
  notes?: string;
}

export const SubscriptionsManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockSubscriptions: Subscription[] = [
        {
          id: '1',
          company_name: 'Acme Corp',
          subscription_type: 'Payroll Plus',
          status: 'active',
          monthly_value: 299,
          start_date: '2024-01-15',
          next_billing_date: '2024-02-15',
          contract_length: 12,
          notes: 'Standard payroll package'
        },
        {
          id: '2',
          company_name: 'TechStart Inc',
          subscription_type: 'HR Complete',
          status: 'active',
          monthly_value: 599,
          start_date: '2024-01-01',
          next_billing_date: '2024-02-01',
          contract_length: 24,
          notes: 'Full HR suite with compliance'
        },
        {
          id: '3',
          company_name: 'Local Business LLC',
          subscription_type: 'Basic',
          status: 'pending',
          monthly_value: 99,
          start_date: '2024-02-01',
          next_billing_date: '2024-03-01',
          contract_length: 6,
          notes: 'Trial period'
        }
      ];
      
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscription_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.monthly_value, 0);

  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage client subscriptions and recurring revenue
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Contract Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeCount > 0 ? Math.round(totalMRR / activeCount) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per subscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Renewals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        {/* Subscriptions Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Subscription Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Value</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.company_name}
                    </TableCell>
                    <TableCell>{subscription.subscription_type}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>${subscription.monthly_value}/month</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {new Date(subscription.next_billing_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{subscription.contract_length} months</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Subscription</DropdownMenuItem>
                          <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};