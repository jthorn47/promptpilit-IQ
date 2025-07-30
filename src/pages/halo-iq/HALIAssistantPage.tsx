import { useState } from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { HALIAnalyticsDashboard } from '@/components/hali/HALIAnalyticsDashboard';
import { HALIConfigurationPanel } from '@/components/hali/HALIConfigurationPanel';
import { HALIConversationView } from '@/components/hali/HALIConversationView';
import { HALIPerformanceMetrics } from '@/components/hali/HALIPerformanceMetrics';
import { 
  BarChart3, 
  Settings, 
  MessageSquare, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const HALIAssistantPage = () => {
  const { userRoles } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Check user access level
  const isSuperAdmin = userRoles?.includes('super_admin');
  const isCompanyAdmin = userRoles?.includes('company_admin');
  const hasFullAccess = isSuperAdmin || isCompanyAdmin;

  return (
    <StandardPageLayout
      title="HALI Assistant"
      subtitle="Halo Assisted Live Intelligence - SMS Support System"
      badge="SMS Support"
    >
      <div className="space-y-6">
        {/* Access Notice for Limited Users */}
        {!hasFullAccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                Limited access: You can view conversations and analytics for your assigned cases only.
              </p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            {hasFullAccess && (
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                  <p className="text-muted-foreground">
                    SMS conversation metrics, response times, and escalation patterns
                  </p>
                </div>
                <Badge variant="secondary">Real-time</Badge>
              </div>
              <HALIAnalyticsDashboard />
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Conversation View</h2>
                  <p className="text-muted-foreground">
                    Full threaded message history with search and reply capabilities
                  </p>
                </div>
                <Badge variant="secondary">Live Updates</Badge>
              </div>
              <HALIConversationView />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Performance Metrics</h2>
                  <p className="text-muted-foreground">
                    Agent performance, response times, and satisfaction tracking
                  </p>
                </div>
                <Badge variant="secondary">SLA Tracking</Badge>
              </div>
              <HALIPerformanceMetrics />
            </div>
          </TabsContent>

          {hasFullAccess && (
            <TabsContent value="configuration" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Configuration Panel</h2>
                    <p className="text-muted-foreground">
                      Manage auto-responses, escalation rules, and system settings
                    </p>
                  </div>
                  <Badge variant="destructive">Admin Only</Badge>
                </div>
                <HALIConfigurationPanel />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </StandardPageLayout>
  );
};