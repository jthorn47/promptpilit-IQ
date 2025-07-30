import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  moduleId: string;
  userId: string;
  type: 'legal' | 'acknowledgment';
  title: string;
  content: string;
  requiresAcknowledgment?: boolean;
}

export const DisclaimerModal = ({
  isOpen,
  onClose,
  onAcknowledge,
  moduleId,
  userId,
  type,
  title,
  content,
  requiresAcknowledgment = false
}: DisclaimerModalProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  // Reset acknowledgment state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  const handleProceed = async () => {
    if (requiresAcknowledgment && !acknowledged) {
      toast({
        title: "Acknowledgment Required",
        description: "Please check the acknowledgment box to continue",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Record the acknowledgment in the database
      const acknowledgmentData: any = {
        training_module_id: moduleId,
        learner_id: userId,
        ip_address: null, // Will be set by server if needed
        user_agent: navigator.userAgent,
      };

      if (type === 'legal') {
        acknowledgmentData.legal_disclaimer_acknowledged = true;
        acknowledgmentData.legal_disclaimer_acknowledged_at = new Date().toISOString();
      } else {
        acknowledgmentData.acknowledgment_disclaimer_acknowledged = true;
        acknowledgmentData.acknowledgment_disclaimer_acknowledged_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('training_acknowledgments')
        .upsert(acknowledgmentData, {
          onConflict: 'training_module_id,learner_id'
        });

      if (error) throw error;

      onAcknowledge();
      onClose();
    } catch (error) {
      console.error('Error recording acknowledgment:', error);
      toast({
        title: "Error",
        description: "Failed to record acknowledgment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'legal':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'acknowledgment':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-2xl max-h-[80vh]"
        aria-describedby="disclaimer-content"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] py-4">
          <div 
            id="disclaimer-content"
            className="prose prose-sm max-w-none text-foreground"
            role="document"
            aria-label="Disclaimer content"
          >
            <p className="whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </div>
        </ScrollArea>

        {requiresAcknowledgment && (
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="acknowledge-disclaimer"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              aria-describedby="acknowledge-label acknowledge-description"
              className="mt-1"
            />
            <div className="space-y-1">
              <label 
                htmlFor="acknowledge-disclaimer" 
                id="acknowledge-label"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I acknowledge and understand
              </label>
              <p id="acknowledge-description" className="text-xs text-muted-foreground">
                By checking this box, you confirm that you have read and understood the above disclaimer.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {type === 'legal' && !requiresAcknowledgment && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleProceed}
            disabled={saving || (requiresAcknowledgment && !acknowledged)}
            className="bg-gradient-primary min-w-[120px]"
          >
            {saving ? 'Recording...' : (requiresAcknowledgment ? 'I Acknowledge' : 'Continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};