import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, TrendingUp, AlertTriangle, Target, RefreshCw, Mail } from 'lucide-react';

interface CoachingDigest {
  user_id: string;
  pipeline_summary: {
    active_deals: number;
    total_value: number;
    won_this_week: number;
    response_rate: number;
  };
  attention_needed: Array<{
    deal_name: string;
    days_since_contact: number;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
  patterns: Array<{
    insight: string;
    impact: string;
    confidence: number;
  }>;
  suggested_actions: Array<{
    action: string;
    deal_name?: string;
    priority: 'high' | 'medium' | 'low';
    expected_outcome: string;
  }>;
  generated_at: string;
}

export const CoachingDigest = () => {
  const [digest, setDigest] = useState<CoachingDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<Array<{ id: string; email: string; full_name?: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email')
        .order('email');
      
      if (error) throw error;
      setUsers(data.map(u => ({ id: u.user_id, email: u.email, full_name: u.email })));
      if (data.length > 0) setSelectedUser(data[0].user_id);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateDigest = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-coaching-digest', {
        body: { user_id: selectedUser }
      });

      if (error) throw error;
      setDigest(data);
      toast({
        title: "Coaching Digest Generated",
        description: "AI coaching insights are ready to review.",
      });
    } catch (error) {
      console.error('Error generating digest:', error);
      toast({
        title: "Error",
        description: "Failed to generate coaching digest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmailDigest = async () => {
    if (!digest) return;
    
    try {
      const { error } = await supabase.functions.invoke('send-coaching-email', {
        body: { user_id: selectedUser, digest }
      });

      if (error) throw error;
      toast({
        title: "Email Sent",
        description: "Coaching digest has been sent via email.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send coaching digest email.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Coaching Digest</h1>
          <p className="text-muted-foreground">Weekly personalized insights and recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
          <Button onClick={generateDigest} disabled={loading || !selectedUser}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate Digest
          </Button>
          {digest && (
            <Button onClick={sendEmailDigest} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          )}
        </div>
      </div>

      {digest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pipeline Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{digest.pipeline_summary.active_deals}</div>
                  <div className="text-sm text-muted-foreground">Active Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${digest.pipeline_summary.total_value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Pipeline Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{digest.pipeline_summary.won_this_week}</div>
                  <div className="text-sm text-muted-foreground">Won This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{digest.pipeline_summary.response_rate}%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals Needing Attention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Deals Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {digest.attention_needed.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.deal_name}</div>
                      <div className="text-sm text-muted-foreground">{item.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <div className="text-sm">{item.days_since_contact}d</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Patterns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Success Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {digest.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">{pattern.insight}</div>
                    <div className="text-sm text-muted-foreground mb-2">{pattern.impact}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs">Confidence:</div>
                      <Badge variant="outline">{pattern.confidence}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Suggested Actions for This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {digest.suggested_actions.map((action, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{action.action}</div>
                      {action.deal_name && (
                        <div className="text-sm text-muted-foreground mb-1">Deal: {action.deal_name}</div>
                      )}
                      <div className="text-sm text-muted-foreground">{action.expected_outcome}</div>
                    </div>
                    <Badge variant={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!digest && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Your Coaching Digest</h3>
            <p className="text-muted-foreground text-center mb-4">
              Select a user and click "Generate Digest" to get AI-powered insights and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};