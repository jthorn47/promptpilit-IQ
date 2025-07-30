import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  CreditCard, 
  Calendar, 
  FileText, 
  Settings, 
  MessageCircle,
  Bell,
  Download,
  Eye,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

// Import feature components
import PayStubViewer from './components/PayStubViewer';
import TaxCenter from './components/TaxCenter';
import DirectDepositSettings from './components/DirectDepositSettings';
import SmartAlertsInbox from './components/SmartAlertsInbox';
import HALOCopilot from './components/HALOCopilot';
import PayCalendarTracker from './components/PayCalendarTracker';
import PayrollHistoryExport from './components/PayrollHistoryExport';

interface HALOselfProps {
  className?: string;
}

const HALOself: React.FC<HALOselfProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employee profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['employee-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_profiles')
        .select(`
          *,
          employee:employees(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent pay stubs
  const { data: recentPayStubs } = useQuery({
    queryKey: ['recent-pay-stubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_pay_stubs')
        .select('*')
        .order('pay_date', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch unread alerts
  const { data: unreadAlerts } = useQuery({
    queryKey: ['unread-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Update last login
  useEffect(() => {
    const updateLastLogin = async () => {
      await supabase
        .from('employee_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    };
    
    updateLastLogin();
  }, []);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground animate-pulse"
          >
            HALO is retrieving your portal...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const tabsData = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'paystubs', label: 'Pay Stubs', icon: CreditCard },
    { id: 'taxes', label: 'Tax Center', icon: FileText },
    { id: 'banking', label: 'Direct Deposit', icon: Settings },
    { id: 'alerts', label: 'Smart Alerts', icon: Bell, badge: unreadAlerts?.length },
    { id: 'copilot', label: 'AI Copilot', icon: MessageCircle },
    { id: 'calendar', label: 'Pay Calendar', icon: Calendar },
    { id: 'history', label: 'History Export', icon: Download }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 ${className}`}>
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 ring-4 ring-primary/20 hover-scale">
                <AvatarImage src={profile?.profile_photo_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile?.preferred_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                  Welcome back, {profile?.preferred_name || 'Employee'}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-primary animate-pulse" />
                  Powered by HALO Intelligence
                </motion.p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center space-x-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {recentPayStubs?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Recent Stubs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {unreadAlerts?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">New Alerts</div>
              </div>
              <Badge variant="outline" className="bg-primary/10 border-primary/20">
                <Shield className="w-3 h-3 mr-1" />
                Secured
              </Badge>
            </motion.div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2 bg-card/50 backdrop-blur-sm border border-border/50">
              {tabsData.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 p-3 relative data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover-scale"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative"
                    >
                      <Icon className="w-5 h-5" />
                      {tab.badge && tab.badge > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs animate-pulse"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </motion.div>
                    <span className="text-xs font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quick Pay Info */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Latest Pay Stub
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentPayStubs?.[0] ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Pay</span>
                            <span className="font-bold text-green-500">
                              ${recentPayStubs[0].gross_pay?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Net Pay</span>
                            <span className="font-bold">
                              ${recentPayStubs[0].net_pay?.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pay Date: {new Date(recentPayStubs[0].pay_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No pay stubs available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Smart Alerts Preview */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-500" />
                        Smart Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {unreadAlerts?.slice(0, 2).map((alert) => (
                          <div key={alert.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="font-medium text-sm">{alert.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.message.substring(0, 80)}...
                            </div>
                          </div>
                        )) || (
                          <p className="text-muted-foreground">No new alerts</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover-scale"
                        onClick={() => setActiveTab('paystubs')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Latest Pay Stub
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover-scale"
                        onClick={() => setActiveTab('copilot')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask HALO a Question
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover-scale"
                        onClick={() => setActiveTab('history')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Pay History
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="paystubs">
                <PayStubViewer />
              </TabsContent>

              <TabsContent value="taxes">
                <TaxCenter />
              </TabsContent>

              <TabsContent value="banking">
                <DirectDepositSettings />
              </TabsContent>

              <TabsContent value="alerts">
                <SmartAlertsInbox />
              </TabsContent>

              <TabsContent value="copilot">
                <HALOCopilot />
              </TabsContent>

              <TabsContent value="calendar">
                <PayCalendarTracker />
              </TabsContent>

              <TabsContent value="history">
                <PayrollHistoryExport />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default HALOself;