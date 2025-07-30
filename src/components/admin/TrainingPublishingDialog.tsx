import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Building2, 
  Users, 
  Search, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Client {
  id: string;
  company_name: string;
  subscription_status: string;
  services_purchased: any;
}

interface TrainingModule {
  id: string;
  title: string;
  publishing_scope?: string;
}

interface TrainingPublishingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  module: TrainingModule | null;
  onPublish: (moduleId: string, scope: string, clientIds: string[], notes: string) => Promise<void>;
}

export const TrainingPublishingDialog = ({ 
  isOpen, 
  onClose, 
  module, 
  onPublish 
}: TrainingPublishingDialogProps) => {
  const [publishingScope, setPublishingScope] = useState<string>("all_clients");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && module) {
      fetchClients();
      setPublishingScope(module.publishing_scope || "all_clients");
      setSelectedClients([]);
      setNotes("");
      setSearchTerm("");
    }
  }, [isOpen, module]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name, subscription_status, services_purchased")
        .eq("status", "active")
        .order("company_name");

      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientToggle = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handlePublish = async () => {
    if (!module) return;

    if (publishingScope === "specific_clients" && selectedClients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one client for specific publishing",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish(module.id, publishingScope, selectedClients, notes);
      onClose();
      toast({
        title: "Success",
        description: `Training module ${publishingScope === "all_clients" ? "published to all clients" : `published to ${selectedClients.length} selected clients`}`,
      });
    } catch (error) {
      console.error("Error publishing:", error);
      toast({
        title: "Error",
        description: "Failed to publish training module",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Publish Training Module
          </DialogTitle>
          <DialogDescription>
            Choose how to publish <strong>"{module.title}"</strong> to your clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Publishing Scope */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Publishing Scope</Label>
            <RadioGroup value={publishingScope} onValueChange={setPublishingScope}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all_clients" id="all_clients" />
                <Label htmlFor="all_clients" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Publish to All Clients
                  <Badge variant="secondary" className="ml-2">
                    {clients.length} clients
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific_clients" id="specific_clients" />
                <Label htmlFor="specific_clients" className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  Publish to Specific Clients
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Client Selection */}
          {publishingScope === "specific_clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Clients</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={loading}
                >
                  {selectedClients.length === filteredClients.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-64 border rounded-md p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No clients found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                          id={client.id}
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => handleClientToggle(client.id, checked as boolean)}
                        />
                        <Label htmlFor={client.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{client.company_name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {client.subscription_status}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {selectedClients.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Publishing Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this publishing action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Module
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};