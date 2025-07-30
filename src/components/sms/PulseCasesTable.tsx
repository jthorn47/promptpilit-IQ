import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PulseCase {
  id: string;
  issue_category: string;
  description: string;
  wants_hr: boolean;
  status: string;
  created_at: string;
  clients: {
    company_name: string;
  };
  employees: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
}

export const PulseCasesTable = () => {
  const { toast } = useToast();
  
  const { data: pulseCases, isLoading, refetch } = useSupabaseQuery(
    'pulse_cases',
    async () => {
      const { data, error } = await supabase
        .from('pulse_cases')
        .select(`
          *,
          clients:client_id(company_name),
          employees:employee_id(first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    }
  );

  const handleMarkAsReviewed = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('pulse_cases')
        .update({ status: 'reviewed' })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Case Updated",
        description: "Case marked as reviewed successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          SMS Pulse Cases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pulseCases && pulseCases.length > 0 ? (
            pulseCases.map((pulseCase: PulseCase) => (
              <div
                key={pulseCase.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={pulseCase.wants_hr ? "destructive" : "secondary"}>
                        {pulseCase.issue_category}
                      </Badge>
                      {pulseCase.wants_hr && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          HR Requested
                        </Badge>
                      )}
                      <Badge 
                        variant={pulseCase.status === 'reviewed' ? 'default' : 'outline'}
                        className="flex items-center gap-1"
                      >
                        {pulseCase.status === 'reviewed' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {pulseCase.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium">
                      {pulseCase.employees?.first_name} {pulseCase.employees?.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {pulseCase.clients?.company_name} • {pulseCase.employees?.phone_number}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Case #{pulseCase.id.substring(0, 8)}</p>
                    <p>{new Date(pulseCase.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-sm">{pulseCase.description}</p>
                </div>

                {pulseCase.status !== 'reviewed' && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsReviewed(pulseCase.id)}
                    >
                      Mark as Reviewed
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No SMS cases submitted yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};