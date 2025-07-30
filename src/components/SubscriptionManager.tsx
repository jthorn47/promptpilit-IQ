import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, ExternalLink, Calendar, Users, Package, CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  package_id: string;
  employee_count: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  course_package: {
    name: string;
    description: string;
  };
}

export const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          course_package:course_packages(name, description)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">Manage your training subscriptions</p>
        </div>
        {subscriptions.length > 0 && (
          <Button 
            onClick={openCustomerPortal}
            disabled={portalLoading}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {portalLoading ? 'Opening...' : 'Manage Billing'}
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any active training subscriptions yet.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              <Package className="w-4 h-4 mr-2" />
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {subscription.course_package.name} Package
                    </CardTitle>
                    <CardDescription>
                      {subscription.course_package.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Employee Count</p>
                      <p className="text-lg font-bold">{subscription.employee_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Current Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Next Billing</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};