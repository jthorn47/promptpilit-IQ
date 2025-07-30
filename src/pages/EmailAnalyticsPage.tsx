import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  TrendingUp, 
  Users, 
  Eye,
  MousePointer,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface EmailAnalytics {
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export const EmailAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<EmailAnalytics>({
    total_sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
    delivery_rate: 0,
    open_rate: 0,
    click_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailAnalytics();
  }, []);

  const fetchEmailAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for now since email_logs table structure needs verification
      const mockAnalytics = {
        total_sent: 1250,
        delivered: 1185,
        opened: 512,
        clicked: 89,
        bounced: 42,
        failed: 23,
        delivery_rate: 94.8,
        open_rate: 43.2,
        click_rate: 17.4,
      };
      
      setAnalytics(mockAnalytics);
    } catch (error: any) {
      console.error('Error fetching email analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load email analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Analytics</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Analytics</h1>
        <p className="text-muted-foreground">Monitor your email campaign performance and engagement metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.delivery_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.open_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.click_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Delivery Rate</span>
                <span className="text-sm text-muted-foreground">{analytics.delivery_rate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.delivery_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Open Rate</span>
                <span className="text-sm text-muted-foreground">{analytics.open_rate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.open_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Click Rate</span>
                <span className="text-sm text-muted-foreground">{analytics.click_rate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.click_rate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Delivered
                </span>
                <Badge variant="secondary">{analytics.delivered}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 text-blue-600 mr-2" />
                  Opened
                </span>
                <Badge variant="secondary">{analytics.opened}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <MousePointer className="h-4 w-4 text-orange-600 mr-2" />
                  Clicked
                </span>
                <Badge variant="secondary">{analytics.clicked}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  Bounced
                </span>
                <Badge variant="destructive">{analytics.bounced}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  Failed
                </span>
                <Badge variant="destructive">{analytics.failed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};