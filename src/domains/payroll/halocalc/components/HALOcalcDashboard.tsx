// HALOcalc Dashboard Component
import React, { useState } from 'react';
import { HaloCard } from '@/components/ui/halo-card';
import { HaloButton } from '@/components/ui/halo-button';
import { HaloBadge } from '@/components/ui/halo-badge';
import { HaloProgress } from '@/components/ui/halo-progress';
import { useHALOcalc } from '../hooks/useHALOcalc';
import { Calculator, Zap, Shield, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { HALOcalcSimulatorModal } from './HALOcalcSimulatorModal';
import { HALOcalcCalculationModal } from './HALOcalcCalculationModal';

export const HALOcalcDashboard: React.FC = () => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const { 
    useHealthCheck, 
    usePerformanceMetrics,
    useProcessingErrors 
  } = useHALOcalc();

  const { data: healthStatus } = useHealthCheck();
  const { data: metrics } = usePerformanceMetrics('24h');
  const { data: errors } = useProcessingErrors();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'unhealthy': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">HALOcalc Engine</h1>
          <p className="text-muted-foreground">Intelligent payroll calculation and simulation platform</p>
        </div>
        <div className="flex items-center gap-3">
          <HaloBadge variant={getStatusColor(healthStatus?.status)}>
            {healthStatus?.status || 'Unknown'} • v{healthStatus?.version || '1.0.0'}
          </HaloBadge>
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" title="HALO Pulse" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HaloCard className="group hover:shadow-2xl transition-all duration-300">
          <div className="p-6 text-center">
            <Calculator className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Calculate Payroll</h3>
            <p className="text-muted-foreground mb-4">Process timecards, wages, and deductions</p>
            <HaloButton onClick={() => setShowCalculator(true)} className="w-full">
              Start Calculation
            </HaloButton>
          </div>
        </HaloCard>

        <HaloCard className="group hover:shadow-2xl transition-all duration-300">
          <div className="p-6 text-center">
            <Zap className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Simulation Mode</h3>
            <p className="text-muted-foreground mb-4">Test wage changes and scenarios</p>
            <HaloButton variant="secondary" onClick={() => setShowSimulator(true)} className="w-full">
              Run Simulation
            </HaloButton>
          </div>
        </HaloCard>

        <HaloCard className="group hover:shadow-2xl transition-all duration-300">
          <div className="p-6 text-center">
            <Brain className="w-12 h-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground mb-4">Get explanations and insights</p>
            <HaloButton variant="secondary" className="w-full">
              Ask HALOassist
            </HaloButton>
          </div>
        </HaloCard>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HaloCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Metrics (24h)
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Processing Speed</span>
                  <span className="text-sm font-medium">{metrics?.avg_processing_time || '2.3'}s avg</span>
                </div>
                <HaloProgress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium">{metrics?.success_rate || '99.2'}%</span>
                </div>
                <HaloProgress value={99} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tax API Uptime</span>
                  <span className="text-sm font-medium">{metrics?.tax_api_uptime || '99.9'}%</span>
                </div>
                <HaloProgress value={100} className="h-2" />
              </div>
            </div>
          </div>
        </HaloCard>

        <HaloCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Recent Issues
              </h3>
              <HaloBadge variant="secondary">{errors?.length || 0} active</HaloBadge>
            </div>
            {errors && errors.length > 0 ? (
              <div className="space-y-3">
                {errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-destructive">{error.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{error.timestamp}</p>
                      </div>
                      <HaloBadge variant="destructive" size="sm">{error.severity}</HaloBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            )}
          </div>
        </HaloCard>
      </div>

      {/* Recent Calculations */}
      <HaloCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Calculations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Job ID</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Employees</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Started</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-sm font-mono">JOB_001234</td>
                  <td className="py-3 text-sm">247</td>
                  <td className="py-3">
                    <HaloBadge variant="success" size="sm">Completed</HaloBadge>
                  </td>
                  <td className="py-3 text-sm">3.2s</td>
                  <td className="py-3 text-sm text-muted-foreground">2 minutes ago</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-sm font-mono">JOB_001233</td>
                  <td className="py-3 text-sm">158</td>
                  <td className="py-3">
                    <HaloBadge variant="success" size="sm">Completed</HaloBadge>
                  </td>
                  <td className="py-3 text-sm">2.1s</td>
                  <td className="py-3 text-sm text-muted-foreground">15 minutes ago</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-mono">JOB_001232</td>
                  <td className="py-3 text-sm">89</td>
                  <td className="py-3">
                    <HaloBadge variant="warning" size="sm">Processing</HaloBadge>
                  </td>
                  <td className="py-3 text-sm">-</td>
                  <td className="py-3 text-sm text-muted-foreground">1 hour ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </HaloCard>

      {/* Modals */}
      <HALOcalcSimulatorModal 
        open={showSimulator} 
        onOpenChange={setShowSimulator} 
      />
      <HALOcalcCalculationModal 
        open={showCalculator} 
        onOpenChange={setShowCalculator} 
      />
    </div>
  );
};