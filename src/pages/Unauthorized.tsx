
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, companyName } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/launchpad');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Current role: <span className="font-medium">{userRole}</span></p>
            {companyName && (
              <p>Company: <span className="font-medium">{companyName}</span></p>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">This could be because:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>You don't have the required permission</li>
              <li>Your company hasn't purchased this module</li>
              <li>Your access has been restricted</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need access? Contact your administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
