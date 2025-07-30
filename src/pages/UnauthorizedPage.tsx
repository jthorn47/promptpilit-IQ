import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-700">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/auth">
                Sign In as Different User
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};