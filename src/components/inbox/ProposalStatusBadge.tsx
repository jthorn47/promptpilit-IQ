import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  TrendingUp,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProposalTracking, ProposalTracking } from '@/hooks/useProposalTracking';
import { useEmailActivityHistory } from '@/hooks/useEmailActivityHistory';
import { ProposalFollowUpSuggestions } from './ProposalFollowUpSuggestions';

interface ProposalStatusBadgeProps {
  emailId: string;
  emailSubject: string;
  emailBody: string;
  senderEmail: string;
  onSendEmail?: (subject: string, body: string) => void;
  className?: string;
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  emailId,
  emailSubject,
  emailBody,
  senderEmail,
  onSendEmail,
  className
}) => {
  const [proposalData, setProposalData] = useState<ProposalTracking | null>(null);
  const [isProposalThread, setIsProposalThread] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { 
    detectProposal, 
    getProposalTracking, 
    createProposalTracking, 
    updateProposalStatus,
    simulateTracking,
    isLoading 
  } = useProposalTracking();
  
  const { addActivity } = useEmailActivityHistory(emailId);

  useEffect(() => {
    const checkProposal = async () => {
      // First check if proposal tracking already exists
      const existing = await getProposalTracking(emailId);
      
      if (existing) {
        setProposalData(existing);
        setIsProposalThread(true);
        return;
      }

      // Auto-detect if this is a proposal email (enhanced detection)
      const isProposal = detectProposal(emailSubject, emailBody);
      setIsProposalThread(isProposal);
      
      if (isProposal) {
        // Auto-create proposal tracking with enhanced detection
        const companyName = extractCompanyName(senderEmail);
        const emailContent = `${emailSubject} ${emailBody}`;
        const created = await createProposalTracking(
          emailId,
          companyName,
          senderEmail,
          emailContent
        );
        
        if (created) {
          setProposalData(created);
          
          // Add activity log
          addActivity({
            type: 'ai_summary', // Using existing type for now
            actor: 'AI Assistant',
            description: `Detected ${created.proposal_type === 'propgen' ? 'PropGEN' : 'PDF'} proposal and started tracking`
          });
          
          // Start simulation for demo
          simulateTracking(created.id);
        }
      }
    };

    checkProposal();
  }, [emailId, emailSubject, emailBody, senderEmail]);

  const extractCompanyName = (email: string): string => {
    const domain = email.split('@')[1];
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  };

  const getStatusConfig = (status: ProposalTracking['status']) => {
    switch (status) {
      case 'sent':
        return {
          label: 'Proposal Sent',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Mail,
          description: 'Proposal has been sent and is awaiting response'
        };
      case 'opened':
        return {
          label: 'Opened',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Eye,
          description: 'Recipient has opened the proposal'
        };
      case 'no_response':
        return {
          label: 'No Response',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          description: 'No response received within expected timeframe'
        };
      case 'closed_won':
        return {
          label: 'Closed-Won',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          description: 'Proposal accepted and deal closed successfully'
        };
      case 'closed_lost':
        return {
          label: 'Closed-Lost',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          description: 'Proposal rejected or deal lost'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FileText,
          description: 'Status unknown'
        };
    }
  };

  const handleStatusUpdate = async (newStatus: ProposalTracking['status']) => {
    if (!proposalData) return;
    
    const success = await updateProposalStatus(proposalData.id, newStatus);
    if (success) {
      setProposalData(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Add activity log
      addActivity({
        type: 'crm_linked', // Using existing type
        actor: 'User',
        description: `Updated proposal status to ${newStatus.replace('_', ' ')}`
      });
    }
  };

  const handleViewInPropGEN = () => {
    // This would open PropGEN or the proposal document
    if (proposalData?.proposal_url) {
      window.open(proposalData.proposal_url, '_blank');
    } else {
      // Fallback - could navigate to PropGEN dashboard
      console.log('Opening PropGEN for proposal:', proposalData?.id);
    }
    
    addActivity({
      type: 'ai_summary', // Using existing type
      actor: 'User',
      description: 'Opened proposal in PropGEN'
    });
  };

  if (!isProposalThread) return null;

  const statusConfig = proposalData ? getStatusConfig(proposalData.status) : null;
  const Icon = statusConfig?.icon || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-2", className)}
    >
      {/* Main Status Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant="outline" 
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 font-medium",
            statusConfig?.color || "bg-blue-100 text-blue-800 border-blue-200"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {proposalData?.proposal_type === 'propgen' ? (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              PropGEN Proposal
            </span>
          ) : (
            statusConfig?.label || 'Proposal Thread'
          )}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-7 px-2 text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Details
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewInPropGEN}
          className="h-7 px-2 text-xs"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View in PropGEN
        </Button>
      </div>

      {/* Proposal Status Card */}
      <AnimatePresence>
        {showDetails && proposalData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 bg-muted/30">
              <div className="space-y-4">
                {/* Status Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-base">Proposal Details</h3>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", statusConfig?.color)}
                  >
                    {statusConfig?.label}
                  </Badge>
                </div>

                {/* Proposal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Proposal Name
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {proposalData.proposal_id 
                          ? `Proposal ${proposalData.proposal_id}` 
                          : `${proposalData.company_name} Proposal`}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Client Name
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {proposalData.company_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Sent Date
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {new Date(proposalData.sent_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Status
                      </label>
                      <p className="text-sm font-medium mt-1 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {statusConfig?.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Stats */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {proposalData.tracking_data?.open_count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {proposalData.tracking_data?.view_count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {Math.floor((Date.now() - new Date(proposalData.sent_at).getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                    <div className="text-xs text-muted-foreground">Days Ago</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={handleViewInPropGEN}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in PropGEN
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate('opened')}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Mark Opened
                  </Button>
                </div>

                {/* Quick Status Updates */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('closed_won')}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Mark Won
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('closed_lost')}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Mark Lost
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Type: {proposalData.proposal_type === 'propgen' ? 'PropGEN' : 'PDF'}</span>
                    <span>Detection: {proposalData.tracking_data?.detection_method === 'propgen_link' ? 'PropGEN Link' : 'Keywords'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-up Suggestions */}
      {proposalData && (
        <ProposalFollowUpSuggestions
          proposal={proposalData}
          onSendEmail={onSendEmail}
        />
      )}
    </motion.div>
  );
};