import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, TrendingUp, AlertTriangle, Users, Building, Package } from 'lucide-react';
import { usePropGENWorkflow } from '@/hooks/usePropGENWorkflow';
import { useToast } from '@/hooks/use-toast';

interface PropGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
  spinContent: any;
  riskAssessment: any;
  company: any;
}

export const PropGenModal: React.FC<PropGenModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  spinContent,
  riskAssessment,
  company
}) => {
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { triggerWorkflow } = usePropGENWorkflow(company.id);
  const { toast } = useToast();

  const handleGenerateProposal = async () => {
    if (!opportunity || !spinContent || !riskAssessment) {
      toast({
        title: 'Missing Requirements',
        description: 'SPIN content and Risk Assessment are required to generate a proposal.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const proposalData = {
        opportunity_id: opportunity.id,
        company_id: company.id,
        product_line: opportunity.product_line,
        deal_value: opportunity.deal_value,
        spin_content: spinContent,
        risk_score: riskAssessment.score,
        risk_level: riskAssessment.risk_level,
        custom_notes: customNotes,
        company_details: {
          name: company.name,
          industry: company.industry,
          business_description: company.business_description
        }
      };

      await triggerWorkflow({
        triggerType: 'opportunity_proposal_generated',
        companyId: company.id,
        triggerData: proposalData,
      });

      toast({
        title: 'Proposal Generated',
        description: 'Your proposal has been generated successfully and saved as a draft.',
      });

      onClose();
    } catch (error) {
      console.error('Failed to generate proposal:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate proposal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Proposal with PropGEN
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Opportunity Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{company.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{opportunity.product_line || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{company.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span>${opportunity.deal_value?.toLocaleString() || 'TBD'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SPIN Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>SPIN Selling Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Situation:</strong>
                <p className="text-sm text-muted-foreground mt-1">{spinContent.situation}</p>
              </div>
              <div>
                <strong>Problem:</strong>
                <p className="text-sm text-muted-foreground mt-1">{spinContent.problem}</p>
              </div>
              <div>
                <strong>Implication:</strong>
                <p className="text-sm text-muted-foreground mt-1">{spinContent.implication}</p>
              </div>
              <div>
                <strong>Need-Payoff:</strong>
                <p className="text-sm text-muted-foreground mt-1">{spinContent.need_payoff}</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-2xl font-bold">{riskAssessment.score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <Badge className={getRiskColor(riskAssessment.risk_level)}>
                  {riskAssessment.risk_level} Risk
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Custom Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes (Optional)</label>
            <Textarea
              placeholder="Add any custom notes or specific requirements for this proposal..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Alert */}
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              This will generate a professional proposal using your SPIN content and risk assessment. 
              The proposal will be saved as a draft and linked to this opportunity.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateProposal}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Proposal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};