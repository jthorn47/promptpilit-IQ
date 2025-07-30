import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Share, 
  Copy, 
  Mail, 
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { ClientExperienceService } from '../services/ClientExperienceService';

interface CaseVisibilityControlsProps {
  caseId: string;
  caseTitle: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const CaseVisibilityControls: React.FC<CaseVisibilityControlsProps> = ({
  caseId,
  caseTitle,
  onVisibilityChange
}) => {
  const [isClientVisible, setIsClientVisible] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVisibilityStatus();
  }, [caseId]);

  const loadVisibilityStatus = async () => {
    // This would typically load existing visibility settings
    // For now, we'll start with default state
  };

  const handleVisibilityToggle = async (visible: boolean) => {
    setLoading(true);
    try {
      const { error } = await ClientExperienceService.toggleCaseVisibility(caseId, visible);
      if (error) throw error;

      setIsClientVisible(visible);
      onVisibilityChange?.(visible);

      if (visible) {
        // Generate share token when making visible
        await generateShareLink();
        toast.success('Case is now visible to client');
      } else {
        setShareToken(null);
        toast.success('Case is now private');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update case visibility');
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    try {
      const { data, error } = await ClientExperienceService.generateShareToken(
        caseId, 
        clientEmail || undefined
      );
      if (error) throw error;

      setShareToken(data?.share_token || null);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    }
  };

  const getShareUrl = () => {
    if (!shareToken) return '';
    return `${window.location.origin}/case-timeline/${shareToken}`;
  };

  const copyShareLink = async () => {
    const url = getShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const sendEmailNotification = () => {
    const url = getShareUrl();
    const subject = encodeURIComponent(`Case Update: ${caseTitle}`);
    const body = encodeURIComponent(
      `You can track the status of your case "${caseTitle}" using this link:\n\n${url}\n\nThis link will show you real-time updates on your case progress.`
    );
    
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Client Visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Client Visibility</span>
              {isClientVisible ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Visible
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Allow clients to view this case timeline
            </p>
          </div>
          <Switch
            checked={isClientVisible}
            onCheckedChange={handleVisibilityToggle}
            disabled={loading}
          />
        </div>

        {isClientVisible && (
          <>
            <Separator />
            
            {/* Client Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Email (Optional)</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateShareLink}
                  disabled={loading}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used for notifications and feedback collection
              </p>
            </div>

            {/* Share Link */}
            {shareToken && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={getShareUrl()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getShareUrl(), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This secure link allows clients to view case progress
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {shareToken && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendEmailNotification}
                  disabled={!clientEmail}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareLink}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600">Privacy Notice</p>
                  <p className="text-yellow-600/80 mt-1">
                    Only updates marked as "Client Visible" will appear in the timeline. 
                    Internal notes remain private.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};