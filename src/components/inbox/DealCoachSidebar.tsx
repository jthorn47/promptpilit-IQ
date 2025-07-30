import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  MessageSquare,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  content: string;
  tags: string[];
  timestamp: string;
  isRead: boolean;
}

interface ProposalSummary {
  status: 'sent' | 'viewed' | 'responded' | 'won' | 'lost';
  value: number;
  lastActivity: string;
  daysActive: number;
}

interface CoachingAnalysis {
  nextStep: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskReason: string;
  coachingTip: string;
  confidence: number;
  actionItems: string[];
}

interface DealCoachSidebarProps {
  email: Email;
  isOpen: boolean;
  onToggle: () => void;
  threadMessages?: Email[];
}

const mockProposalSummary: ProposalSummary = {
  status: 'sent',
  value: 45000,
  lastActivity: '2 days ago',
  daysActive: 5
};

export const DealCoachSidebar: React.FC<DealCoachSidebarProps> = ({
  email,
  isOpen,
  onToggle,
  threadMessages = []
}) => {
  const [proposalSummary, setProposalSummary] = useState<ProposalSummary | null>(null);
  const [coachingAnalysis, setCoachingAnalysis] = useState<CoachingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isDealThread = email.tags.some(tag => 
    tag.toLowerCase().includes('sales') || tag.toLowerCase().includes('proposal')
  );

  useEffect(() => {
    if (isDealThread && isOpen) {
      fetchProposalSummary();
      generateCoachingAnalysis();
    }
  }, [email.id, isOpen, isDealThread]);

  const fetchProposalSummary = async () => {
    try {
      // In a real app, this would fetch from the database
      // For now, we'll use mock data
      setProposalSummary(mockProposalSummary);
    } catch (error) {
      console.error('Error fetching proposal summary:', error);
    }
  };

  const generateCoachingAnalysis = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('deal-coach-analysis', {
        body: {
          email: {
            subject: email.subject,
            content: email.content,
            sender: email.sender,
            timestamp: email.timestamp,
            tags: email.tags
          },
          threadMessages: threadMessages.map(msg => ({
            subject: msg.subject,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp
          })),
          proposalSummary: proposalSummary
        }
      });

      if (response.error) {
        throw response.error;
      }

      setCoachingAnalysis(response.data);
    } catch (error) {
      console.error('Error generating coaching analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate coaching analysis. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data
      setCoachingAnalysis({
        nextStep: "Follow up with a soft check-in message focusing on addressing any concerns",
        riskLevel: 'medium',
        riskReason: "No response for 2 days after proposal sent",
        coachingTip: "Try using a consultative approach: 'I wanted to check if you have any questions about the proposal. What aspects would you like to discuss further?'",
        confidence: 75,
        actionItems: [
          "Send follow-up email within 24 hours",
          "Include specific value propositions",
          "Ask open-ended questions",
          "Offer a brief call to discuss"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <MessageSquare className="h-4 w-4" />;
      case 'viewed': return <Clock className="h-4 w-4" />;
      case 'responded': return <CheckCircle2 className="h-4 w-4" />;
      case 'won': return <CheckCircle2 className="h-4 w-4" />;
      case 'lost': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isDealThread) {
    return null;
  }

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full bg-background border-l border-border z-50 transition-transform duration-300",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="w-80 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Deal Coach</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Proposal Summary */}
          {proposalSummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Proposal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={cn("text-xs", getStatusColor(proposalSummary.status))}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(proposalSummary.status)}
                      {proposalSummary.status.charAt(0).toUpperCase() + proposalSummary.status.slice(1)}
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Value</span>
                  <span className="text-sm font-bold text-primary">
                    ${proposalSummary.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Activity</span>
                  <span className="text-sm text-muted-foreground">
                    {proposalSummary.lastActivity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Active</span>
                  <span className="text-sm text-muted-foreground">
                    {proposalSummary.daysActive} days
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coaching Analysis */}
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Analyzing deal...</span>
                </div>
              </CardContent>
            </Card>
          ) : coachingAnalysis && (
            <div className="space-y-4">
              {/* Response Risk Level */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Response Risk Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(coachingAnalysis.riskLevel)}
                    <span className={cn("font-medium capitalize", getRiskColor(coachingAnalysis.riskLevel))}>
                      {coachingAnalysis.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coachingAnalysis.riskReason}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confidence</span>
                      <span>{coachingAnalysis.confidence}%</span>
                    </div>
                    <Progress value={coachingAnalysis.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Next Step */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Suggested Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{coachingAnalysis.nextStep}</p>
                </CardContent>
              </Card>

              {/* Coaching Tip */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4" />
                    Coaching Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    {coachingAnalysis.coachingTip}
                  </p>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {coachingAnalysis.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={generateCoachingAnalysis}
            disabled={loading}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </div>

      {/* Toggle Button - Always visible */}
      <Button
        variant="default"
        size="sm"
        onClick={onToggle}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
          "rounded-r-none rounded-l-md px-2 py-8 flex flex-col items-center gap-1",
          "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="text-xs writing-mode-vertical rotate-180">
          Deal Coach
        </span>
      </Button>
    </div>
  );
};