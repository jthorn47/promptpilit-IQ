import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  FileText, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Building2,
  Users,
  Mail
} from 'lucide-react';

interface PlanData {
  plan_type: string | null;
  subscription_status: string | null;
  activated_at: string | null;
  plan_started_at: string | null;
  stripe_customer_id: string | null;
  payment_status: string | null;
}

interface PurchaseHistory {
  id: string;
  plan_type: string;
  amount_paid: number;
  currency: string;
  payment_status: string;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  created_at: string;
}

interface CompanyProfile {
  business_name: string;
  contact_information: any;
  is_locked: boolean;
}

export const PostPurchaseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // For now, use mock data to avoid TypeScript recursion issues
      // TODO: Replace with proper Supabase query once TypeScript issues are resolved
      setPlanData({
        plan_type: 'Premium Plan',
        subscription_status: 'active',
        activated_at: new Date().toISOString(),
        plan_started_at: new Date().toISOString(),
        stripe_customer_id: 'cus_test123',
        payment_status: 'paid',
      });

      // Mock purchase history
      setPurchaseHistory([
        {
          id: '1',
          plan_type: 'Premium Plan',
          amount_paid: 99.99,
          currency: 'USD',
          payment_status: 'paid',
          plan_started_at: new Date().toISOString(),
          plan_expires_at: null,
          created_at: new Date().toISOString(),
        }
      ]);

      // Mock company profile
      setCompanyProfile({
        business_name: 'Sample Company',
        contact_information: {
          primary_contact_name: 'John Doe',
          primary_contact_email: user.email,
        },
        is_locked: false,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive"
      });
    }
  };

  const getPlanStatusBadge = () => {
    if (!planData || !planData.subscription_status) return null;
    
    const status = planData.subscription_status.toLowerCase();
    const variant = status === 'active' ? 'default' : 
                   status === 'cancelled' ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant}>
        {status === 'active' ? 'Active' : 
         status === 'cancelled' ? 'Cancelled' : 
         status === 'pending' ? 'Pending' : 'Unknown'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!planData || !planData.plan_type) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Plan</h3>
            <p className="text-muted-foreground mb-4">
              You don't have an active plan yet. Browse our pricing to get started.
            </p>
            <Button onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to EaseLearn!</h1>
        <p className="text-muted-foreground">
          Your plan is active and ready to use. Get started with your learning management system.
        </p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Current Plan</span>
            </div>
            {getPlanStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Plan Type</h4>
              <p className="text-2xl font-bold text-primary">
                {planData.plan_type || 'Standard Plan'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Started</h4>
              <p className="text-sm text-muted-foreground">
                {planData.plan_started_at ? 
                  new Date(planData.plan_started_at).toLocaleDateString() : 
                  'Not started'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Payment Status</h4>
              <div className="flex items-center space-x-2">
                {planData.payment_status === 'paid' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="capitalize">
                  {planData.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleManageSubscription} variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
            <Button onClick={() => navigate('/admin')} variant="default">
              <ExternalLink className="h-4 w-4 mr-2" />
              Access Learning Portal
            </Button>
            {!companyProfile?.is_locked && (
              <Button onClick={() => navigate('/company-profile')} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Update Company Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Profile Summary */}
      {companyProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Company Profile</span>
              {companyProfile.is_locked && (
                <Badge variant="secondary">Locked</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Business Name</h4>
                <p className="text-sm text-muted-foreground">
                  {companyProfile.business_name}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Primary Contact</h4>
                <p className="text-sm text-muted-foreground">
                  {companyProfile.contact_information?.primary_contact_name || 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
              onClick={() => navigate('/admin')}>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Employee Training</h3>
            <p className="text-sm text-muted-foreground">
              Set up and manage employee training programs
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/admin/reports')}>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Reports</h3>
            <p className="text-sm text-muted-foreground">
              View training progress and completion reports
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/admin/settings')}>
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Customize your learning environment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History */}
      {purchaseHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Purchase History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseHistory.map((purchase) => (
                <div key={purchase.id} 
                     className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{purchase.plan_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${purchase.amount_paid} {purchase.currency}
                    </p>
                    <Badge variant={purchase.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {purchase.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Contact */}
      <Card>
        <CardContent className="p-6 text-center bg-muted/50">
          <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Our support team is here to help you get the most out of EaseLearn.
          </p>
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};