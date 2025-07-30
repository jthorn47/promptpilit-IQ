import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Book, 
  Scale, 
  TrendingUp, 
  BarChart3, 
  Building2, 
  Users,
  DollarSign
} from 'lucide-react';
import { TempSeedAccounts } from '@/components/temp-seed-accounts';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const FinanceIQ: React.FC = () => {
  const [companyId, setCompanyId] = useState<string>('');
  
  console.log('🔧 FinanceIQ Dashboard component mounted');

  // Get user's company ID
  const { data: profile } = useSupabaseQuery(
    ['user-profile'],
    async () => {
      console.log('🔧 FinanceIQ fetching user profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: null };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      console.log('🔧 FinanceIQ profile result:', { data, error });
      return { data, error };
    }
  );

  React.useEffect(() => {
    console.log('🔧 FinanceIQ profile data changed:', profile);
    if (profile?.company_id) {
      setCompanyId(profile.company_id);
    }
  }, [profile]);

  console.log('🔧 FinanceIQ rendering with companyId:', companyId);

  const financeModules = [
    {
      title: 'Chart of Accounts',
      description: 'Manage your company\'s chart of accounts structure',
      icon: FileText,
      path: '/finance/chart-of-accounts',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'General Ledger',
      description: 'View and manage general ledger entries',
      icon: Book,
      path: '/finance/general-ledger',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Trial Balance',
      description: 'Generate trial balance reports',
      icon: Scale,
      path: '/finance/trial-balance',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Profit & Loss',
      description: 'View profit and loss statements',
      icon: TrendingUp,
      path: '/finance/profit-loss',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Balance Sheet',
      description: 'Generate balance sheet reports',
      icon: BarChart3,
      path: '/finance/balance-sheet',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Import Data',
      description: 'Import general ledger data from Excel files',
      icon: FileText,
      path: '/finance/import-data',
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      title: 'Vendors',
      description: 'Manage vendor information and transactions',
      icon: Building2,
      path: '/finance/vendors',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'Clients',
      description: 'Manage client information and transactions',
      icon: Users,
      path: '/finance/clients',
      color: 'bg-pink-50 text-pink-700',
    },
  ];

  return (
    <UnifiedLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              Finance IQ Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial management and accounting intelligence platform
            </p>
          </div>
        </div>
        
        <TempSeedAccounts />
        
        {/* Finance Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card key={module.path} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">
                    {module.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={module.path}>
                      Open {module.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default FinanceIQ;