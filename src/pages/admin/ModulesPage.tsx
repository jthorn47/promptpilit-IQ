import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ModulesPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;

      try {
        // Get user's company from their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Failed to load company information');
          return;
        }

        if (!profile?.company_id) {
          toast.error('No company associated with your account');
          return;
        }

        // Get company details
        const { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (companyError) {
          console.error('Error fetching company:', companyError);
          toast.error('Failed to load company details');
          return;
        }

        setCompany(companyData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Company Found</h2>
            <p className="text-muted-foreground text-center">
              Unable to load company information. Please contact support if this issue persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Company Modules</h1>
          <p className="text-muted-foreground">
            Manage and configure modules for {company.company_name}
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">Platform modules have been removed</p>
      </div>
    </div>
  );
}