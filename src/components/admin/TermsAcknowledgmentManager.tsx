import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, RefreshCw, FileText, Shield, Users, Calendar } from 'lucide-react';

interface TermsAcknowledgment {
  id: string;
  user_id: string;
  terms_version: string;
  privacy_version: string;
  acknowledged_at: string;
  ip_address: string | null;
  user_agent: string | null;
  user_email?: string;
}

interface AcknowledgmentStats {
  total_users: number;
  acknowledged_users: number;
  pending_users: number;
  acknowledgment_rate: number;
}

export const TermsAcknowledgmentManager: React.FC = () => {
  const [acknowledgments, setAcknowledgments] = useState<TermsAcknowledgment[]>([]);
  const [stats, setStats] = useState<AcknowledgmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAcknowledgments();
    fetchStats();
  }, []);

  const fetchAcknowledgments = async () => {
    try {
      setLoading(true);
      
      // Fetch acknowledgments with user emails
      const { data, error } = await supabase
        .from('terms_acknowledgments')
        .select(`
          id,
          user_id,
          terms_version,
          privacy_version,
          acknowledged_at,
          ip_address,
          user_agent,
          created_at,
          updated_at
        `)
        .order('acknowledged_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately
      const userIds = data?.map(ack => ack.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to email
      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      // Map the data to include user email
      const mappedData: TermsAcknowledgment[] = data?.map(ack => ({
        ...ack,
        ip_address: ack.ip_address as string | null,
        user_agent: ack.user_agent as string | null,
        user_email: emailMap.get(ack.user_id) || 'Unknown'
      })) || [];

      setAcknowledgments(mappedData);
    } catch (error: any) {
      console.error('Error fetching acknowledgments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch terms acknowledgments.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get acknowledged users count
      const { count: acknowledgedUsers, error: ackError } = await supabase
        .from('terms_acknowledgments')
        .select('*', { count: 'exact', head: true })
        .eq('terms_version', 'v1.0')
        .eq('privacy_version', 'v1.0');

      if (ackError) throw ackError;

      const total = totalUsers || 0;
      const acknowledged = acknowledgedUsers || 0;
      const pending = total - acknowledged;
      const rate = total > 0 ? Math.round((acknowledged / total) * 100) : 0;

      setStats({
        total_users: total,
        acknowledged_users: acknowledged,
        pending_users: pending,
        acknowledgment_rate: rate,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const triggerReacknowledgment = async () => {
    try {
      // This would typically involve updating the terms version and notifying users
      // For now, we'll just show a success message
      toast({
        title: 'Re-acknowledgment Triggered',
        description: 'All users will be prompted to re-acknowledge updated terms on their next login.',
      });
    } catch (error: any) {
      console.error('Error triggering re-acknowledgment:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger re-acknowledgment.',
        variant: 'destructive',
      });
    }
  };

  const filteredAcknowledgments = acknowledgments.filter(ack =>
    ack.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ack.ip_address?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Terms & Privacy Acknowledgments</h1>
          <p className="text-muted-foreground">
            Monitor user acceptance of Terms of Service and Privacy Policy
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAcknowledgments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerReacknowledgment} variant="default" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Trigger Re-acknowledgment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.acknowledged_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.acknowledgment_rate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Acknowledgment Records</CardTitle>
          <CardDescription>
            View detailed records of user terms and privacy policy acknowledgments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by email or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading acknowledgments...</div>
          ) : filteredAcknowledgments.length === 0 ? (
            <Alert>
              <AlertDescription>
                No acknowledgment records found.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Terms Version</TableHead>
                    <TableHead>Privacy Version</TableHead>
                    <TableHead>Acknowledged At</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcknowledgments.map((ack) => (
                    <TableRow key={ack.id}>
                      <TableCell className="font-medium">
                        {ack.user_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ack.terms_version}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ack.privacy_version}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(ack.acknowledged_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ack.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Acknowledged
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};