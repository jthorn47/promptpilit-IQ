import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, Users, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TimeAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);


  // Company name capitalization helper
  const capitalizeCompanyName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Handle special cases
        if (['llc', 'inc', 'corp', 'ltd', 'co'].includes(word)) {
          return word.toUpperCase();
        }
        if (['and', 'or', 'of', 'the', 'a', 'an'].includes(word) && name.indexOf(word) > 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Enhanced email validation
  const validateEmail = async (email: string) => {
    const errors: string[] = [];
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email format');
      return errors;
    }

    // Check for common fake/disposable email domains
    const domain = email.split('@')[1]?.toLowerCase();
    const fakeDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
      'mailinator.com', 'yopmail.com', 'temp-mail.org',
      'disposablemail.com', 'throwaway.email', 'maildrop.cc'
    ];
    
    if (fakeDomains.includes(domain)) {
      errors.push('Please use a real email address, not a temporary one');
    }

    // Check if it looks like a real domain (has common TLD)
    const realTlds = ['.com', '.org', '.net', '.edu', '.gov', '.mil', '.int', '.co.', '.io', '.me'];
    const hasRealTld = realTlds.some(tld => domain.includes(tld));
    
    if (!hasRealTld) {
      errors.push('Please use a valid email domain');
    }

    return errors;
  };

  // Handle company name change with auto-capitalization
  const handleCompanyNameChange = (value: string) => {
    if (value.length > 0) {
      const capitalized = capitalizeCompanyName(value);
      setCompanyName(capitalized);
    } else {
      setCompanyName(value);
    }
  };

  // Handle email change with validation
  const handleEmailChange = async (value: string) => {
    setEmail(value);
    if (value.length > 0) {
      const errors = await validateEmail(value);
      setEmailErrors(errors);
    } else {
      setEmailErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isSignUp && (!firstName || !lastName || !phone || !companyName)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate email for signup
    if (isSignUp && emailErrors.length > 0) {
      setError(emailErrors[0]);
      setLoading(false);
      return;
    }


    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Use direct account creation with proper duplicate checking
        console.log('Creating account directly with database function...');
        
        const { data, error: createError } = await supabase.rpc('create_test_account', {
          user_email: email,
          user_password: password,
          user_role: 'learner',
          company_name: companyName
        });
        
        // Parse the JSON response
        const result = data as any;
        
        console.log('Database function response:', result);
        
        if (createError || !result?.success) {
          console.error('Account creation error:', createError || result);
          
          const errorMessage = result?.error || createError?.message || 'Unable to create account. Please try again.';
          
          // Handle duplicate email case  
          if (errorMessage.includes('already exists') || result?.existing_user) {
            setActiveTab('signin');
            return;
          }
          
          setError(errorMessage);
          return;
        }
        
        console.log('Account created successfully:', data);
        
        // Send welcome email via our email service
        try {
          await supabase.functions.invoke('send-auth-email', {
            body: {
              email,
              type: 'welcome',
              firstName,
              lastName
            }
          });
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.log('Welcome email failed, but account was created:', emailError);
        }
        
        // Show email verification page instead of switching back to signin
        setShowEmailVerification(true);
        // Clear form
        setFirstName('');
        setLastName('');
        setPhone('');
        setCompanyName('');
        setPassword('');
        setEmailErrors([]);
        
      } else {
        // Sign in flow
        console.log('Signing in...');
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else {
            setError(error.message);
          }
        } else {
          // Successful sign in - user will be redirected by AuthContext
          console.log('Sign in successful');
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      // Use our custom email service for password reset
      const resetUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email,
          type: 'reset',
          resetUrl
        }
      });

      if (error) {
        throw error;
      }

      setMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EaseLearn</h1>
          </div>
          <h2 className="text-xl font-semibold">Portal Login</h2>
          <p className="text-muted-foreground">Access your learning management system</p>
        </div>

        {/* Auth Form or Email Verification */}
        <Card>
          {!showEmailVerification ? (
            <>
              <CardHeader>
                <CardTitle className="text-center">Welcome</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
            {!showForgotPassword ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                     <div className="space-y-2">
                       <Input
                         type="text"
                         placeholder="Company Name"
                         value={companyName}
                         onChange={(e) => handleCompanyNameChange(e.target.value)}
                         disabled={loading}
                         required
                       />
                       <p className="text-xs text-muted-foreground">
                         Company name will be automatically capitalized
                       </p>
                     </div>
                     <div className="space-y-2">
                       <Input
                         type="email"
                         placeholder="Email Address"
                         value={email}
                         onChange={(e) => handleEmailChange(e.target.value)}
                         disabled={loading}
                         required
                         className={emailErrors.length > 0 ? 'border-destructive' : ''}
                       />
                       {emailErrors.length > 0 && (
                         <p className="text-xs text-destructive">{emailErrors[0]}</p>
                       )}
                       <p className="text-xs text-muted-foreground">
                         Please use a real email address - no temporary emails
                       </p>
                     </div>
                     <div className="space-y-2">
                       <Input
                         type="tel"
                         placeholder="Phone Number"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         disabled={loading}
                         required
                       />
                     </div>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h3 className="font-medium">Reset Password</h3>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      We'll send you a link to reset your password
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
              </CardContent>
            </>
          ) : (
            // Email Verification Screen
            <>
              <CardHeader>
                <CardTitle className="text-center">Check Your Email</CardTitle>
                <CardDescription className="text-center">
                  We've sent you a verification email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Account Created Successfully!</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification email to:
                    </p>
                    <p className="font-medium text-primary">{email}</p>
                  </div>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Please check your email and click the verification link to activate your account.</p>
                    <p>
                      <strong>Important:</strong> You must verify your email before you can sign in.
                    </p>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={() => {
                        setShowEmailVerification(false);
                        setActiveTab('signin');
                        setEmail(''); // Clear email for signin
                      }}
                      className="w-full"
                    >
                      Continue to Sign In
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Didn't receive the email?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await supabase.functions.invoke('send-auth-email', {
                              body: {
                                email,
                                type: 'welcome',
                                firstName,
                                lastName
                              }
                            });
                            setMessage('Verification email sent again!');
                          } catch (error) {
                            setError('Failed to resend email. Please try again.');
                          }
                        }}
                      >
                        Resend Email
                      </Button>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="mt-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </>
          )}
        </Card>

        {/* Features */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Time Tracking</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Team Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};