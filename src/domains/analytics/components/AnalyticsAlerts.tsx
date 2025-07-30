import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, Clock, CheckCircle } from "lucide-react";
import { useAnalyticsAlerts } from "../hooks";

export const AnalyticsAlerts = () => {
  const { alerts, loading, updateAlert } = useAnalyticsAlerts();

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await updateAlert(alertId, { is_active: isActive });
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'threshold':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'anomaly':
        return <Bell className="w-5 h-5 text-red-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (alert: any) => {
    if (!alert.is_active) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    
    if (alert.last_triggered_at) {
      const daysSinceTriggered = Math.floor(
        (Date.now() - new Date(alert.last_triggered_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceTriggered < 1) {
        return <Badge variant="destructive">Recently Triggered</Badge>;
      }
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  if (loading) {
    return <div className="p-6">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Alerts</h1>
          <p className="text-gray-600">Manage automated alerts and notifications</p>
        </div>
        <Button>
          <Bell className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Alert Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <h3 className="text-lg font-semibold">Threshold Alerts</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Triggered when metrics exceed predefined thresholds
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold">Anomaly Detection</h3>
          </div>
          <p className="text-gray-600 text-sm">
            AI-powered detection of unusual patterns in your data
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Regular notifications for compliance and monitoring
          </p>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Configured</h3>
                <p className="text-gray-500 mb-4">
                  Set up your first alert to monitor important metrics and receive notifications.
                </p>
                <Button>Create Your First Alert</Button>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.name}</h4>
                      <p className="text-sm text-gray-500">
                        Type: {alert.alert_type} • 
                        {alert.last_triggered_at && (
                          <span> Last triggered: {new Date(alert.last_triggered_at).toLocaleDateString()}</span>
                        )}
                        {!alert.last_triggered_at && <span> Never triggered</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(alert)}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Active</label>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                      />
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};