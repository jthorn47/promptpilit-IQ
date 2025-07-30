import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, TrendingUp, ArrowRight, ShoppingCart, Handshake, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalCompanies: number;
  totalClients: number;
  activeConversions: number;
  clientsBySource: {
    eCommerce: number;
    Sales: number;
    'Manual Deal': number;
  };
  conversionRate: number;
  recentConversions: Array<{
    id: string;
    company_name: string;
    source: string;
    converted_at: string;
    conversion_type: string;
  }>;
}

export const CompanyClientAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalCompanies: 0,
    totalClients: 0,
    activeConversions: 0,
    clientsBySource: { eCommerce: 0, Sales: 0, 'Manual Deal': 0 },
    conversionRate: 0,
    recentConversions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get total companies (not converted to clients)
      const { data: companies, error: companiesError } = await supabase
        .from('company_settings')
        .select('id, lifecycle_stage')
        .neq('lifecycle_stage', 'client');

      if (companiesError) throw companiesError;

      // Get total clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, source');

      if (clientsError) throw clientsError;

      // Get recent conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('client_conversion_audit')
        .select(`
          id,
          conversion_type,
          converted_at,
          notes,
          clients!inner(company_name, source)
        `)
        .order('converted_at', { ascending: false })
        .limit(10);

      if (conversionsError) throw conversionsError;

      // Count clients by source
      const clientsBySource = clients?.reduce((acc, client) => {
        const source = client.source || 'Manual Deal';
        acc[source as keyof typeof acc] = (acc[source as keyof typeof acc] || 0) + 1;
        return acc;
      }, { eCommerce: 0, Sales: 0, 'Manual Deal': 0 }) || { eCommerce: 0, Sales: 0, 'Manual Deal': 0 };

      // Calculate conversion rate (companies that became clients)
      const totalCompanies = companies?.length || 0;
      const totalClients = clients?.length || 0;
      const conversionRate = totalCompanies > 0 ? (totalClients / (totalCompanies + totalClients)) * 100 : 0;

      // Format recent conversions
      const recentConversions = conversions?.map(conv => ({
        id: conv.id,
        company_name: (conv.clients as any)?.company_name || 'Unknown',
        source: (conv.clients as any)?.source || 'Unknown',
        converted_at: conv.converted_at,
        conversion_type: conv.conversion_type
      })) || [];

      setData({
        totalCompanies,
        totalClients,
        activeConversions: recentConversions.length,
        clientsBySource,
        conversionRate,
        recentConversions
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'eCommerce':
        return <ShoppingCart className="h-4 w-4" />;
      case 'Sales':
        return <Handshake className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'eCommerce':
        return 'bg-green-100 text-green-800';
      case 'Sales':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Company-to-Client Analytics</h2>
        <p className="text-gray-600 mt-2">Track the flow from prospects to revenue-generating clients</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Prospects & Leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
            <p className="text-xs text-muted-foreground">Revenue Generating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Company → Client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Conversions</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeConversions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients by Source</CardTitle>
            <CardDescription>How clients originated in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.clientsBySource).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(source)}
                  <span className="font-medium">{source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <Badge className={getSourceColor(source)}>
                    {((count / data.totalClients) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversions</CardTitle>
            <CardDescription>Latest company-to-client migrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentConversions.length > 0 ? (
                data.recentConversions.slice(0, 5).map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">{conversion.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversion.converted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getSourceColor(conversion.source)}>
                      {conversion.source}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent conversions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Company-to-Client Flow</CardTitle>
          <CardDescription>Visual representation of the conversion process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-semibold">Companies</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalCompanies}</p>
              <p className="text-xs text-gray-500">Prospects & Leads</p>
            </div>

            <ArrowRight className="h-8 w-8 text-gray-400" />

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Handshake className="h-8 w-8 text-purple-600" />
              </div>
              <p className="font-semibold">Deals</p>
              <p className="text-xs text-gray-500">Sales Process</p>
            </div>

            <ArrowRight className="h-8 w-8 text-gray-400" />

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold">Clients</p>
              <p className="text-2xl font-bold text-green-600">{data.totalClients}</p>
              <p className="text-xs text-gray-500">Revenue Generating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};