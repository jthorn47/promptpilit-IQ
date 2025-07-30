import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface PropGENApprovalInterfaceProps {
  className?: string;
}

const PropGENApprovalInterface: React.FC<PropGENApprovalInterfaceProps> = ({ className }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = React.useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = React.useState('');

  // Fetch pending proposal approvals
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ['pending-proposal-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_approvals')
        .select(`
          *,
          company_settings(company_name, primary_contact_email, primary_contact_phone)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Approve proposal mutation
  const approveProposal = useMutation({
    mutationFn: async ({ approvalId, notes }: { approvalId: string; notes: string }) => {
      const { error } = await supabase
        .from('proposal_approvals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approval_notes: notes
        })
        .eq('id', approvalId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Proposal Approved',
        description: 'The proposal has been approved and download options are now unlocked.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['pending-proposal-approvals'] });
      setSelectedApproval(null);
      setApprovalNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve proposal',
        variant: 'destructive',
      });
    },
  });

  // Reject proposal mutation
  const rejectProposal = useMutation({
    mutationFn: async ({ approvalId, notes }: { approvalId: string; notes: string }) => {
      const { error } = await supabase
        .from('proposal_approvals')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approval_notes: notes
        })
        .eq('id', approvalId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Proposal Rejected',
        description: 'The proposal has been rejected and the submitter will be notified.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['pending-proposal-approvals'] });
      setSelectedApproval(null);
      setApprovalNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject proposal',
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>PropGEN Proposal Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            PropGEN Proposal Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No proposals are currently pending approval.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            PropGEN Proposal Approvals
          </div>
          <Badge variant="secondary">
            {pendingApprovals.length} Pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingApprovals.map((approval) => {
          const proposalData = approval.proposal_data as any;
          const investmentAnalysis = approval.investment_analysis as any;
          const isSelected = selectedApproval === approval.id;
          
          return (
            <Card key={approval.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {(approval.company_settings as any)?.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(approval.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {approval.risk_score && (
                      <Badge variant={getRiskBadgeVariant(approval.risk_score)}>
                        {getRiskLevel(approval.risk_score)} ({approval.risk_score})
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {investmentAnalysis?.adminCost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Admin Cost</p>
                        <p className="font-semibold">
                          {formatCurrency(investmentAnalysis.adminCost)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {investmentAnalysis?.roi && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="font-semibold">
                          {investmentAnalysis.roi}%
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {approval.risk_score && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p className="font-semibold">
                          {approval.risk_score}/100
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Proposal Summary */}
                {proposalData?.summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Proposal Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {proposalData.summary}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  {!isSelected ? (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedApproval(approval.id)}
                    >
                      Review Proposal
                    </Button>
                  ) : (
                    <div className="flex-1 space-y-4">
                      <Textarea
                        placeholder="Add approval notes (optional)..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => approveProposal.mutate({ approvalId: approval.id, notes: approvalNotes })}
                          disabled={approveProposal.isPending || rejectProposal.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => rejectProposal.mutate({ approvalId: approval.id, notes: approvalNotes })}
                          disabled={approveProposal.isPending || rejectProposal.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedApproval(null);
                            setApprovalNotes('');
                          }}
                          disabled={approveProposal.isPending || rejectProposal.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PropGENApprovalInterface;