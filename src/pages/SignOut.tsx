import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Loader2 } from 'lucide-react';

const SignOut = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔐 SignOut component rendering...');

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting to sign out...');
      await signOut(); // Use AuthContext signOut which handles navigation
      console.log('🔐 User signed out successfully');
    } catch (error) {
      console.error('🔐 Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔐 SignOut component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Click the button below to sign out of your account.
          </p>
          <Button 
            onClick={handleSignOut}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              'Sign Out'
            )}
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignOut;