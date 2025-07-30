
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, RotateCcw, Power, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { ModuleStatus } from '../types/launchpad.types';

interface ModuleControlTableProps {
  modules: ModuleStatus[];
}

const ModuleControlTable: React.FC<ModuleControlTableProps> = ({ modules }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewLogs = (moduleId: string) => {
    // Navigate to audit logs filtered by module
    navigate('/admin/audit-logs');
    toast({
      title: "Module Logs",
      description: `Viewing logs for ${moduleId}`,
    });
  };

  const handleRestartModule = (moduleId: string, moduleName: string) => {
    toast({
      title: "Module Restart",
      description: `Restarting ${moduleName}...`,
    });
    // In real implementation, this would call an API to restart the module
  };

  const handleTogglePower = (moduleId: string, moduleName: string, currentStatus: string) => {
    const action = currentStatus === 'online' ? 'stopping' : 'starting';
    toast({
      title: "Module Power Toggle",
      description: `${action} ${moduleName}...`,
    });
    // In real implementation, this would call an API to toggle module power
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'offline': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'error': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '⚫';
      case 'error': return '🔴';
      default: return '⚫';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Module Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Module</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Version</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Orgs</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Errors</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module, index) => (
                  <motion.tr
                    key={module.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(module.status)}</span>
                        <span className="font-medium">{module.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-muted-foreground">
                      {module.version}
                    </td>
                    <td className="py-4 px-2 text-muted-foreground">
                      {module.orgsUsing}
                    </td>
                    <td className="py-4 px-2">
                      {module.errorCount > 0 ? (
                        <Badge variant="destructive">{module.errorCount}</Badge>
                      ) : (
                        <span className="text-green-600">✓</span>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          title="View Logs"
                          onClick={() => handleViewLogs(module.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          title="Restart"
                          onClick={() => handleRestartModule(module.id, module.name)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          title="Toggle Power"
                          onClick={() => handleTogglePower(module.id, module.name, module.status)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModuleControlTable;
