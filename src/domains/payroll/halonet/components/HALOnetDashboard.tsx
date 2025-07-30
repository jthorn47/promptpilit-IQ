// HALOnet Dashboard Component
import React, { useState, useEffect } from 'react';
import { HaloCard } from '@/components/ui/halo-card';
import { HaloButton } from '@/components/ui/halo-button';
import { HaloBadge } from '@/components/ui/halo-badge';
import { HaloProgress } from '@/components/ui/halo-progress';
import { halonetAPI } from '../api';
import { 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Zap,
  Eye,
  Plus
} from 'lucide-react';

export const HALOnetDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [riskEvents, setRiskEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const channel = halonetAPI.subscribeToPaymentUpdates('company-id', () => {
      loadDashboardData();
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, batchesData, riskData] = await Promise.all([
        halonetAPI.getDashboardMetrics('company-id'),
        halonetAPI.getBatches('company-id'),
        halonetAPI.getRiskEvents('company-id', 'active')
      ]);
      
      setMetrics(metricsData);
      setBatches(batchesData.slice(0, 10)); // Latest 10 batches
      setRiskEvents(riskData.slice(0, 5)); // Top 5 risk events
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': 
      case 'returned': return 'destructive';
      case 'pending_approval': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading HALOnet Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">HALOnet Payment Hub</h1>
          <p className="text-muted-foreground">Secure ACH payment orchestration and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <HaloButton size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Batch
          </HaloButton>
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" title="System Online" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HaloCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Volume</p>
              <p className="text-2xl font-bold text-foreground">
                ${metrics?.today_volume?.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-success" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-success">+12.5% from yesterday</span>
          </div>
        </HaloCard>

        <HaloCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold text-foreground">
                {metrics?.pending_approvals || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">
              ${metrics?.pending_amount?.toLocaleString() || '0'} total
            </span>
          </div>
        </HaloCard>

        <HaloCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {metrics?.success_rate || '99.8'}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <div className="mt-2">
            <HaloProgress value={metrics?.success_rate || 99.8} className="h-2" />
          </div>
        </HaloCard>

        <HaloCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Risk Events</p>
              <p className="text-2xl font-bold text-foreground">
                {riskEvents.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">
              {riskEvents.filter(e => e.severity === 'critical').length} critical
            </span>
          </div>
        </HaloCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Batches */}
        <div className="lg:col-span-2">
          <HaloCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Payment Batches
                </h3>
                <HaloButton variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View All
                </HaloButton>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Batch #</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Count</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer">
                        <td className="py-3 text-sm font-mono">{batch.batch_number}</td>
                        <td className="py-3 text-sm capitalize">{batch.batch_type}</td>
                        <td className="py-3 text-sm font-medium">${batch.total_amount.toLocaleString()}</td>
                        <td className="py-3 text-sm">{batch.total_count}</td>
                        <td className="py-3">
                          <HaloBadge variant={getStatusColor(batch.status)} size="sm">
                            {batch.status.replace('_', ' ')}
                          </HaloBadge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </HaloCard>
        </div>

        {/* Risk Events & System Status */}
        <div className="space-y-6">
          {/* Risk Events */}
          <HaloCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  Active Risk Events
                </h3>
                <HaloBadge variant="destructive" size="sm">{riskEvents.length}</HaloBadge>
              </div>
              
              {riskEvents.length > 0 ? (
                <div className="space-y-3">
                  {riskEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <HaloBadge variant={getRiskSeverityColor(event.severity)} size="sm">
                              {event.severity}
                            </HaloBadge>
                            <span className="text-sm font-medium">{event.event_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Risk Score: {event.risk_score}/100
                          </p>
                        </div>
                        <HaloButton variant="outline" size="sm">
                          Review
                        </HaloButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active risk events</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems secured</p>
                </div>
              )}
            </div>
          </HaloCard>

          {/* Quick Actions */}
          <HaloCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <HaloButton variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Create Payroll Batch
                </HaloButton>
                <HaloButton variant="outline" className="w-full justify-start gap-2">
                  <Zap className="w-4 h-4" />
                  Emergency Approval
                </HaloButton>
                <HaloButton variant="outline" className="w-full justify-start gap-2">
                  <XCircle className="w-4 h-4" />
                  Void Payment
                </HaloButton>
                <HaloButton variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Manage Approvers
                </HaloButton>
              </div>
            </div>
          </HaloCard>
        </div>
      </div>

      {/* Provider Status */}
      <HaloCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Provider Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div>
                  <p className="font-medium">Modern Treasury</p>
                  <p className="text-sm text-muted-foreground">Primary ACH Provider</p>
                </div>
              </div>
              <HaloBadge variant="success" size="sm">Online</HaloBadge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div>
                  <p className="font-medium">Stripe Treasury</p>
                  <p className="text-sm text-muted-foreground">Secondary Provider</p>
                </div>
              </div>
              <HaloBadge variant="warning" size="sm">Maintenance</HaloBadge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div>
                  <p className="font-medium">NACHA Direct</p>
                  <p className="text-sm text-muted-foreground">Backup Provider</p>
                </div>
              </div>
              <HaloBadge variant="success" size="sm">Ready</HaloBadge>
            </div>
          </div>
        </div>
      </HaloCard>
    </div>
  );
};