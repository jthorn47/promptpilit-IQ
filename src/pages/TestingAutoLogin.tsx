import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

const TestingAutoLogin = () => {
  const { role } = useParams<{ role: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('loading');
  const [message, setMessage] = useState('Initializing login...');
  const [countdown, setCountdown] = useState(0);

  // Get user data from navigation state
  const { email, password, name } = location.state || {};

  useEffect(() => {
    if (!email || !password || !name) {
      setStatus('error');
      setMessage('Missing user credentials. Please select a user from the testing page.');
      return;
    }

    // Add a small delay to avoid immediate rate limiting
    const timer = setTimeout(() => {
      handleAutoLogin();
    }, 1000);

    return () => clearTimeout(timer);
  }, [email, password, name]);

  const handleAutoLogin = async () => {
    try {
      console.log(`🧪 Auto-Login: Starting for ${name} (${email})`);
      setMessage(`Preparing ${name} account...`);
      
      // Sign out first if already logged in
      await supabase.auth.signOut();
      
      // Use our new database function to create/ensure the test account exists
      setMessage(`Setting up test account...`);
      
      let companyName = null;
      if (role === 'company_admin' || role === 'learner') {
        companyName = 'Test Company';
      }
      
      console.log('🧪 Auto-Login: Skipping account creation, trying direct login...');
      // Skip the create_test_account function due to database constraint issues
      // Try to login directly - the users should already exist in the database
      
      // Now try to sign in with the account
      setMessage(`Logging in as ${name}...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }
      
      console.log('🧪 Auto-Login: Successfully signed in!');
      setStatus('success');
      setMessage(`Successfully logged in as ${name}!`);

      toast({
        title: "Login Successful",
        description: `Automatically logged in as ${name}`,
      });

      console.log('🧪 Auto-Login: Redirecting to home...');
      
      // Redirect after a brief delay to show success
      setTimeout(() => {
        window.location.replace('/');
      }, 1500);
      
    } catch (error: any) {
      console.error('🧪 Auto-Login: Error:', error);
      
      // Handle rate limiting specifically
      if (error.message.includes('rate limit') || 
          error.message.includes('Too many') || 
          error.message.includes('login attempts')) {
        setStatus('waiting');
        setMessage('Rate limit reached. Waiting before retry...');
        startCountdown(30); // Wait 30 seconds
        return;
      }
      
      setStatus('error');
      setMessage(`Login failed: ${error.message || 'Unknown error'}`);
      
      toast({
        title: "Auto-Login Failed",
        description: error.message || "Could not automatically log in to test account",
        variant: "destructive",
      });

      // Redirect back to testing page after error
      setTimeout(() => {
        navigate('/testing');
      }, 3000);
    }
  };

  // Countdown function for rate limit waiting
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus('loading');
          setMessage('Retrying login...');
          setTimeout(() => handleAutoLogin(), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'waiting':
        return <Loader2 className="w-8 h-8 animate-spin text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'waiting':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">Auto-Login Testing</CardTitle>
          {name && (
            <Badge variant="outline" className="mx-auto">
              <User className="w-3 h-3 mr-1" />
              {name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">{message}</p>
          
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-xs text-muted-foreground">Please wait...</p>
            </div>
          )}
          
          {status === 'waiting' && countdown > 0 && (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">{countdown}</div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000" 
                  style={{width: `${((30 - countdown) / 30) * 100}%`}}
                ></div>
              </div>
              <p className="text-xs text-orange-600">Waiting for rate limit to reset...</p>
            </div>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-green-600">Redirecting to dashboard...</p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">Redirecting back to testing page...</p>
              <button 
                onClick={() => navigate('/testing')}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Go back now
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingAutoLogin;