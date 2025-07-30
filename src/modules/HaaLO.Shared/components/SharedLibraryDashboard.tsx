import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Code, Wrench, BarChart3, Download, RefreshCw } from 'lucide-react';
import type { SharedLibraryStats } from '../types';

export const SharedLibraryDashboard: React.FC = () => {
  const [stats, setStats] = useState<SharedLibraryStats>({
    components: { total: 24, active: 22, deprecated: 2 },
    hooks: { total: 12, performance: 5, utility: 7 },
    utils: { total: 18, formatters: 6, calculators: 8, validators: 4 },
    usage: { 
      totalModules: 15, 
      activeModules: 12,
      dependencyGraph: {
        'HaaLO.PayrollEngine': ['currencyFormatter', 'dateFormatter', 'taxCalculations'],
        'HaaLO.CRM': ['useFetch', 'usePagination', 'dateFormatter'],
        'HaaLO.TimeTracking': ['useForm', 'dateFormatter'],
        'HaaLO.Notifications': ['useFetch', 'dateFormatter']
      }
    }
  });

  const [activeTab, setActiveTab] = useState('components');

  const componentList = [
    { name: 'HaaLODatePicker', category: 'Input', status: 'active', usage: 8 },
    { name: 'HaaLOFileUploader', category: 'Input', status: 'active', usage: 12 },
    { name: 'HaaLOModal', category: 'Layout', status: 'active', usage: 15 },
    { name: 'HaaLODropdown', category: 'Input', status: 'active', usage: 20 },
    { name: 'HaaLODataGrid', category: 'Display', status: 'active', usage: 6 },
    { name: 'HaaLOLegacyButton', category: 'Input', status: 'deprecated', usage: 2 }
  ];

  const hooksList = [
    { name: 'useFetch', category: 'Performance', description: 'HTTP request management with caching', usage: 25 },
    { name: 'useForm', category: 'Utility', description: 'Form state and validation', usage: 18 },
    { name: 'usePagination', category: 'Utility', description: 'Pagination logic and state', usage: 12 },
    { name: 'useDebounce', category: 'Performance', description: 'Debounced value updates', usage: 8 },
    { name: 'useLocalStorage', category: 'Utility', description: 'Local storage state management', usage: 10 }
  ];

  const utilsList = [
    { name: 'currencyFormatter', category: 'Formatter', description: 'Format currency values', usage: 22 },
    { name: 'dateFormatter', category: 'Formatter', description: 'Format dates and times', usage: 35 },
    { name: 'taxCalculations', category: 'Calculator', description: 'Tax computation utilities', usage: 15 },
    { name: 'validateEmail', category: 'Validator', description: 'Email validation', usage: 28 },
    { name: 'calculatePayroll', category: 'Calculator', description: 'Payroll calculations', usage: 8 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shared Library Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Documentation
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">{stats.components.total}</p>
                <p className="text-xs text-green-600">{stats.components.active} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Code className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hooks</p>
                <p className="text-2xl font-bold">{stats.hooks.total}</p>
                <p className="text-xs text-muted-foreground">Performance & Utility</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Utilities</p>
                <p className="text-2xl font-bold">{stats.utils.total}</p>
                <p className="text-xs text-muted-foreground">Formatters & Calculators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Module Usage</p>
                <p className="text-2xl font-bold">{stats.usage.activeModules}</p>
                <p className="text-xs text-muted-foreground">of {stats.usage.totalModules} modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="utils">Utilities</TabsTrigger>
          <TabsTrigger value="usage">Module Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared Components Library</CardTitle>
              <CardDescription>
                Reusable UI components used across HaaLO modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {componentList.map((component) => (
                  <div key={component.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{component.name}</h3>
                      <Badge variant={component.status === 'active' ? 'default' : 'destructive'}>
                        {component.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{component.category}</p>
                    <p className="text-xs">Used in {component.usage} places</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared Hooks Library</CardTitle>
              <CardDescription>
                Reusable React hooks for common functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hooksList.map((hook) => (
                  <div key={hook.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{hook.name}</h3>
                      <Badge variant="outline">{hook.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{hook.description}</p>
                    <p className="text-xs">Used {hook.usage} times across modules</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utils" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utility Functions Library</CardTitle>
              <CardDescription>
                Shared utility functions and calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {utilsList.map((util) => (
                  <div key={util.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{util.name}</h3>
                      <Badge variant="secondary">{util.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{util.description}</p>
                    <p className="text-xs">Used {util.usage} times across modules</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Dependencies</CardTitle>
              <CardDescription>
                How modules consume shared library components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.usage.dependencyGraph).map(([module, dependencies]) => (
                  <div key={module} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{module}</h3>
                    <div className="flex flex-wrap gap-2">
                      {dependencies.map((dep) => (
                        <Badge key={dep} variant="outline">{dep}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedLibraryDashboard;