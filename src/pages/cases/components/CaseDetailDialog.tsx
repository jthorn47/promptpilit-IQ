
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/modules/CaseManagement/types';
import { Spinner } from '@/components/ui/spinner';

export function CaseDetailDialog({ 
  open, 
  onOpenChange, 
  caseId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  caseId?: string;
}) {
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId || !open) return;

    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('cases')
          .select(`
            *,
            client:client_id(company_name)
          `)
          .eq('id', caseId)
          .single();

        if (error) throw error;
        if (data) setCase(data as unknown as Case);
      } catch (error) {
        console.error('Error fetching case:', error);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{loading ? 'Loading...' : case_?.title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : case_ ? (
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge variant={
                    case_.status === 'open' ? 'default' :
                    case_.status === 'in_progress' ? 'secondary' :
                    case_.status === 'waiting' ? 'outline' :
                    'destructive'
                  }>
                    {case_.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Priority</h3>
                  <Badge variant={
                    case_.priority === 'high' ? 'destructive' :
                    case_.priority === 'medium' ? 'secondary' :
                    'outline'
                  }>
                    {case_.priority}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p className="text-sm">{case_.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p className="text-sm">{new Date(case_.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Assigned To</h3>
                  <p className="text-sm">{case_.assigned_to || 'Unassigned'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Team</h3>
                  <p className="text-sm">{case_.assigned_team || 'None'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Client</h3>
                  <p className="text-sm">{case_.client?.company_name || 'None'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Hours</h3>
                  <p className="text-sm">{case_.actual_hours} / {case_.estimated_hours || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm mt-1 whitespace-pre-line">{case_.description}</p>
              </div>
              
              {case_.internal_notes && (
                <div>
                  <h3 className="text-sm font-medium">Internal Notes</h3>
                  <p className="text-sm mt-1 whitespace-pre-line">{case_.internal_notes}</p>
                </div>
              )}
              
              {case_.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {case_.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activities">
              <p className="text-sm text-muted-foreground">
                Activity history will be shown here.
              </p>
            </TabsContent>
            
            <TabsContent value="time">
              <p className="text-sm text-muted-foreground">
                Time tracking will be shown here.
              </p>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No case selected
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
