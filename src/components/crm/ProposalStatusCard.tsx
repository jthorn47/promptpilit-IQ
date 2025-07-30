import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Eye, Send, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ProposalStatusCardProps {
  proposal?: any;
  onViewProposal?: () => void;
  onMarkSent?: () => void;
  onMarkSigned?: () => void;
}

export const ProposalStatusCard: React.FC<ProposalStatusCardProps> = ({
  proposal,
  onViewProposal,
  onMarkSent,
  onMarkSigned
}) => {
  if (!proposal) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No proposal generated yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'signed': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Proposal
          </div>
          <Badge className={getStatusColor(proposal.status)}>
            {getStatusIcon(proposal.status)}
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{format(new Date(proposal.created_at), 'MMM dd, yyyy')}</span>
          </div>
          
          {proposal.sent_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sent:</span>
              <span>{format(new Date(proposal.sent_at), 'MMM dd, yyyy')}</span>
            </div>
          )}
          
          {proposal.signed_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Signed:</span>
              <span>{format(new Date(proposal.signed_at), 'MMM dd, yyyy')}</span>
            </div>
          )}
          
          {proposal.valid_until && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valid Until:</span>
              <span className={
                new Date(proposal.valid_until) < new Date() 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }>
                {format(new Date(proposal.valid_until), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewProposal}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          
          {proposal.status === 'draft' && onMarkSent && (
            <Button 
              size="sm" 
              onClick={onMarkSent}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Mark Sent
            </Button>
          )}
          
          {proposal.status === 'sent' && onMarkSigned && (
            <Button 
              size="sm" 
              onClick={onMarkSigned}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Signed
            </Button>
          )}
        </div>

        {proposal.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{proposal.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};