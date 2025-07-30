
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { SystemAlert } from '../types/launchpad.types';

interface AlertsPanelProps {
  alerts: SystemAlert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAcknowledgeAll = () => {
    toast({
      title: "Alerts Acknowledged",
      description: "All alerts have been acknowledged",
    });
  };

  const handleAutoTriage = () => {
    toast({
      title: "AI Triage Initiated",
      description: "Sarah is analyzing and triaging alerts...",
    });
  };

  const handleResolveAlert = (alertId: string, title: string) => {
    toast({
      title: "Alert Resolved",
      description: `Resolved: ${title}`,
    });
  };

  const handleDelegateAlert = (alertId: string, title: string) => {
    toast({
      title: "Alert Delegated",
      description: `Delegated: ${title}`,
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Issues Needing Review
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleAcknowledgeAll}>
                Acknowledge All
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={handleAutoTriage}>
                <Bot className="h-4 w-4" />
                Auto-Triage with Sarah
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All Clear!</p>
              <p>No system alerts requiring attention</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id, alert.title)}>
                        Resolve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelegateAlert(alert.id, alert.title)}>
                        Delegate
                      </Button>
                      <Button size="sm" variant="ghost">
                        Ignore
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AlertsPanel;
