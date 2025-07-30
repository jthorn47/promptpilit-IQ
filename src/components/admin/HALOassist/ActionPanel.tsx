import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  FileText, 
  Calculator, 
  Database, 
  Download, 
  Eye,
  Settings,
  Zap,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ActionPanelProps {
  userType: 'client' | 'employee' | 'internal_ops';
  companyId?: string;
  conversationId: string | null;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  permission: string;
  category: 'payroll' | 'tax' | 'employee' | 'report';
  userTypes: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'run_payroll',
    title: 'Run Payroll',
    description: 'Process payroll for current period',
    icon: Play,
    permission: 'payroll.execute',
    category: 'payroll',
    userTypes: ['internal_ops']
  },
  {
    id: 'calculate_taxes',
    title: 'Calculate Taxes',
    description: 'Run tax calculations and liabilities',
    icon: Calculator,
    permission: 'tax.calculate',
    category: 'tax',
    userTypes: ['internal_ops', 'client']
  },
  {
    id: 'generate_reports',
    title: 'Generate Reports',
    description: 'Create payroll and tax reports',
    icon: FileText,
    permission: 'reports.generate',
    category: 'report',
    userTypes: ['internal_ops', 'client']
  },
  {
    id: 'view_data',
    title: 'View Payroll Data',
    description: 'Access current payroll information',
    icon: Eye,
    permission: 'payroll.view',
    category: 'payroll',
    userTypes: ['employee', 'client', 'internal_ops']
  },
  {
    id: 'file_forms',
    title: 'File Tax Forms',
    description: 'Submit required tax filings',
    icon: Database,
    permission: 'tax.file',
    category: 'tax',
    userTypes: ['internal_ops']
  },
  {
    id: 'export_data',
    title: 'Export Data',
    description: 'Download payroll data and reports',
    icon: Download,
    permission: 'data.export',
    category: 'report',
    userTypes: ['client', 'internal_ops']
  }
];

export const ActionPanel: React.FC<ActionPanelProps> = ({
  userType,
  companyId,
  conversationId
}) => {
  const { toast } = useToast();
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const availableActions = quickActions.filter(action => 
    action.userTypes.includes(userType)
  );

  const actionsByCategory = availableActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  const handleExecuteAction = async (actionId: string) => {
    setExecutingAction(actionId);
    
    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Action Executed",
        description: `Successfully executed ${actionId.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to execute action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExecutingAction(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payroll': return Play;
      case 'tax': return Calculator;
      case 'employee': return Shield;
      case 'report': return TrendingUp;
      default: return Zap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payroll': return 'text-blue-600';
      case 'tax': return 'text-green-600';
      case 'employee': return 'text-purple-600';
      case 'report': return 'text-orange-600';
      default: return 'text-primary';
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground mb-1">Quick Actions</h3>
        <p className="text-xs text-muted-foreground">
          Available for {userType.replace('_', ' ')} users
        </p>
      </div>

      {/* Actions */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {Object.entries(actionsByCategory).map(([category, actions]) => {
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <Card key={category} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <CategoryIcon className={`w-4 h-4 ${getCategoryColor(category)}`} />
                  <span className="capitalize">{category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {actions.map((action) => {
                  const ActionIcon = action.icon;
                  const isExecuting = executingAction === action.id;
                  
                  return (
                    <motion.div
                      key={action.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 space-y-1"
                        onClick={() => handleExecuteAction(action.id)}
                        disabled={isExecuting || !conversationId}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <ActionIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm text-foreground">
                              {action.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                          {isExecuting && (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {/* Integration Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Database className="w-4 h-4 text-primary" />
              <span>Data Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['HALOcalc', 'HALOfiling', 'HALOnet', 'HALOvision'].map((source) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{source}</span>
                <Badge variant="secondary" className="text-xs">
                  <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                  Connected
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Session started: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Settings className="w-3 h-3" />
              <span>User Type: {userType.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          Preferences
        </Button>
      </div>
    </div>
  );
};