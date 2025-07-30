import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  GraduationCap, 
  Users, 
  Shield, 
  FileText, 
  Heart,
  DollarSign,
  UserPlus,
  TrendingUp,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  Lock,
  Eye,
  AlertTriangle,
  RefreshCw,
  ImagePlus,
  Loader2,
  Calculator
} from "lucide-react";
import { PropGENTab } from "@/components/shared/tabs/PropGENTab";
import { TimeTrackingConfig } from "@/components/modules/TimeTrackingConfig";
import { LeaveManagementConfig } from "@/components/modules/LeaveManagementConfig";
import { ComplianceConfig } from "@/components/modules/ComplianceConfig";
import { DocumentsConfig } from "@/components/modules/DocumentsConfig";
import { TasksWorkflowsConfig } from "@/components/modules/TasksWorkflowsConfig";
import { EaseLearnConfig } from "@/components/modules/EaseLearnConfig";
import { ModuleRenderer, moduleRegistry } from "@/modules";
import "@/modules"; // Initialize modules

interface ClientModuleAccess {
  id: string;
  client_id: string;
  module_id: string;
  module_type: 'platform' | 'training';
  is_enabled: boolean;
  enabled_by?: string;
  enabled_at?: string;
  setup_completed: boolean;
  setup_completed_at?: string;
  last_accessed?: string;
  configuration_data: any;
}

interface TrainingModule {
  id: string;
  module_id: string;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
  is_beta: boolean;
  is_coming_soon: boolean;
  requires_setup: boolean;
  icon: string;
  thumbnail_url?: string;
}

const iconMap = {
  Settings,
  GraduationCap,
  Users,
  Shield,
  FileText,
  Heart,
  DollarSign,
  UserPlus,
  TrendingUp,
  Calendar,
  Clock,
  Truck
};

interface UnifiedClientModulesProps {
  clientId?: string;
}

