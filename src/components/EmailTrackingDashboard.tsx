import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Mail, 
  Clock, 
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  MousePointer,
  Globe,
  User,
  Calendar,
  BarChart3
} from "lucide-react";

interface EmailTrackingData {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  status: string;
  metadata?: any;
  template_id?: string;
}

interface TrackingStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  recent_opens: number;
}

export const EmailTrackingDashboard = () => {
  const [emailData, setEmailData] = useState<EmailTrackingData[]>([]);
  const [trackingStats, setTrackingStats] = useState<TrackingStats>({
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
    open_rate: 0,
    click_rate: 0,
    recent_opens: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
    
    // Set up real-time subscription for email opens
    const channel = supabase
      .channel('email-tracking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'email_sending_history',
          filter: 'opened_at=not.is.null'
        },
        (payload) => {
          console.log('Email opened:', payload);
          handleRealTimeOpen(payload.new as EmailTrackingData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('email_sending_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setEmailData(data || []);
      calculateStats(data || []);
      
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      toast({
        title: "Error",
        description: "Failed to load email tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: EmailTrackingData[]) => {
    const total_sent = data.length;
    const total_opened = data.filter(email => email.opened_at).length;
    const total_clicked = data.filter(email => email.clicked_at).length;
    const open_rate = total_sent > 0 ? (total_opened / total_sent) * 100 : 0;
    const click_rate = total_opened > 0 ? (total_clicked / total_opened) * 100 : 0;
    
    // Count opens in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent_opens = data.filter(email => 
      email.opened_at && new Date(email.opened_at) > oneDayAgo
    ).length;

    setTrackingStats({
      total_sent,
      total_opened,
      total_clicked,
      open_rate,
      click_rate,
      recent_opens
    });
  };

  const handleRealTimeOpen = (newData: EmailTrackingData) => {
    setEmailData(prev => 
      prev.map(email => 
        email.id === newData.id ? { ...email, ...newData } : email
      )
    );
    
    // Show notification
    toast({
      title: "Email Opened! 📧",
      description: `${newData.recipient_email} opened "${newData.subject}"`,
    });
    
    // Recalculate stats
    setEmailData(prev => {
      const updated = prev.map(email => 
        email.id === newData.id ? { ...email, ...newData } : email
      );
      calculateStats(updated);
      return updated;
    });
  };

  const filteredEmails = emailData.filter(email =>
    email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (email: EmailTrackingData) => {
    if (email.clicked_at) return <MousePointer className="w-4 h-4 text-purple-500" />;
    if (email.opened_at) return <Eye className="w-4 h-4 text-green-500" />;
    if (email.status === 'sent') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (email.status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (email: EmailTrackingData) => {
    if (email.clicked_at) return 'Clicked';
    if (email.opened_at) return 'Opened';
    return email.status;
  };

  const getStatusColor = (email: EmailTrackingData) => {
    if (email.clicked_at) return 'bg-purple-100 text-purple-800';
    if (email.opened_at) return 'bg-green-100 text-green-800';
    if (email.status === 'sent') return 'bg-blue-100 text-blue-800';
    if (email.status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Tracking Dashboard</h1>
        <div className="text-center py-8">Loading tracking data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Tracking Dashboard</h1>
          <p className="text-muted-foreground">Real-time email open and click tracking</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchTrackingData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{trackingStats.total_sent}</p>
              </div>
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opened</p>
                <p className="text-2xl font-bold">{trackingStats.total_opened}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{trackingStats.open_rate.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clicked</p>
                <p className="text-2xl font-bold">{trackingStats.total_clicked}</p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{trackingStats.click_rate.toFixed(1)}%</p>
              </div>
              <MousePointer className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Opens</p>
                <p className="text-2xl font-bold">{trackingStats.recent_opens}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Email List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Tracking History</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No emails found</h3>
                <p className="text-muted-foreground">No emails match your search criteria</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(email)}
                    <div>
                      <h3 className="font-semibold">{email.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        To: {email.recipient_email}
                        {email.recipient_name && ` (${email.recipient_name})`}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Sent: {new Date(email.sent_at).toLocaleString()}
                        </span>
                        {email.opened_at && (
                          <span className="flex items-center text-green-600">
                            <Eye className="w-3 h-3 mr-1" />
                            Opened: {new Date(email.opened_at).toLocaleString()}
                          </span>
                        )}
                        {email.metadata?.ip_address && (
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {email.metadata.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(email)}>
                      {getStatusText(email)}
                    </Badge>
                    {email.metadata?.tracking_enabled && (
                      <Badge variant="outline">
                        Tracked
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};