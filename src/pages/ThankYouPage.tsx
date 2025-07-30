import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Easeworks PEO</h1>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Thank You for Signing Up!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Check Your Email</p>
                <p className="text-sm text-blue-700">
                  We've sent a verification email to complete your account setup.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-amber-900">Check Your Spam</p>
                <p className="text-sm text-amber-700">
                  If you don't see our email, please check your spam or junk folder.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Our support team is here to assist you.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};