export const UnifiedClientModules = ({ clientId: propClientId }: UnifiedClientModulesProps = {}) => {
  const { clientId: routeClientId } = useParams<{ clientId: string }>();
  const clientId = propClientId || routeClientId;
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [moduleAccess, setModuleAccess] = useState<ClientModuleAccess[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingThumbnails, setGeneratingThumbnails] = useState<Set<string>>(new Set());
  const [clientData, setClientData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'modules' | string>('modules');
  
  const { toast } = useToast();

  const canManageModules = isSuperAdmin;

  console.log('🚀 UnifiedClientModules Debug:', {
    clientId,
    isSuperAdmin,
    canManageModules,
    moduleAccessLength: moduleAccess.length,
    trainingModulesLength: trainingModules.length,
    loading,
    clientData
  });

  useEffect(() => {
    console.log('🚀 UnifiedClientModules mounted, clientId:', clientId);
    if (clientId) {
      fetchClientModules();
    }
  }, [clientId]);

  // Fetch client data for PropGEN
  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return;
      
      try {
        const { data } = await supabase
          .from('clients')
          .select('company_name, company_settings_id')
          .eq('id', clientId)
          .single();
        
        setClientData(data);
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };
    
    fetchClientData();
  }, [clientId]);

  const fetchClientModules = async () => {
    console.log('📡 Fetching client modules for clientId:', clientId);
    if (!clientId) return;
    
    try {
      setLoading(true);

      // Fetch training modules catalog
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_modules_catalog')
        .select('*');

      if (trainingError) throw trainingError;

      setTrainingModules(trainingData || []);
    } catch (error) {
      console.error('Error fetching client modules:', error);
      toast({
        title: "Error",
        description: "Failed to load module data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleId: string, moduleType: 'platform' | 'training', enabled: boolean) => {
    if (!canManageModules) {
      toast({
        title: "Access Denied",
        description: "Only admins can enable/disable modules",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Module Updated",
      description: `${enabled ? 'Enabled' : 'Disabled'} ${moduleType} module`,
    });
  };

  const getModuleAccess = (moduleId: string) => {
    return moduleAccess.find(access => access.module_id === moduleId);
  };

  const getStatusIcon = (access: ClientModuleAccess | undefined, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-4 h-4 text-muted-foreground" />;
    if (!access?.is_enabled) return null;
    if (!access.setup_completed) return <Clock className="w-4 h-4 text-warning" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getStatusText = (access: ClientModuleAccess | undefined, isLocked: boolean) => {
    if (isLocked) return "Locked - Admin Access Required";
    if (!access?.is_enabled) return "Disabled";
    if (!access.setup_completed) return "Setup Required";
    return "Active";
  };

  const generateThumbnail = async (moduleId: string, moduleName: string, moduleDescription: string, moduleType: 'platform' | 'training') => {
    if (!canManageModules) return;
    
    setGeneratingThumbnails(prev => new Set(prev).add(moduleId));
    
    try {
      const response = await supabase.functions.invoke('generate-thumbnail', {
        body: {
          moduleId: moduleId,
          moduleType: moduleType,
          title: moduleName,
          description: moduleDescription
        }
      });

      if (response.error) throw response.error;

      const thumbnails = response.data?.images || [];
      if (thumbnails.length > 0) {
        const thumbnailUrl = thumbnails[0];
        
        if (moduleType === 'training') {
          await supabase
            .from('training_modules_catalog')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('module_id', moduleId);
            
          setTrainingModules(prev => prev.map(module => 
            module.module_id === moduleId 
              ? { ...module, thumbnail_url: thumbnailUrl }
              : module
          ));
        }
        
        toast({
          title: "Thumbnail Generated",
          description: `AI thumbnail created for ${moduleName}`,
        });
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to generate thumbnail",
        variant: "destructive",
      });
    } finally {
      setGeneratingThumbnails(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  const renderPlatformModules = () => {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Platform modules have been removed</p>
      </div>
    );
  };

  const renderTrainingModules = () => {
    return (
      <div className="space-y-6">
        {trainingModules.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingModules.map((module) => {
                const access = getModuleAccess(module.module_id);
                const isLocked = !canManageModules && !access?.is_enabled;
                const IconComponent = iconMap[module.icon as keyof typeof iconMap] || Shield;

                return (
                  <Card key={module.module_id} className={`transition-all duration-200 ${access?.is_enabled ? 'ring-1 ring-primary/20' : ''}`}>
                    <CardHeader className="pb-3">
                      {module.thumbnail_url ? (
                        <div className="relative mb-4 -mx-6 -mt-6">
                          <img 
                            src={module.thumbnail_url} 
                            alt={`${module.name} thumbnail`}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                          <div className="absolute bottom-2 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm">
                                  <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-sm truncate">{module.name}</h3>
                              </div>
                              {canManageModules && (
                                <Switch
                                  checked={access?.is_enabled || false}
                                  onCheckedChange={(enabled) => handleToggleModule(module.module_id, 'training', enabled)}
                                  disabled={saving}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${access?.is_enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                              <IconComponent className={`w-5 h-5 ${access?.is_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                             <div>
                               <CardTitle className="text-base flex items-center gap-2">
                                 {module.name}
                                 {module.is_beta && <Badge variant="secondary" className="text-xs">Beta</Badge>}
                                 {module.is_coming_soon && <Badge variant="outline" className="text-xs">Coming Soon</Badge>}
                                 {module.is_premium && <Badge variant="default" className="text-xs">Premium</Badge>}
                               </CardTitle>
                             </div>
                          </div>
                          {canManageModules && (
                            <Switch
                              checked={access?.is_enabled || false}
                              onCheckedChange={(enabled) => handleToggleModule(module.module_id, 'training', enabled)}
                              disabled={saving || module.is_coming_soon}
                            />
                          )}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(access, isLocked)}
                          <span className="text-sm font-medium">{getStatusText(access, isLocked)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {access?.is_enabled && !isLocked && !module.is_coming_soon && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              toast({
                                title: "Configuration",
                                description: `Configure ${module.name} settings`,
                              });
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            {!access.setup_completed ? 'Complete Setup' : 'Configure'}
                          </Button>
                        )}
                        
                        {canManageModules && !module.thumbnail_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateThumbnail(module.module_id, module.name, module.description, 'training')}
                            disabled={generatingThumbnails.has(module.module_id)}
                          >
                            {generatingThumbnails.has(module.module_id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ImagePlus className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {trainingModules.length === 0 && (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Training Modules</h3>
            <p className="text-muted-foreground">No training modules are currently available.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    );
  }

  // Get modules from the module registry
  const registeredModules = moduleRegistry.getAccessibleModules();
  
  // Map registered modules to the expected format
  const haaLOIQModules = registeredModules.map(module => ({
    id: module.metadata.id,
    name: module.metadata.name,
    icon: iconMap[module.metadata.icon as keyof typeof iconMap] || Settings,
    description: module.metadata.description,
    status: moduleRegistry.hasModuleAccess(module.metadata.id) ? 'Active' : 'Locked',
    statusColor: moduleRegistry.hasModuleAccess(module.metadata.id) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }));

  // Add hardcoded modules for now (will be converted to isolated modules later)
  const legacyModules = [
    {
      id: 'benefits-iq',
      name: 'BenefitsIQ',
      icon: Heart,
      description: 'Manage your company\'s benefit plans, costs, and compliance.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'leave-management',
      name: 'Leave Management',
      icon: Calendar,
      description: 'Streamlined PTO requests, approvals, and accrual tracking.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      description: 'Automated compliance monitoring and reporting tools.',
      status: 'Locked',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      description: 'Secure document storage, e-signatures, and workflow automation.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'tasks-workflows',
      name: 'Tasks & Workflows',
      icon: CheckCircle,
      description: 'Automated task management and customizable workflow builders.',
      status: 'Not Installed',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'easelearn',
      name: 'EaseLearn',
      icon: GraduationCap,
      description: 'Comprehensive learning management system with certification tracking.',
      status: 'Locked',
      statusColor: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const allModules = [...haaLOIQModules, ...legacyModules];

  const getButtonForStatus = (status: string, moduleId: string) => {
    switch (status) {
      case 'Active':
        return (
          <Button className="w-full" onClick={() => setCurrentView(moduleId)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        );
      case 'Locked':
      case 'Not Installed':
        return (
          <Button variant="outline" className="w-full" onClick={() => toast({ title: "Upgrade Required", description: "Contact your account manager to upgrade this module." })}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        );
      default:
        return (
          <Button variant="outline" className="w-full">
            Install
          </Button>
        );
    }
  };

  const renderHaaLOIQModules = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-primary" />
            HaaLO IQ - Module Management
          </h3>
          <p className="text-muted-foreground">
            Manage and configure HaaLO modules for this client
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card key={module.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <Badge className={module.statusColor}>{module.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                  {getButtonForStatus(module.status, module.id)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const haaLOCount = haaLOIQModules.length;
  const trainingCount = trainingModules.length;

  const renderConfigComponent = () => {
    const onBack = () => setCurrentView('modules');
    
    switch (currentView) {
      case 'benefits-iq':
        return <div className="space-y-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Back to Modules
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                BenefitsIQ Configuration
              </CardTitle>
              <CardDescription>
                Configure and launch BenefitsIQ for this client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                BenefitsIQ provides comprehensive benefits management, cost analysis, and compliance tracking.
              </p>
              <Button 
                onClick={() => navigate(`/client/benefitsiq`)}
                className="w-full"
              >
                <Heart className="h-4 w-4 mr-2" />
                Launch BenefitsIQ
              </Button>
            </CardContent>
          </Card>
        </div>;
      case 'time-tracking':
        return <TimeTrackingConfig onBack={onBack} clientId={clientId} />;
      case 'leave-management':
        return <LeaveManagementConfig onBack={onBack} clientId={clientId} />;
      case 'compliance':
        return <ComplianceConfig onBack={onBack} clientId={clientId} />;
      case 'documents':
        return <DocumentsConfig onBack={onBack} clientId={clientId} />;
      case 'tasks-workflows':
        return <TasksWorkflowsConfig onBack={onBack} clientId={clientId} />;
      case 'org-settings':
        return <ModuleRenderer clientId={clientId} onModuleSelect={setCurrentView} />;
      case 'easelearn':
        return <EaseLearnConfig onBack={onBack} clientId={clientId} />;
      default:
        return null;
    }
  };

  if (currentView !== 'modules') {
    return renderConfigComponent();
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="haalo-iq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="haalo-iq" className="relative">
            HaaLO IQ Modules ({haaLOCount})
          </TabsTrigger>
          <TabsTrigger value="training" className="relative">
            Training ({trainingCount})
          </TabsTrigger>
          <TabsTrigger value="propgen" className="relative">
            <Calculator className="w-4 h-4 mr-2" />
            PropGEN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="haalo-iq" className="space-y-6">
          {renderHaaLOIQModules()}
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          {renderTrainingModules()}
        </TabsContent>

        <TabsContent value="propgen" className="space-y-6">
          {clientData && (
            <PropGENTab 
              companyId={clientData.company_settings_id || ''} 
              companyName={clientData.company_name || ''} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};