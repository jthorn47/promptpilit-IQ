import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  PlayCircle, 
  PauseCircle,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PayrollRun {
  id: string;
  company_name: string;
  run_name: string;
  status: string;
  pay_date: string;
  payroll_frequency: string;
  service_type: string;
  employee_count: number;
  total_gross: number;
  total_net: number;
  created_at: string;
}

interface RealTimePayrollFeedProps {
  searchQuery: string;
}

const statusConfig = {
  not_started: { label: 'Not Started', color: 'bg-gray-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: PlayCircle },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-yellow-500', icon: PauseCircle },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  errors_flagged: { label: 'Errors Flagged', color: 'bg-red-500', icon: AlertTriangle },
  disbursed: { label: 'Disbursed', color: 'bg-purple-500', icon: CheckCircle },
  tax_filed: { label: 'Tax Filed', color: 'bg-indigo-500', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-emerald-500', icon: CheckCircle }
};

export const RealTimePayrollFeed: React.FC<RealTimePayrollFeedProps> = ({ searchQuery }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('pay_date');

  const { data: payrollRuns, isLoading } = useQuery({
    queryKey: ['payroll-runs', selectedStatus, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('payroll_runs')
        .select(`
          *,
          company_settings!inner(company_name)
        `)
        .order(sortBy, { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchQuery) {
        query = query.ilike('company_settings.company_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.map(run => ({
        ...run,
        company_name: run.company_settings?.company_name || 'Unknown Company'
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Real-Time Payroll Feed</CardTitle>
              <p className="text-sm text-muted-foreground">
                {payrollRuns?.length || 0} active payroll runs
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse"></div>
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
              {payrollRuns?.map((run) => {
                const statusInfo = statusConfig[run.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo?.icon || Clock;
                
                return (
                  <motion.div
                    key={run.id}
                    variants={itemVariants}
                    layout
                    className="group p-4 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${statusInfo?.color || 'bg-gray-500'} animate-pulse`}></div>
                          <StatusIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{run.company_name}</h4>
                          <p className="text-sm text-muted-foreground">{run.run_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{run.employee_count} employees</p>
                          <p className="text-xs text-muted-foreground">
                            ${(run.total_gross || 0).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {statusInfo?.label || 'Unknown'}
                        </Badge>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Pay Date: {new Date(run.pay_date).toLocaleDateString()}</span>
                      <span>{run.payroll_frequency} • {run.service_type}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};