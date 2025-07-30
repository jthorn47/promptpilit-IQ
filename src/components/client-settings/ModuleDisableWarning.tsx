import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Database, Workflow } from "lucide-react";
import { ModuleDefinition } from "@/types/modules";

interface ModuleDisableWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  module: ModuleDefinition;
  dependentModules: ModuleDefinition[];
  affectedData: {
    users: number;
    records: number;
    workflows: string[];
  };
}

export const ModuleDisableWarning = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  module,
  dependentModules,
  affectedData 
}: ModuleDisableWarningProps) => {
  const hasImpact = affectedData.users > 0 || affectedData.records > 0 || affectedData.workflows.length > 0;
  const hasDependents = dependentModules.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Disable {module.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You are about to disable <strong>{module.name}</strong>. This action will:
            </p>
            
            <div className="space-y-3">
              {/* Impact on users and data */}
              {hasImpact && (
                <div className="p-3 bg-destructive/10 rounded-lg space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Impact
                  </h4>
                  <ul className="text-sm space-y-1">
                    {affectedData.users > 0 && (
                      <li className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Affect {affectedData.users} user(s) access
                      </li>
                    )}
                    {affectedData.records > 0 && (
                      <li className="flex items-center gap-2">
                        <Database className="w-3 h-3" />
                        Hide {affectedData.records} record(s) from view
                      </li>
                    )}
                    {affectedData.workflows.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Workflow className="w-3 h-3" />
                        Disable {affectedData.workflows.length} workflow(s):
                        <div className="flex flex-wrap gap-1 ml-2">
                          {affectedData.workflows.map((workflow, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {workflow}
                            </Badge>
                          ))}
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Dependent modules */}
              {hasDependents && (
                <div className="p-3 bg-warning/10 rounded-lg space-y-2">
                  <h4 className="font-medium text-warning">Dependent Modules</h4>
                  <p className="text-sm">
                    The following modules depend on {module.name} and may not function properly:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dependentModules.map((dep) => (
                      <Badge key={dep.id} variant="outline" className="text-xs">
                        {dep.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* General warning */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  • Data will be preserved but hidden from users
                  • Module can be re-enabled at any time
                  • Some features may become inaccessible
                  • Active workflows using this module will be paused
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Disable Module
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};