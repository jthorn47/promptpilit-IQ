import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      const addDiagnostic = (message: string) => {
        console.log(`🔍 OAUTH DEBUG: ${message}`);
        setDiagnostics(prev => [...prev, message]);
      };

      try {
        addDiagnostic('Starting OAuth callback processing');
        
        // Wait for authentication if needed
        if (!user || !session) {
          addDiagnostic('User not authenticated, checking auth state...');
          
          // Try to get current session
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.user) {
            addDiagnostic('No valid session found, redirecting to login');
            console.error('User not authenticated for OAuth callback');
            setStatus('error');
            toast({
              title: "Authentication Required",
              description: "Please sign in to complete the Microsoft 365 connection.",
              variant: "destructive"
            });
            setTimeout(() => navigate('/auth'), 2000);
            return;
          }
          
          addDiagnostic(`Session found: ${currentSession.user.email}`);
        } else {
          addDiagnostic(`User authenticated: ${user.email}`);
        }
        
        // Validate environment configuration
        const requiredEnvVars = ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_TENANT_ID', 'MICROSOFT_REDIRECT_URI'];
        addDiagnostic('Checking environment configuration...');

        // Extract code and state from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        addDiagnostic(`URL params - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}, error: ${error || 'none'}`);

        if (error) {
          console.error('OAuth error:', error);
          addDiagnostic(`OAuth error received: ${error}`);
          setStatus('error');
          toast({
            title: "Connection Failed",
            description: `OAuth error: ${error}`,
            variant: "destructive"
          });
          setTimeout(() => navigate('/admin/email'), 3000);
          return;
        }

        if (!code || !state) {
          console.error('Missing code or state parameter');
          addDiagnostic('Missing required OAuth parameters');
          setStatus('error');
          toast({
            title: "Connection Failed",
            description: "Invalid OAuth response. Missing authorization code.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/admin/email'), 3000);
          return;
        }

        console.log('Processing OAuth callback with code:', code);
        addDiagnostic('Making request to Edge Function with authentication');

        // Get the current session token for authentication - try multiple approaches
        let accessToken = session?.access_token;
        
        if (!accessToken) {
          addDiagnostic('No session token, fetching fresh session');
          const { data: { session: freshSession } } = await supabase.auth.getSession();
          accessToken = freshSession?.access_token;
        }

        if (!accessToken) {
          addDiagnostic('No access token available after session refresh');
          throw new Error('No authentication token available');
        }

        addDiagnostic('Access token obtained, calling Edge Function');

        // Call edge function to complete OAuth flow with proper authentication
        const { data, error: functionError } = await supabase.functions.invoke('microsoft-oauth-connect', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: { 
            action: 'callback',
            code,
            state
          }
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
          addDiagnostic(`Edge Function error: ${JSON.stringify(functionError)}`);
          setStatus('error');
          toast({
            title: "Connection Failed",
            description: `Failed to complete Microsoft 365 connection: ${functionError.message || 'Unknown error'}`,
            variant: "destructive"
          });
          setTimeout(() => navigate('/admin/email'), 3000);
          return;
        }

        addDiagnostic(`Edge Function response: ${JSON.stringify(data)}`);

        if (data?.success) {
          addDiagnostic(`Connection successful for email: ${data.email}`);
          setStatus('success');
          toast({
            title: "Connection Successful",
            description: `Successfully connected to Microsoft 365 (${data.email})`,
            variant: "default"
          });
          setTimeout(() => navigate('/admin/email'), 2000);
        } else {
          addDiagnostic('Edge Function returned unsuccessful response');
          setStatus('error');
          toast({
            title: "Connection Failed",
            description: "Failed to complete connection. Please try again.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/admin/email'), 3000);
        }

      } catch (error) {
        console.error('Callback handling error:', error);
        setDiagnostics(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        setStatus('error');
        toast({
          title: "Connection Failed",
          description: "An unexpected error occurred during connection.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/admin/email'), 3000);
      }
    };

    // Only proceed if we have URL parameters indicating an OAuth callback
    if (location.search.includes('code=') || location.search.includes('error=')) {
      handleCallback();
    }
  }, [location.search, navigate, toast, user, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-semibold">Connecting to Microsoft 365</h2>
              <p className="text-muted-foreground">
                Please wait while we complete your connection...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="h-8 w-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-600">Connection Successful!</h2>
              <p className="text-muted-foreground">
                Your Microsoft 365 account has been connected successfully. Redirecting...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-8 w-8 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600">Connection Failed</h2>
              <p className="text-muted-foreground">
                There was an issue connecting your Microsoft 365 account. Redirecting...
              </p>
              {diagnostics.length > 0 && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    View Diagnostic Information
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded text-xs font-mono space-y-1">
                    {diagnostics.map((diagnostic, index) => (
                      <div key={index} className="text-muted-foreground">
                        {diagnostic}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;