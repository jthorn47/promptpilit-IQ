import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  Users,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientAccount {
  id: string;
  company_name: string;
  halo_risk_score: number;
  payroll_frequency: string;
  last_payroll_date: string;
  next_payroll_date: string;
  total_employees: number;
  monthly_volume: number;
  account_status: string;
  compliance_flags: any[];
}

interface ClientCardsPanelProps {
  searchQuery: string;
}

const getRiskColor = (score: number) => {
  if (score >= 80) return 'text-red-500 bg-red-500/10';
  if (score >= 60) return 'text-orange-500 bg-orange-500/10';
  if (score >= 40) return 'text-yellow-500 bg-yellow-500/10';
  return 'text-green-500 bg-green-500/10';
};

const getRiskLabel = (score: number) => {
  if (score >= 80) return 'High Risk';
  if (score >= 60) return 'Medium Risk';
  if (score >= 40) return 'Low Risk';
  return 'No Risk';
};

export const ClientCardsPanel: React.FC<ClientCardsPanelProps> = ({ searchQuery }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const { data: clientAccounts, isLoading } = useQuery({
    queryKey: ['client-accounts', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('client_accounts')
        .select(`
          *,
          company_settings!inner(company_name)
        `)
        .eq('account_status', 'active')
        .order('halo_risk_score', { ascending: false });

      if (searchQuery) {
        query = query.ilike('company_settings.company_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.map(account => ({
        ...account,
        company_name: account.company_settings?.company_name || 'Unknown Company'
      })) || [];
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Client Accounts</CardTitle>
              <p className="text-sm text-muted-foreground">
                {clientAccounts?.length || 0} active clients
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3 max-h-96 overflow-y-auto"
          >
            <AnimatePresence>
              {clientAccounts?.map((client) => (
                <motion.div
                  key={client.id}
                  variants={itemVariants}
                  layout
                  className="group p-4 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg ${getRiskColor(client.halo_risk_score)} flex items-center justify-center`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-foreground">{client.company_name}</h4>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(client.halo_risk_score)}`}>
                            {client.halo_risk_score}% Risk
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Employees</p>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{client.total_employees}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Monthly Volume</p>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">${(client.monthly_volume || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{client.payroll_frequency}</span>
                          {client.next_payroll_date && (
                            <span>Next: {new Date(client.next_payroll_date).toLocaleDateString()}</span>
                          )}
                        </div>

                        {Array.isArray(client.compliance_flags) && client.compliance_flags.length > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-600">
                              {client.compliance_flags.length} compliance flag(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};