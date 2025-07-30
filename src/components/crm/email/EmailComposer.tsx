import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, X, Plus, Eye } from 'lucide-react';
import { AIHelperBar } from '@/components/email/AIHelperBar';
import { AIRewriteOptions } from './ai/AIRewriteOptions';
import { AIComposerAssistant } from './ai/AIComposerAssistant';
import { useCRMEmail } from '@/hooks/useCRMEmail';

interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  replyTo?: {
    subject: string;
    recipient: string;
    originalBody?: string;
  };
}

export function EmailComposer({ open, onClose, replyTo }: EmailComposerProps) {
  const { sendEmail, settings } = useCRMEmail();
  const [sending, setSending] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  
  // Form state
  const [to, setTo] = useState(replyTo?.recipient || '');
  const [cc, setCC] = useState('');
  const [bcc, setBCC] = useState('');
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [enableTracking, setEnableTracking] = useState(settings?.enable_tracking ?? true);

  // Parse email addresses from string
  const parseEmails = (emailString: string) => {
    return emailString
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)
      .map(email => ({ email }));
  };

  // Validate email addresses
  const validateEmails = (emails: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.split(',').every(email => emailRegex.test(email.trim()));
  };

  const handleSend = async () => {
    // Validation
    if (!to.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    if (!validateEmails(to) || (cc && !validateEmails(cc)) || (bcc && !validateEmails(bcc))) {
      alert('Please enter valid email addresses');
      return;
    }

    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    if (!body.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const emailData = {
        to: parseEmails(to),
        cc: cc ? parseEmails(cc) : undefined,
        bcc: bcc ? parseEmails(bcc) : undefined,
        subject,
        body: body + (settings?.default_signature ? `\n\n${settings.default_signature}` : ''),
        isHtml: false,
        enableTracking
      };

      await sendEmail(emailData);
      onClose();
      
      // Reset form
      setTo('');
      setCC('');
      setBCC('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 overflow-auto">
          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@company.com, another@company.com"
              className="w-full"
            />
          </div>

          {/* CC/BCC Toggle */}
          <div className="flex gap-2">
            {!showCC && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCC(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                CC
              </Button>
            )}
            {!showBCC && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBCC(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                BCC
              </Button>
            )}
          </div>

          {/* CC Field */}
          {showCC && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cc">CC</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowCC(false);
                    setCC('');
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input
                id="cc"
                value={cc}
                onChange={(e) => setCC(e.target.value)}
                placeholder="cc@company.com"
              />
            </div>
          )}

          {/* BCC Field */}
          {showBCC && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bcc">BCC</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowBCC(false);
                    setBCC('');
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input
                id="bcc"
                value={bcc}
                onChange={(e) => setBCC(e.target.value)}
                placeholder="bcc@company.com"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[200px] resize-none"
            />
            
            {/* AI Composer Assistant */}
            <AIComposerAssistant
              subject={subject}
              body={body}
              onSubjectChange={setSubject}
              onBodyChange={setBody}
              className="mt-3"
            />
          </div>

          {/* Reply Context */}
          {replyTo?.originalBody && (
            <div className="border-l-4 border-muted pl-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Original Message:</p>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-32 overflow-y-auto">
                {replyTo.originalBody}
              </div>
            </div>
          )}

          <Separator />

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Label htmlFor="tracking">Enable email tracking</Label>
              </div>
              <Switch
                id="tracking"
                checked={enableTracking}
                onCheckedChange={setEnableTracking}
              />
            </div>
            
            {enableTracking && (
              <div className="text-sm text-muted-foreground">
                A tracking pixel will be included to detect when the email is opened
              </div>
            )}

            {settings?.default_signature && (
              <div className="space-y-2">
                <Label>Signature Preview</Label>
                <div className="text-sm bg-muted p-3 rounded border-l-4 border-primary">
                  {settings.default_signature}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              @easeworks.com only
            </Badge>
            <Badge variant="outline" className="text-xs">
              Personal use
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}