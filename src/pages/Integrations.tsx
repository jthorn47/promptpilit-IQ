import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Zap, Plus, Key } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Integrations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Fetch integration providers (available integrations)
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['integration-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_providers')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's connected integrations
  const { data: userIntegrations } = useQuery({
    queryKey: ['user-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Connect integration mutation
  const connectMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('integrations')
        .insert({
          provider_id: providerId,
          name: providers?.find(p => p.id === providerId)?.display_name || 'Integration',
          status: 'active',
          config: {}
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      toast({
        title: "Integration Connected",
        description: "Successfully connected the integration.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect the integration.",
        variant: "destructive",
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai':
      case 'ai_ml':
      case 'ai_video_generation':
        return '🤖';
      case 'crm':
        return '📊';
      case 'email':
        return '📧';
      case 'communication':
        return '💬';
      case 'analytics':
        return '📈';
      case 'payment':
        return '💳';
      case 'automation':
        return '⚡';
      case 'project_management':
        return '📋';
      case 'security':
        return '🔒';
      case 'calendar':
        return '📅';
      case 'cloud_storage':
        return '☁️';
      case 'social_media':
        return '📱';
      case 'design_media':
        return '🎨';
      default:
        return '🔗';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai':
      case 'ai_ml':
      case 'ai_video_generation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'project_management':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'crm':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'email':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'communication':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'analytics':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isConnected = (providerId: string) => {
    return userIntegrations?.some(integration => integration.provider_id === providerId);
  };

  const getAuthTypeDisplay = (authType: string) => {
    switch (authType) {
      case 'api_key':
        return 'API KEY';
      case 'oauth2':
        return 'OAUTH2';
      case 'webhook':
        return 'WEBHOOK';
      default:
        return authType?.toUpperCase() || 'API KEY';
    }
  };

  const getWebhookCount = (provider: any) => {
    return provider.webhook_events?.length || 0;
  };

  if (providersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Integration Hub</h1>
                <p className="text-sm text-muted-foreground">Connect and manage your integrations</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {providers?.length || 0} of {providers?.length || 0} integrations
            </div>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers?.map((provider) => (
            <Card key={provider.id} className="group relative overflow-hidden border border-border/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {getCategoryIcon(provider.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-foreground truncate">
                        {provider.display_name}
                      </CardTitle>
                      <Badge variant="outline" className={`text-xs mt-1 ${getCategoryColor(provider.category)}`}>
                        {provider.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[2.5rem]">
                  {provider.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Auth and Webhook Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Key className="w-3 h-3" />
                      <span>{getAuthTypeDisplay(provider.auth_type)}</span>
                    </div>
                    {getWebhookCount(provider) > 0 && (
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{getWebhookCount(provider)} webhook events</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connect Button */}
                <Button
                  onClick={() => connectMutation.mutate(provider.id)}
                  disabled={connectMutation.isPending || isConnected(provider.id)}
                  className={`w-full ${isConnected(provider.id) 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-primary hover:bg-primary/90'
                  }`}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isConnected(provider.id) ? 'Connected' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {!providers || providers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No integrations available</h3>
            <p className="text-muted-foreground">Check back later for new integrations.</p>
          </div>
        ) : null}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedProvider?.display_name}</DialogTitle>
            <DialogDescription>
              Set up your integration credentials and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <p className="text-sm text-muted-foreground">{selectedProvider?.display_name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Auth Type</label>
              <p className="text-sm text-muted-foreground">{getAuthTypeDisplay(selectedProvider?.auth_type)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-3 h-3 mr-2" />
                Configure Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;