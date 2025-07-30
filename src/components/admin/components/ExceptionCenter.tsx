import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  FileX, 
  CreditCard,
  Clock,
  CheckCircle,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PayrollException {
  id: string;
  exception_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  suggested_fix: string;
  company_name: string;
  created_at: string;
}

const exceptionConfig = {
  ach_failure: { 
    label: 'ACH Failure', 
    icon: CreditCard, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  garnishment_mismatch: { 
    label: 'Garnishment Mismatch', 
    icon: FileX, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  negative_net_pay: { 
    label: 'Negative Net Pay', 
    icon: DollarSign, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  missing_suta_futa: { 
    label: 'Missing SUTA/FUTA', 
    icon: XCircle, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  tax_filing_rejection: { 
    label: 'Tax Filing Rejection', 
    icon: AlertTriangle, 
    color: 'text-red-600',
    bgColor: 'bg-red-600/10'
  }
};

const severityConfig = {
  low: { label: 'Low', color: 'bg-blue-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-500' }
};

export const ExceptionCenter: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('open');

  const { data: exceptions, isLoading } = useQuery({
    queryKey: ['payroll-exceptions', selectedSeverity, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('payroll_exceptions')
        .select(`
          *,
          company_settings!inner(company_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedSeverity !== 'all') {
        query = query.eq('severity', selectedSeverity);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.map(exception => ({
        ...exception,
        company_name: exception.company_settings?.company_name || 'Unknown Company'
      })) || [];
    }
  });

  const handleResolveException = async (exceptionId: string) => {
    const { error } = await supabase
      .from('payroll_exceptions')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', exceptionId);

    if (error) {
      console.error('Error resolving exception:', error);
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Exception Center</CardTitle>
              <p className="text-sm text-muted-foreground">
                {exceptions?.length || 0} active exceptions requiring attention
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Severity</option>
              {Object.entries(severityConfig).map(([severity, config]) => (
                <option key={severity} value={severity}>{config.label}</option>
              ))}
            </select>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse"></div>
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
              {exceptions?.map((exception) => {
                const typeInfo = exceptionConfig[exception.exception_type as keyof typeof exceptionConfig];
                const severityInfo = severityConfig[exception.severity as keyof typeof severityConfig];
                const TypeIcon = typeInfo?.icon || AlertTriangle;
                
                return (
                  <motion.div
                    key={exception.id}
                    variants={itemVariants}
                    layout
                    className={`group p-4 rounded-lg border border-border/40 ${typeInfo?.bgColor || 'bg-red-500/10'} hover:bg-background/80 transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full ${typeInfo?.bgColor || 'bg-red-500/10'} flex items-center justify-center`}>
                            <TypeIcon className={`w-5 h-5 ${typeInfo?.color || 'text-red-500'}`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">{exception.title}</h4>
                            <Badge variant="outline" className={`text-xs ${severityInfo?.color || 'bg-gray-500'} text-white`}>
                              {severityInfo?.label || exception.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{exception.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{exception.company_name}</span>
                            <span>•</span>
                            <span>{typeInfo?.label || exception.exception_type}</span>
                            <span>•</span>
                            <span>{new Date(exception.created_at).toLocaleDateString()}</span>
                          </div>
                          {exception.suggested_fix && (
                            <div className="mt-2 p-2 bg-background/50 rounded border-l-2 border-primary/30">
                              <p className="text-xs text-muted-foreground">
                                <strong>Suggested Fix:</strong> {exception.suggested_fix}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {exception.status === 'open' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResolveException(exception.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
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