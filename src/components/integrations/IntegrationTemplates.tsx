import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  FileText,
  Search,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Settings,
  Copy,
  Star,
  Filter,
  Zap,
  Database,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  provider_name: string;
  template_type: string;
  configuration: any;
  field_mappings: any;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
}

interface IntegrationTemplatesProps {
  onTemplateLoad?: (template: IntegrationTemplate) => void;
}

export function IntegrationTemplates({ onTemplateLoad }: IntegrationTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load integration templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = async (template: IntegrationTemplate) => {
    try {
      // If there's a callback, use it
      if (onTemplateLoad) {
        onTemplateLoad(template);
        toast({
          title: "Template Loaded",
          description: `${template.name} template has been loaded for customization`,
        });
        return;
      }

      // Otherwise, create a new integration from the template
      const { data: userData } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', userData.user?.id)
        .single();

      // First, find or create the provider
      let { data: provider } = await supabase
        .from('integration_providers')
        .select('id')
        .eq('name', template.provider_name.toLowerCase())
        .single();

      if (!provider) {
        // Create a basic provider if it doesn't exist
        const { data: newProvider, error: providerError } = await supabase
          .from('integration_providers')
          .insert([{
            name: template.provider_name.toLowerCase(),
            display_name: template.provider_name,
            category: 'other',
            description: `Provider for ${template.provider_name}`,
            auth_type: 'api_key',
            config_schema: {},
            webhook_events: [],
            is_active: true
          }])
          .select()
          .single();

        if (providerError) throw providerError;
        provider = newProvider;
      }

      // Create integration from template
      const { error } = await supabase
        .from('integrations')
        .insert([{
          provider_id: provider.id,
          name: `${template.name} (from template)`,
          configuration: template.configuration,
          status: 'inactive', // Start as inactive for user to configure
          sync_frequency: template.configuration?.frequency || 'manual',
          sync_enabled: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Integration created from template successfully",
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    }
  };

  const duplicateTemplate = async (template: IntegrationTemplate) => {
    try {
      const { error } = await supabase
        .from('integration_templates')
        .insert([{
          name: `${template.name} (Copy)`,
          description: template.description,
          provider_name: template.provider_name,
          template_type: template.template_type,
          configuration: template.configuration,
          field_mappings: template.field_mappings,
          is_active: true,
          is_public: false
        }]);

      if (error) throw error;

      await loadTemplates();
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sync': return <RefreshCw className="h-4 w-4" />;
      case 'import': return <Download className="h-4 w-4" />;
      case 'export': return <Upload className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sync': return 'bg-blue-100 text-blue-800';
      case 'import': return 'bg-green-100 text-green-800';
      case 'export': return 'bg-orange-100 text-orange-800';
      case 'webhook': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueProviders = () => {
    const providers = templates.map(t => t.provider_name);
    return ['all', ...Array.from(new Set(providers))];
  };

  const getUniqueTypes = () => {
    const types = templates.map(t => t.template_type);
    return ['all', ...Array.from(new Set(types))];
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.provider_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = providerFilter === 'all' || template.provider_name === providerFilter;
    const matchesType = typeFilter === 'all' || template.template_type === typeFilter;
    
    return matchesSearch && matchesProvider && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Integration Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-configured connectors for common integrations
          </p>
        </div>
        <Button variant="outline" onClick={loadTemplates}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            {getUniqueProviders().map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider === 'all' ? 'All Providers' : provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {getUniqueTypes().map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-muted-foreground text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getTypeIcon(template.template_type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.provider_name}
                        </Badge>
                        <Badge className={getTypeColor(template.template_type) + " text-xs"}>
                          {template.template_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {template.is_public && (
                    <Star className="h-4 w-4 text-warning" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {template.description}
                </CardDescription>
                
                {/* Template Info */}
                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  {Object.keys(template.field_mappings || {}).length > 0 && (
                    <div className="flex items-center">
                      <Database className="h-3 w-3 mr-1" />
                      {Object.keys(template.field_mappings).length} field mappings
                    </div>
                  )}
                  {template.configuration?.frequency && (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {template.configuration.frequency} sync
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => loadTemplate(template)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Load Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Configuration</h4>
                <div className="bg-muted p-3 rounded text-xs font-mono">
                  <pre>{JSON.stringify(selectedTemplate.configuration, null, 2)}</pre>
                </div>
              </div>

              {Object.keys(selectedTemplate.field_mappings || {}).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Field Mappings</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedTemplate.field_mappings).map(([external, internal]) => (
                      <div key={external} className="flex items-center space-x-2 text-sm">
                        <Badge variant="outline" className="font-mono text-xs">
                          {external}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {internal as string}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    loadTemplate(selectedTemplate);
                    setIsPreviewOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
