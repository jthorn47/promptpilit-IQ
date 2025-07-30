import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send } from "lucide-react";

export const TestEmailButton = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "✅ Test Email Sent!",
          description: `Test email sent successfully to ${email}`,
        });
        setEmail("");
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      toast({
        title: "❌ Email Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-md">
      <Mail className="w-4 h-4 text-muted-foreground" />
      <Input
        type="email"
        placeholder="Enter email to test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendTestEmail()}
      />
      <Button 
        onClick={sendTestEmail} 
        disabled={sending || !email}
        size="sm"
      >
        <Send className="w-4 h-4 mr-1" />
        {sending ? 'Sending...' : 'Test'}
      </Button>
    </div>
  );
};