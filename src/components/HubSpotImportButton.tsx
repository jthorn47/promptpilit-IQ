import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Users, Building2, Briefcase, Activity, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const HubSpotImportButton = () => {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async (importType: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-import', {
        body: { importType }
      });

      if (error) throw error;

      if (data.status === 'processing') {
        toast({
          title: "Import Started",
          description: `HubSpot ${importType} import has been started and is processing in the background.`,
        });
        setImportResults({ status: 'processing', importType });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error importing from HubSpot:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from HubSpot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importTypes = [
    {
      type: 'contacts',
      label: 'Contacts',
      description: 'Import contact information as leads',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      type: 'companies',
      label: 'Companies',
      description: 'Import company information and locations',
      icon: Building2,
      color: 'bg-green-500'
    },
    {
      type: 'deals',
      label: 'Deals',
      description: 'Import deal pipeline data',
      icon: Briefcase,
      color: 'bg-purple-500'
    },
    {
      type: 'activities',
      label: 'Activities',
      description: 'Import call logs and activities',
      icon: Activity,
      color: 'bg-orange-500'
    },
    {
      type: 'tasks',
      label: 'Tasks',
      description: 'Import tasks and follow-ups',
      icon: CheckSquare,
      color: 'bg-red-500'
    },
    {
      type: 'all',
      label: 'All Data',
      description: 'Import all available data types',
      icon: Download,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Import from HubSpot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>HubSpot Data Import</span>
          </DialogTitle>
          <DialogDescription>
            Choose what data to import from HubSpot. This will fetch data from your HubSpot account and integrate it into EaseBase.
          </DialogDescription>
        </DialogHeader>
        
        {importResults ? (
          <div className="py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Import Status</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {importResults.status === 'processing' ? 'Processing...' : importResults.status}
                </Badge>
                <p className="text-muted-foreground">
                  {importResults.importType} import is running in the background. 
                  You can check the progress in the Edge Function logs.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportResults(null);
                    setIsDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {importTypes.map((importType) => {
              const IconComponent = importType.icon;
              return (
                <Card 
                  key={importType.type}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => !loading && handleImport(importType.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${importType.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{importType.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {importType.description}
                        </p>
                        {loading && (
                          <div className="flex items-center mt-2">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">Importing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          <strong>Note:</strong> The import process runs in the background and may take several minutes depending on the amount of data. 
          Imported data will appear in the respective sections (Companies, Leads, Deals, etc.) once processing is complete.
        </div>
      </DialogContent>
    </Dialog>
  );
};