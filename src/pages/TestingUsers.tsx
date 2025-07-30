import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  GraduationCap, 
  Building2, 
  Users, 
  Eye,
  LogIn,
  Briefcase,
  Lock,
  Home,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TestingUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Test accounts available for selection - using secure passwords
  const testAccounts = [
    {
      role: 'super_admin',
      email: 'jeffrey@easeworks.com',
      password: 'Password123!',
      name: 'Super Admin',
      description: 'System-wide administration and oversight',
      icon: Settings,
      color: 'bg-red-500'
    },
    {
      role: 'company_admin',
      email: 'admin@testcompany.com',
      password: 'AdminPass456!',
      name: 'Company Admin',
      description: 'Company-level management and oversight',
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      role: 'learner',
      email: 'learner@testcompany.com',
      password: 'Password123!',
      name: 'Learner',
      description: 'Employee learning and training access',
      icon: GraduationCap,
      color: 'bg-green-500'
    },
    {
      role: 'admin',
      email: 'sales@easeworks.com',
      password: 'Password123!',
      name: 'EaseWorks Admin',
      description: 'EaseWorks internal operations',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      role: 'company_admin',
      email: 'client@testcompany.com',
      password: 'ClientPass456!',
      name: 'Client Admin',
      description: 'Client-level administrative access',
      icon: Briefcase,
      color: 'bg-orange-500'
    }
  ];

  const handleUserSelect = (account: typeof testAccounts[0]) => {
    // Copy credentials to clipboard
    navigator.clipboard.writeText(`Email: ${account.email}\nPassword: ${account.password}`);
    setLoginEmail(account.email);
    setLoginPassword(account.password);
    toast({
      title: "Credentials copied",
      description: "Email and password copied to clipboard and filled in the login form below",
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login successful",
        description: "Redirecting to home...",
      });

      // Redirect to home
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
        <Link 
          to="/dashboard" 
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          to="/admin" 
          className="hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4 mr-1 inline" />
          Admin
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Testing</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Internal Testing</h1>
          <p className="text-muted-foreground mt-2">
            Select a test user to automatically log in as, or navigate back using the breadcrumbs above
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Testing Mode
          </Badge>
        </div>
      </div>

      {/* Test User Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {testAccounts.map((testAccount) => {
          const Icon = testAccount.icon;
          return (
            <Card key={`${testAccount.email}-${testAccount.role}`} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className={`w-12 h-12 rounded-full ${testAccount.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{testAccount.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {testAccount.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {testAccount.email}
                  </p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {testAccount.password}
                  </p>
                  <Badge variant="secondary">
                    {testAccount.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleUserSelect(testAccount)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Copy Credentials
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Login Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Quick Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Select a user above or enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password will auto-fill"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn || !loginEmail || !loginPassword}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Quick Testing Flow</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Click on any user card to auto-fill login form</li>
                <li>• Credentials are copied to clipboard</li>
                <li>• Click "Login" button to sign in instantly</li>
                <li>• Switch between roles by selecting different users</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Available Test Roles</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Super Admin:</strong> System-wide administration</li>
                <li>• <strong>Company Admin:</strong> Company management and oversight</li>
                <li>• <strong>Learner:</strong> Employee training and course access</li>
                <li>• <strong>EaseWorks Admin:</strong> Internal operations</li>
                <li>• <strong>Client Admin:</strong> Client-level administration</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Quick Testing:</strong> Click any user card above to auto-fill the login form with secure credentials. Admin users use <code className="bg-blue-100 px-1 rounded">AdminPass456!</code> and regular users use <code className="bg-blue-100 px-1 rounded">Password123!</code>
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Navigation:</strong> Use the breadcrumb navigation above to return to the Dashboard or Admin panel. You can also access other system features from the main navigation menu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingUsers;