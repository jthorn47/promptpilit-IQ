import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Eye, EyeOff, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 Auth component mounted');
    // Note: No automatic redirect here - let login handler manage redirects
  }, [navigate]);

  const verifyRecaptcha = async (token: string, action: string = "signup") => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token, action }
      });

      if (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return false;
    }
  };




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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({ title: "Login successful!" });
        // Redirect to super admin launchpad for authenticated users
        window.location.href = '/launchpad/system';
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: 'learner',
            company_name: companyName,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setResetSuccess(true);
      toast({
        title: "Reset link sent!",
        description: "Please check your email for password reset instructions.",
      });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-800 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>

      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 text-slate-800 shadow-2xl">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/lovable-uploads/b0b8a1e8-a233-4006-ac2b-3af7c0fa0ab3.png"
                alt="EaseLearn Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-black text-sm">
                Sign in to access the learning management system
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 mb-6 border border-slate-200">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-slate-600 data-[state=active]:shadow-md"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-slate-600 data-[state=active]:shadow-md"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* Terms acknowledgment text */}
                  <p className="text-xs text-center text-black mt-4">
                    By signing in, you agree to our{' '}
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                      Terms of Service
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                      Privacy Policy
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    .
                  </p>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="off"
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        autoComplete="off"
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      required
                      autoComplete="off"
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                    />
                    <p className="mt-2 text-xs text-black">Company name will be automatically capitalized</p>
                  </div>

                  <div>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      autoComplete="off"
                      className={`bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 h-11 sm:h-10 text-base sm:text-sm ${emailErrors.length > 0 ? 'border-red-500' : ''}`}
                    />
                    {emailErrors.length > 0 && (
                      <p className="mt-2 text-xs text-red-600">{emailErrors[0]}</p>
                    )}
                    <p className="mt-2 text-xs text-black">Please use a real email address - no temporary emails</p>
                  </div>

                  <div>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      autoComplete="off"
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {/* reCAPTCHA v3 is invisible - no widget needed */}
                  </div>

                  <p className="text-xs text-center text-black mt-4">
                    By creating an account, you agree to our{' '}
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                      Terms of Service
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}and{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                      Privacy Policy
                      <ExternalLink className="w-3 h-3" />
                    </a>.
                  </p>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <p className="text-center text-black text-xs mt-8">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Password Reset Modal */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Reset Password</CardTitle>
              <CardDescription className="text-gray-300">
                {resetSuccess
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resetSuccess ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-white">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {error && (
                    <Alert className="bg-red-500/20 border-red-500/50">
                      <AlertDescription className="text-white">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResetForm(false);
                        setResetEmail('');
                        setError('');
                      }}
                      className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-white">
                    A password reset link has been sent to{' '}
                    <span className="font-medium">{resetEmail}</span>
                  </p>
                  <Button
                    onClick={() => {
                      setShowResetForm(false);
                      setResetSuccess(false);
                      setResetEmail('');
                      setError('');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Close
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Auth;