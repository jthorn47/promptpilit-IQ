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
  ShoppingBag,
  TrendingUp,
  FileText,
  CreditCard
} from 'lucide-react';

interface Purchase {
  id: string;
  company_name: string;
  purchase_type: string;
  amount: number;
  status: string;
  purchase_date: string;
  payment_method: string;
  invoice_number: string;
  description: string;
  payment_status: string;
}

export const PurchasesManager: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockPurchases: Purchase[] = [
        {
          id: '1',
          company_name: 'Acme Corp',
          purchase_type: 'Setup Fee',
          amount: 1500,
          status: 'completed',
          purchase_date: '2024-01-15',
          payment_method: 'Credit Card',
          invoice_number: 'INV-2024-001',
          description: 'Initial setup and onboarding',
          payment_status: 'paid'
        },
        {
          id: '2',
          company_name: 'TechStart Inc',
          purchase_type: 'Training Package',
          amount: 2500,
          status: 'completed',
          purchase_date: '2024-01-20',
          payment_method: 'ACH',
          invoice_number: 'INV-2024-002',
          description: 'Executive training program',
          payment_status: 'paid'
        },
        {
          id: '3',
          company_name: 'Local Business LLC',
          purchase_type: 'Consulting Hours',
          amount: 750,
          status: 'pending',
          purchase_date: '2024-02-01',
          payment_method: 'Check',
          invoice_number: 'INV-2024-003',
          description: '5 hours of HR consulting',
          payment_status: 'pending'
        },
        {
          id: '4',
          company_name: 'Global Enterprises',
          purchase_type: 'Custom Module',
          amount: 5000,
          status: 'in_progress',
          purchase_date: '2024-01-30',
          payment_method: 'Wire Transfer',
          invoice_number: 'INV-2024-004',
          description: 'Custom reporting module development',
          payment_status: 'partial'
        }
      ];
      
      setPurchases(mockPurchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to load purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status] || statusColors.pending}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      overdue: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.purchase_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = purchases
    .filter(purchase => purchase.payment_status === 'paid')
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const pendingAmount = purchases
    .filter(purchase => purchase.payment_status === 'pending')
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const completedCount = purchases.filter(purchase => purchase.status === 'completed').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">
            Track one-time purchases, services, and transactions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Purchase
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Purchase Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchases.length > 0 ? Math.round(totalRevenue / purchases.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
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
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        {/* Purchases Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Purchase Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading purchases...
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {purchase.company_name}
                    </TableCell>
                    <TableCell>{purchase.purchase_type}</TableCell>
                    <TableCell className="font-medium">
                      ${purchase.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(purchase.payment_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                        {purchase.invoice_number}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Purchase</DropdownMenuItem>
                          <DropdownMenuItem>View Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Send Payment Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Refund Purchase
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