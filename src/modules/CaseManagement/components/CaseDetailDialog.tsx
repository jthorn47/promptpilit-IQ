import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseVisibilityControls } from './CaseVisibilityControls';
import { ActivitiesTab } from '@/components/shared/tabs/ActivitiesTab';

export const CaseDetailDialog = ({ open, onOpenChange, case: selectedCase }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  case: any;
}) => {
  const [visibilityChanged, setVisibilityChanged] = useState(false);

  if (!selectedCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedCase.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="client">Client Experience</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground">{selectedCase.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <p className="text-sm text-muted-foreground">{selectedCase.priority}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground">{selectedCase.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <p className="text-sm text-muted-foreground">{selectedCase.assigned_to || 'Unassigned'}</p>
              </div>
            </div>
            
            {selectedCase.description && (
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedCase.description}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activities">
            <ActivitiesTab 
              activities={[]} 
              readonly={true}
            />
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4">
            <CaseVisibilityControls
              caseId={selectedCase.id}
              caseTitle={selectedCase.title}
              onVisibilityChange={(isVisible) => setVisibilityChanged(true)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};