import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Eye, Loader2 } from 'lucide-react';
import { TrainingBuilder } from '@/components/TrainingBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientTrainingBuilderProps {
  // Props interface in case we want to use this component directly
}

export const ClientTrainingBuilder = () => {
  const { clientId, moduleId } = useParams<{ clientId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [moduleAccess, setModuleAccess] = useState<any>(null);

  useEffect(() => {
    if (clientId && moduleId) {
      fetchData();
    }
  }, [clientId, moduleId]);

  const fetchData = async () => {
    if (!clientId || !moduleId) return;

    try {
      setLoading(true);

      // Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Fetch module data from training catalog
      const { data: module, error: moduleError } = await supabase
        .from('training_modules_catalog')
        .select('*')
        .eq('module_id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      // Note: Legacy client_module_access table has been removed
      // HaaLO core modules are now managed through haalo_core_modules table
      const access = { is_enabled: true, module_id: moduleId }; // Default enabled for backward compatibility

      setClientData(client);
      setModuleData(module);
      setModuleAccess(access);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load training module data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(`/admin/companies/${clientId}`);
  };

  const handleBack = () => {
    navigate(`/admin/companies/${clientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (!moduleData || !clientData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>
              The requested training module could not be found or is not available for this client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {clientData.company_name}
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{moduleData.name}</h1>
            <p className="text-muted-foreground">
              Configure training module for {clientData.company_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Status: {moduleAccess?.is_enabled ? 'Enabled' : 'Disabled'}
            </span>
            {moduleAccess?.setup_completed && (
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </div>
      </div>

      <TrainingBuilder
        moduleId={moduleId!}
        moduleName={moduleData.name}
        onClose={handleClose}
        isNewModule={!moduleAccess?.setup_completed}
        clientId={clientId}
      />
    </div>
  );
};

export default ClientTrainingBuilder;