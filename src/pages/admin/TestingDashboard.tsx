
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, PlayCircle, Database, CreditCard } from 'lucide-react';
import { VaultPayTesting } from '@/components/testing/VaultPayTesting';
import { DataBridgeTesting } from '@/components/testing/DataBridgeTesting';
import { IntegrationTesting } from '@/components/testing/IntegrationTesting';
import { PerformanceTesting } from '@/components/testing/PerformanceTesting';

export const TestingDashboard: React.FC = () => {
  const { user, loading: authLoading, isSuperAdmin } = useAuth();
  const [activePhase, setActivePhase] = useState('vaultpay');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const testPhases = [
    {
      id: 'vaultpay',
      name: 'VaultPay Core',
      icon: CreditCard,
      description: 'Test invoice generation, payment processing, and AR aging',
      status: testResults.vaultpay?.status || 'pending'
    },
    {
      id: 'databridge',
      name: 'DataBridge Live',
      icon: Database,
      description: 'Test sync logging, alerts, and monitoring dashboard',
      status: testResults.databridge?.status || 'pending'
    },
    {
      id: 'integration',
      name: 'Integration',
      icon: PlayCircle,
      description: 'Test cross-module data flows and workflows',
      status: testResults.integration?.status || 'pending'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Clock,
      description: 'Load testing, security validation, and optimization',
      status: testResults.performance?.status || 'pending'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <UnifiedLayout>
      <div className="space-y-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
              <p className="text-muted-foreground">System testing and quality assurance tools</p>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testPhases.map((phase) => (
              <Card key={phase.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <phase.icon className="h-5 w-5 text-primary" />
                    {getStatusIcon(phase.status)}
                  </div>
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                  <Badge className={getStatusBadge(phase.status)}>
                    {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testing Tabs */}
          <Tabs value={activePhase} onValueChange={setActivePhase} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              {testPhases.map((phase) => (
                <TabsTrigger key={phase.id} value={phase.id} className="flex items-center gap-2">
                  <phase.icon className="h-4 w-4" />
                  {phase.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="vaultpay" className="mt-6">
              <VaultPayTesting 
                onResultsUpdate={(results) => 
                  setTestResults(prev => ({ ...prev, vaultpay: results }))
                }
              />
            </TabsContent>

            <TabsContent value="databridge" className="mt-6">
              <DataBridgeTesting 
                onResultsUpdate={(results) => 
                  setTestResults(prev => ({ ...prev, databridge: results }))
                }
              />
            </TabsContent>

            <TabsContent value="integration" className="mt-6">
              <IntegrationTesting 
                onResultsUpdate={(results) => 
                  setTestResults(prev => ({ ...prev, integration: results }))
                }
              />
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <PerformanceTesting 
                onResultsUpdate={(results) => 
                  setTestResults(prev => ({ ...prev, performance: results }))
                }
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};
