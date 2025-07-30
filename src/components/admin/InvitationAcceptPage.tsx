import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface InvitationData {
  id: string;
  email: string;
  role_assignment: {
    role: string;
    name?: string;
  };
  user_attributes: Record<string, any>;
  company_id?: string;
  client_id?: string;
  expires_at: string;
  status: string;
}

export const InvitationAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link - missing token');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        setError('Invalid or expired invitation link');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      setInvitation({
        ...data,
        role_assignment: data.role_assignment as { role: string; name?: string },
        user_attributes: data.user_attributes as Record<string, any>,
      });
    } catch (error: any) {
      console.error('Invitation validation error:', error);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            first_name: invitation.role_assignment.name || '',
            company_id: invitation.company_id,
            client_id: invitation.client_id,
            role: invitation.role_assignment.role,
            user_attributes: invitation.user_attributes,
            invitation_id: invitation.id,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update invitation status
      await supabase
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: authData.user.id,
        })
        .eq('id', invitation.id);

      // Log invitation acceptance
      await supabase.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action_type: 'invitation_accepted',
        p_performed_by: authData.user.id,
        p_metadata: { user_id: authData.user.id }
      });

      toast({
        title: "Success",
        description: "Account created successfully! You can now log in.",
      });

      // Redirect to login or dashboard
      navigate('/auth');

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Validating invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Complete Your Account Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">You've been invited to join as</p>
              <p className="font-semibold">{invitation.role_assignment.role.replace('_', ' ')}</p>
              <p className="text-sm text-muted-foreground">for {invitation.email}</p>
            </div>
          </div>

          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Account & Accept Invitation
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our terms of service
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};