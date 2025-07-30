/**
 * Module Registry Dashboard - Central tracking and QA hub for HaaLO modules
 * Only accessible to Super Admins
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit3,
  Save,
  X,
  Eye,
  Settings,
  Shield,
  Route,
  Calendar,
  Filter,
  Package
} from 'lucide-react';
import { moduleRegistry } from '@/modules/core/ModuleLoader';

// Types for module metadata tracking
interface ModuleMetadata {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'complete';
  qaStatus: 'not_started' | 'in_progress' | 'passed';
  accessControlValidated: boolean;
  notes: string;
  lastUpdated: Date;
  primaryRoutes: string[];
  functionalArea: string;
  creationPrompt?: string;
  hasRouteIssues: boolean;
}

const FUNCTIONAL_AREAS = {
  'payroll': 'Payroll Engine',
  'time': 'Time & Attendance',
  'tax': 'Tax Management',
  'compliance': 'Compliance & Legal',
  'benefits': 'Benefits & HR',
  'core': 'Core System',
  'reporting': 'Analytics & Reporting',
  'finance': 'Finance & Billing'
};

export const ModuleRegistryDashboard: React.FC = () => {
  const [modules, setModules] = useState<ModuleMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qaFilter, setQaFilter] = useState<string>('all');
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  // Initialize module metadata from registry
  useEffect(() => {
    const registeredModules = moduleRegistry.getAllModules();
    const moduleMetadata: ModuleMetadata[] = registeredModules.map(module => {
      // Determine functional area based on module name
      const functionalArea = determineFunctionalArea(module.metadata.name);
      
      // Check for route issues
      const hasRouteIssues = module.routes.some(route => 
        !route.path || !route.component || route.path.includes('undefined')
      );

      return {
        id: module.metadata.id,
        name: module.metadata.name,
        status: getStoredStatus(module.metadata.id) || 'in_progress',
        qaStatus: getStoredQaStatus(module.metadata.id) || 'not_started',
        accessControlValidated: validateAccessControl(module),
        notes: getStoredNotes(module.metadata.id) || '',
        lastUpdated: new Date(),
        primaryRoutes: module.routes.map(r => r.path),
        functionalArea,
        creationPrompt: getModulePrompt(module.metadata.name),
        hasRouteIssues
      };
    });

    setModules(moduleMetadata);
  }, []);

  // Helper functions for localStorage persistence
  const getStoredStatus = (moduleId: string) => {
    return localStorage.getItem(`module_status_${moduleId}`) as ModuleMetadata['status'] | null;
  };

  const getStoredQaStatus = (moduleId: string) => {
    return localStorage.getItem(`module_qa_status_${moduleId}`) as ModuleMetadata['qaStatus'] | null;
  };

  const getStoredNotes = (moduleId: string) => {
    return localStorage.getItem(`module_notes_${moduleId}`) || '';
  };

  const saveModuleData = (moduleId: string, field: string, value: string) => {
    localStorage.setItem(`module_${field}_${moduleId}`, value);
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, [field]: value, lastUpdated: new Date() }
        : m
    ));
  };

  // Determine functional area from module name
  const determineFunctionalArea = (moduleName: string): string => {
    const name = moduleName.toLowerCase();
    if (name.includes('payroll')) return 'payroll';
    if (name.includes('time') || name.includes('attendance')) return 'time';
    if (name.includes('tax') || name.includes('yearend')) return 'tax';
    if (name.includes('compliance') || name.includes('aca') || name.includes('wage')) return 'compliance';
    if (name.includes('benefits') || name.includes('sync')) return 'benefits';
    if (name.includes('analytics') || name.includes('report')) return 'reporting';
    if (name.includes('billing') || name.includes('finance')) return 'finance';
    return 'core';
  };

  // Validate access control for module
  const validateAccessControl = (module: any): boolean => {
    return module.routes.every((route: any) => 
      route.roles && route.roles.length > 0 && route.protected !== false
    );
  };

  // Mock module creation prompts
  const getModulePrompt = (moduleName: string): string => {
    const prompts: Record<string, string> = {
      'HaaLO.PayrollEngine': 'Create a comprehensive payroll processing engine with multi-company support, automated calculations, and compliance features...',
      
      'HaaLO.ACAComplianceTracker': 'Create a fully isolated module named HaaLO.ACAComplianceTracker for ACA compliance tracking and reporting...',
      'HaaLO.WageCompliance': 'Create a new HaaLO module called HaaLO.WageCompliance as the Wage & Hour Compliance Center...'
    };
    return prompts[moduleName] || 'Module creation prompt not available';
  };

  // Filter and search modules
  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || module.status === statusFilter;
      const matchesQa = qaFilter === 'all' || module.qaStatus === qaFilter;
      
      return matchesSearch && matchesStatus && matchesQa;
    });
  }, [modules, searchQuery, statusFilter, qaFilter]);

  // Group modules by functional area
  const groupedModules = useMemo(() => {
    const groups: Record<string, ModuleMetadata[]> = {};
    filteredModules.forEach(module => {
      const area = module.functionalArea;
      if (!groups[area]) groups[area] = [];
      groups[area].push(module);
    });
    return groups;
  }, [filteredModules]);

  // Status badge styling
  const getStatusBadge = (status: string, isQa: boolean = false) => {
    const baseClasses = "text-xs font-medium";
    switch (status) {
      case 'complete':
      case 'passed':
        return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          {isQa ? 'Passed' : 'Complete'}
        </Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className={`${baseClasses} bg-blue-100 text-blue-800`}>
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>;
      case 'not_started':
        return <Badge variant="outline" className={`${baseClasses} bg-gray-100 text-gray-600`}>
          <XCircle className="h-3 w-3 mr-1" />
          Not Started
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Module card component
  const ModuleCard: React.FC<{ module: ModuleMetadata }> = ({ module }) => {
    const isEditing = editingModule === module.id;
    const needsAttention = module.qaStatus === 'passed' && module.status !== 'complete';

    return (
      <Card className={`h-full transition-all duration-200 hover:shadow-lg ${needsAttention ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {module.name}
                {module.hasRouteIssues && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(module.status)}
                {getStatusBadge(module.qaStatus, true)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingModule(isEditing ? null : module.id)}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Module Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Functional Area:</span>
              <p className="text-foreground">{FUNCTIONAL_AREAS[module.functionalArea]}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Last Updated:</span>
              <p className="text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {module.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Primary Routes */}
          <div>
            <span className="font-medium text-muted-foreground flex items-center gap-1 mb-2">
              <Route className="h-4 w-4" />
              Primary Routes:
            </span>
            <div className="space-y-1">
              {module.primaryRoutes.map((route, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {route}
                </Badge>
              ))}
            </div>
          </div>

          {/* Access Control Status */}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Access Control:</span>
            <Badge variant={module.accessControlValidated ? "default" : "destructive"}>
              {module.accessControlValidated ? 'Validated' : 'Missing'}
            </Badge>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <label className="text-sm font-medium">Status:</label>
                <Select
                  value={module.status}
                  onValueChange={(value) => saveModuleData(module.id, 'status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">QA Status:</label>
                <Select
                  value={module.qaStatus}
                  onValueChange={(value) => saveModuleData(module.id, 'qaStatus', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes:</label>
                <Textarea
                  value={module.notes}
                  onChange={(e) => saveModuleData(module.id, 'notes', e.target.value)}
                  placeholder="Add development notes, QA findings, or other relevant information..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            module.notes && (
              <div className="pt-3 border-t">
                <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1">{module.notes}</p>
              </div>
            )
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Module Creation Prompt</DialogTitle>
                  <DialogDescription>
                    Original Lovable prompt used to create {module.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{module.creationPrompt}</pre>
                </div>
              </DialogContent>
            </Dialog>

            {module.status === 'complete' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveModuleData(module.id, 'status', 'in_progress')}
              >
                Reset to In Progress
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => saveModuleData(module.id, 'status', 'complete')}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Summary statistics
  const totalModules = modules.length;
  const completeModules = modules.filter(m => m.status === 'complete').length;
  const passedQaModules = modules.filter(m => m.qaStatus === 'passed').length;
  const issuesCount = modules.filter(m => m.hasRouteIssues || !m.accessControlValidated).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Module Registry Dashboard
          </h1>
          <p className="text-muted-foreground">
            Central tracking and QA hub for all HaaLO microservice modules
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completeModules}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completeModules / totalModules) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QA Passed</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{passedQaModules}</div>
            <p className="text-xs text-muted-foreground">Quality assurance completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{issuesCount}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search modules by name or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={qaFilter} onValueChange={setQaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by QA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All QA Statuses</SelectItem>
                <SelectItem value="not_started">QA Not Started</SelectItem>
                <SelectItem value="in_progress">QA In Progress</SelectItem>
                <SelectItem value="passed">QA Passed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {issuesCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {issuesCount} module(s) have issues requiring attention: broken routes or missing access control.
          </AlertDescription>
        </Alert>
      )}

      {/* Module Groups */}
      <div className="space-y-8">
        {Object.entries(groupedModules).map(([area, areaModules]) => (
          <div key={area}>
            <h2 className="text-xl font-semibold mb-4">{FUNCTIONAL_AREAS[area]}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {areaModules.map(module => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No modules found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};