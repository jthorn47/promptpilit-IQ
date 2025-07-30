import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceDeliverable {
  id: string;
  company_id: string;
  retainer_id?: string;
  case_id?: string;
  deliverable_type: 'policy' | 'document' | 'training' | 'consultation' | 'audit' | 'custom';
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'delivered';
  version: string;
  file_url?: string;
  delivered_at?: string;
  created_by: string;
  approved_by?: string;
  client_visible: boolean;
  billable_hours: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface ServiceAuditTrail {
  id: string;
  deliverable_id: string;
  action_type: 'created' | 'updated' | 'reviewed' | 'approved' | 'delivered' | 'accessed';
  performed_by: string;
  action_details: any;
  timestamp: string;
}

export const useServiceDocumentation = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliverables, isLoading } = useQuery({
    queryKey: ['service-deliverables', companyId],
    queryFn: async () => {
      let query = supabase
        .from('service_deliverables')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceDeliverable[];
    },
    enabled: !!companyId,
  });

  const { data: auditTrail } = useQuery({
    queryKey: ['service-audit-trail', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_audit_trail')
        .select(`
          *,
          service_deliverables(title, company_id)
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const createDeliverableMutation = useMutation({
    mutationFn: async (deliverableData: Omit<ServiceDeliverable, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_deliverables')
        .insert({
          ...deliverableData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-deliverables'] });
      toast({
        title: 'Success',
        description: 'Deliverable created successfully',
      });
    },
  });

  const updateDeliverableMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceDeliverable> }) => {
      const { data, error } = await supabase
        .from('service_deliverables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase
        .from('service_audit_trail')
        .insert({
          deliverable_id: id,
          action_type: 'updated',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          action_details: { updates },
          timestamp: new Date().toISOString()
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['service-audit-trail'] });
      toast({
        title: 'Success',
        description: 'Deliverable updated successfully',
      });
    },
  });

  const deliverToClientMutation = useMutation({
    mutationFn: async ({ deliverableId, deliveryNotes }: { deliverableId: string; deliveryNotes?: string }) => {
      const { data, error } = await supabase
        .from('service_deliverables')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          client_visible: true,
          metadata: {
            delivery_notes: deliveryNotes,
            delivered_by: (await supabase.auth.getUser()).data.user?.id
          }
        })
        .eq('id', deliverableId)
        .select()
        .single();

      if (error) throw error;

      // Log the delivery
      await supabase
        .from('service_audit_trail')
        .insert({
          deliverable_id: deliverableId,
          action_type: 'delivered',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          action_details: { delivery_notes: deliveryNotes },
          timestamp: new Date().toISOString()
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['service-audit-trail'] });
      toast({
        title: 'Delivered',
        description: 'Deliverable has been delivered to client',
      });
    },
  });

  const getDeliverablesByStatus = (status: ServiceDeliverable['status']) => {
    return deliverables?.filter(d => d.status === status) || [];
  };

  const getClientVisibleDeliverables = () => {
    return deliverables?.filter(d => d.client_visible) || [];
  };

  const getTotalBillableHours = () => {
    return deliverables?.reduce((sum, d) => sum + (d.billable_hours || 0), 0) || 0;
  };

  return {
    deliverables,
    auditTrail,
    isLoading,
    createDeliverable: createDeliverableMutation.mutate,
    updateDeliverable: updateDeliverableMutation.mutate,
    deliverToClient: deliverToClientMutation.mutate,
    getDeliverablesByStatus,
    getClientVisibleDeliverables,
    getTotalBillableHours,
  };
};