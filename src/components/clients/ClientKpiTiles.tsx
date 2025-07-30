import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, ShieldCheck, GraduationCap, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type OnboardingProfile = Database['public']['Tables']['client_onboarding_profiles']['Row'];

interface KpiData {
  totalClients: number;
  peoClients: number;
  asoClients: number;
  payrollClients: number;
  hroClients: number;
  lmsClients: number;
  totalEmployees: number;
}

export const ClientKpiTiles = () => {
  const [kpiData, setKpiData] = useState<KpiData>({
    totalClients: 0,
    peoClients: 0,
    asoClients: 0,
    payrollClients: 0,
    hroClients: 0,
    lmsClients: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchKpiData = async () => {
    try {
      setLoading(true);
      
      // Fetch active client onboarding profiles
      const { data: profiles, error } = await supabase
        .from('client_onboarding_profiles')
        .select('service_types, number_of_employees, client_status')
        .eq('client_status', 'active');

      if (error) throw error;

      if (profiles) {
        const kpi: KpiData = {
          totalClients: profiles.length,
          peoClients: 0,
          asoClients: 0,
          payrollClients: 0,
          hroClients: 0,
          lmsClients: 0,
          totalEmployees: 0,
        };

        profiles.forEach((profile: OnboardingProfile) => {
          // Count service types
          if (profile.service_types?.includes('PEO')) kpi.peoClients++;
          if (profile.service_types?.includes('ASO')) kpi.asoClients++;
          if (profile.service_types?.includes('Payroll')) kpi.payrollClients++;
          if (profile.service_types?.includes('HRO')) kpi.hroClients++;
          if (profile.service_types?.includes('LMS')) kpi.lmsClients++;
          
          // Sum employee counts
          kpi.totalEmployees += profile.number_of_employees || 0;
        });

        setKpiData(kpi);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
    
    // Set up real-time updates
    const channel = supabase
      .channel('kpi-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_onboarding_profiles'
        },
        () => {
          fetchKpiData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const kpiTiles = [
    {
      title: "Total Clients",
      value: kpiData.totalClients,
      icon: Building2,
      description: "Active clients",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "PEO Clients", 
      value: kpiData.peoClients,
      icon: Briefcase,
      description: "Professional Employer Organization",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "ASO Clients",
      value: kpiData.asoClients,
      icon: ShieldCheck,
      description: "Administrative Services Only",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Payroll Clients",
      value: kpiData.payrollClients,
      icon: DollarSign,
      description: "Payroll services",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "HRO Clients",
      value: kpiData.hroClients,
      icon: Users,
      description: "Human Resources Outsourcing",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "LMS Clients",
      value: kpiData.lmsClients,
      icon: GraduationCap,
      description: "Learning Management System",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Total Employees",
      value: kpiData.totalEmployees.toLocaleString(),
      icon: TrendingUp,
      description: "Across all active clients",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="flex-1">
                  <div className="h-4 w-12 bg-muted rounded mb-1" />
                  <div className="h-6 w-8 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {kpiTiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tile.bgColor}`}>
                  <Icon className={`w-5 h-5 ${tile.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {tile.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {tile.value}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tile.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};