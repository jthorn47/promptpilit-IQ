import React, { useState, useEffect } from 'react';
import { Share, Copy, Check, Calendar, Download, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { VaultFile } from '../../hooks/useVaultFiles';

interface FileShareDialogProps {
  file: VaultFile;
  children: React.ReactNode;
  onShareUpdate?: () => void;
}

interface ShareLink {
  id: string;
  token: string;
  expires_at: string | null;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export const FileShareDialog: React.FC<FileShareDialogProps> = ({
  file,
  children,
  onShareUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>('7');
  const [maxDownloads, setMaxDownloads] = useState<string>('unlimited');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadShareLinks();
    }
  }, [isOpen, file.id]);

  const loadShareLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_share_links')
        .select('*')
        .eq('file_id', file.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error) {
      console.error('Error loading share links:', error);
      toast({
        title: "Error",
        description: "Failed to load share links",
        variant: "destructive",
      });
    }
  };

  const createShareLink = async () => {
    try {
      setLoading(true);

      // Calculate expiry date
      let expiresAt = null;
      if (expiryDays !== 'never') {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + parseInt(expiryDays));
        expiresAt = expiry.toISOString();
      }

      // Generate share token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_vault_share_token');

      if (tokenError) throw tokenError;

      // Create share link
      const { data, error } = await supabase
        .from('vault_share_links')
        .insert({
          file_id: file.id,
          token: tokenData,
          expires_at: expiresAt,
          max_downloads: maxDownloads === 'unlimited' ? null : parseInt(maxDownloads),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update file share status
      await supabase
        .from('vault_files')
        .update({ is_shared: true })
        .eq('id', file.id);

      await loadShareLinks();
      onShareUpdate?.();

      toast({
        title: "Success",
        description: "Share link created successfully",
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (token: string) => {
    const shareUrl = `${window.location.origin}/vault/shared/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const revokeShareLink = async (linkId: string) => {
    try {
      await supabase
        .from('vault_share_links')
        .update({ is_active: false })
        .eq('id', linkId);

      await loadShareLinks();
      onShareUpdate?.();

      toast({
        title: "Success",
        description: "Share link revoked",
      });
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast({
        title: "Error",
        description: "Failed to revoke share link",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share "{file.name}"
          </DialogTitle>
          <DialogDescription>
            Create secure links to share this file with others. Links can be set to expire and have download limits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Share Link */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Create New Share Link</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expires After</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloads">Max Downloads</Label>
                <Select value={maxDownloads} onValueChange={setMaxDownloads}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 download</SelectItem>
                    <SelectItem value="5">5 downloads</SelectItem>
                    <SelectItem value="10">10 downloads</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="password"
                checked={requirePassword}
                onCheckedChange={setRequirePassword}
              />
              <Label htmlFor="password">Require password</Label>
            </div>

            {requirePassword && (
              <div className="space-y-2">
                <Label htmlFor="password-input">Password</Label>
                <Input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for link"
                />
              </div>
            )}

            <Button onClick={createShareLink} disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>

          {/* Existing Share Links */}
          {shareLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Active Share Links</h3>
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share className="h-4 w-4" />
                        <span className="font-medium">Share Link</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeShareLink(link.id)}
                      >
                        Revoke
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/vault/shared/${link.token}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.token)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {link.expires_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires {formatDate(link.expires_at)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {link.download_count} / {link.max_downloads || '∞'} downloads
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Created {formatDate(link.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
