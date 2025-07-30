import { UnifiedClientModules } from "@/components/client/UnifiedClientModules";

interface ModulesTabProps {
  modules?: any[];
  onToggleModule?: (moduleId: string, enabled: boolean) => void;
  onConfigureModule?: (moduleId: string) => void;
  onLaunchModule?: (moduleId: string) => void;
  readonly?: boolean;
  clientId?: string;
}

export const ModulesTab = ({ 
  modules, 
  onToggleModule, 
  onConfigureModule,
  onLaunchModule,
  readonly = false,
  clientId
}: ModulesTabProps) => {
  return <UnifiedClientModules clientId={clientId} />;
};