import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TermsAcknowledgmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const TermsAcknowledgmentModal: React.FC<TermsAcknowledgmentModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!isChecked) return;

    setIsSubmitting(true);
    try {
      // Get user's IP address and user agent
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      const userAgent = navigator.userAgent;

      const { error } = await supabase
        .from('terms_acknowledgments')
        .insert({
          user_id: userId,
          terms_version: 'v1.0',
          privacy_version: 'v1.0',
          ip_address: ip,
          user_agent: userAgent,
        });

      if (error) {
        console.error('Error recording terms acknowledgment:', error);
        toast({
          title: 'Error',
          description: 'Failed to record acknowledgment. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome to EaseBase!',
        description: 'Thank you for acknowledging our terms and privacy policy.',
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTermsInNewTab = () => {
    window.open('/terms-of-service', '_blank');
  };

  const openPrivacyInNewTab = () => {
    window.open('/privacy-policy', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to EaseBase</DialogTitle>
          <DialogDescription>
            Please review and acknowledge our Terms of Service and Privacy Policy before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Before you can continue, please review our legal documents:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openTermsInNewTab}
                className="flex-1"
              >
                View Terms of Service
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openPrivacyInNewTab}
                className="flex-1"
              >
                View Privacy Policy
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-md">
            <Checkbox
              id="terms-agreement"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms-agreement"
              className="text-sm leading-relaxed cursor-pointer flex-1"
            >
              I have read and agree to the{' '}
              <button
                onClick={openTermsInNewTab}
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                onClick={openPrivacyInNewTab}
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </button>
              .
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isChecked || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Recording Agreement...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};