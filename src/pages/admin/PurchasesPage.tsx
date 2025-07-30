import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, ShoppingBag, CreditCard, Calendar, User, ExternalLink } from "lucide-react";

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
  description?: string;
  payment_method?: string;
  receipt_url?: string;
  customer_email?: string;
  customer_name?: string;
}

interface PurchaseData {
  purchases: Purchase[];
  metrics: {
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    successfulPurchases: number;
  };
}

export default function PurchasesPage() {
  const [data, setData] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const { toast } = useToast();

  const fetchPurchaseData = async () => {
    try {
      setLoading(true);
      console.log("Fetching purchase data...");
      
      const { data: stripeData, error } = await supabase.functions.invoke('stripe-dashboard', {
        body: { days: parseInt(timeRange) }
      });

      if (error) {
        console.error("Error fetching purchase data:", error);
        throw error;
      }

      if (!stripeData) {
        throw new Error("No data returned from Stripe function");
      }

      // Transform the data to focus on purchases
      const purchases = stripeData.recentCharges || [];
      const successfulPurchases = purchases.filter((p: Purchase) => p.status === 'succeeded');
      
      const transformedData: PurchaseData = {
        purchases: purchases.map((charge: any) => ({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          customer: charge.customer,
          description: charge.description || 'Purchase',
          customer_email: stripeData.customers?.find((c: any) => c.id === charge.customer)?.email || 'N/A',
          customer_name: stripeData.customers?.find((c: any) => c.id === charge.customer)?.name || 'N/A'
        })),
        metrics: {
          totalRevenue: successfulPurchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0),
          totalTransactions: purchases.length,
          averageOrderValue: successfulPurchases.length > 0 
            ? successfulPurchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0) / successfulPurchases.length 
            : 0,
          successfulPurchases: successfulPurchases.length
        }
      };

      setData(transformedData);
      console.log("Purchase data loaded successfully");
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch purchase data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseData();
  }, [timeRange]);

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load purchase data</p>
        <Button onClick={fetchPurchaseData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">
            Track and manage all customer purchases
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchPurchaseData} variant="outline">
            Refresh
          </Button>
          <Button 
            onClick={() => window.open('/admin/stripe-dashboard', '_self')}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe Dashboard
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(data.metrics.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful Purchases
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.successfulPurchases}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(data.metrics.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {data.purchases.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchases found</h3>
              <p className="text-muted-foreground">
                No purchases have been made in the selected time period.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-mono text-sm">
                      {purchase.id.substring(0, 12)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {purchase.customer_name !== 'N/A' ? purchase.customer_name : 'Guest'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.customer_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(purchase.amount, purchase.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(purchase.created)}
                    </TableCell>
                    <TableCell>
                      {purchase.description || 'Purchase'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}