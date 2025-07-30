import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Copy,
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  Bell, 
  Brain, 
  Scale, 
  Settings,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Users
} from "lucide-react";
import { usePulseCases } from '../hooks/usePulseCases';

interface PulseModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  color: string;
}

export const PulseMainDashboard = () => {
  const navigate = useNavigate();
  const { statistics, loading, refetch } = usePulseCases();

  const pulseModules: PulseModule[] = [
    {
      id: 'cases',
      title: 'Cases',
      description: 'Manage and track all HR cases and incidents',
      icon: FileText,
      path: '/admin/pulse/cases',
      badge: `${statistics?.total || 0} Cases`,
      color: 'blue'
    },
    {
      id: 'templates',
      title: 'Case Templates',
      description: 'Create and manage case templates for consistency',
      icon: Copy,
      path: '/admin/pulse/templates',
      color: 'purple'
    },
    {
      id: 'documents',
      title: 'Documents & Evidence',
      description: 'Store and organize case-related documents',
      icon: FolderOpen,
      path: '/admin/pulse/documents',
      color: 'green'
    },
    {
      id: 'tasks',
      title: 'Task Tracker',
      description: 'Track tasks and action items across cases',
      icon: CheckSquare,
      path: '/admin/pulse/tasks',
      badge: `${statistics?.inProgress || 0} Active`,
      color: 'orange'
    },
    {
      id: 'reports',
      title: 'Reporting & Compliance',
      description: 'Generate reports and ensure compliance',
      icon: BarChart3,
      path: '/admin/pulse/reports',
      color: 'indigo'
    },
    {
      id: 'alerts',
      title: 'Alerts & Triggers',
      description: 'Set up automated alerts and notifications',
      icon: Bell,
      path: '/admin/pulse/alerts',
      color: 'red'
    },
    {
      id: 'insights',
      title: 'Case Insights',
      description: 'Analytics and insights from case data',
      icon: Brain,
      path: '/admin/pulse/insights',
      color: 'cyan'
    },
    {
      id: 'legal',
      title: 'Legal Review',
      description: 'Legal review and compliance tracking',
      icon: Scale,
      path: '/admin/pulse/legal',
      color: 'slate'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure Pulse CMS preferences and workflows',
      icon: Settings,
      path: '/admin/pulse/settings',
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700',
      green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700',
      orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700',
      indigo: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
      red: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700',
      cyan: 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700',
      slate: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700',
      gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColorClasses = (color: string) => {
    const iconColorMap = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      indigo: 'text-indigo-600',
      red: 'text-red-600',
      cyan: 'text-cyan-600',
      slate: 'text-slate-600',
      gray: 'text-gray-600'
    };
    return iconColorMap[color as keyof typeof iconColorMap] || iconColorMap.blue;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const openCases = statistics?.open || 0;
  const inProgressCases = statistics?.inProgress || 0;
  const closedCases = statistics?.closed || 0;
  const totalHours = statistics?.totalHours || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pulse CMS</h1>
          <p className="text-muted-foreground">Case management and workflow system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refetch}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/admin/pulse/cases')}
          >
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All cases in system
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openCases}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCases}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Time logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Pulse Modules</h2>
            <p className="text-muted-foreground">Access all Pulse CMS features and tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pulseModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${getColorClasses(module.color)}`}
                onClick={() => navigate(module.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/50">
                        <Icon className={`h-6 w-6 ${getIconColorClasses(module.color)}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
                        {module.badge && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/pulse/cases')}
            >
              <Plus className="h-4 w-4" />
              Create New Case
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/pulse/templates')}
            >
              <Copy className="h-4 w-4" />
              Browse Templates
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/pulse/reports')}
            >
              <BarChart3 className="h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">System Status</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Active Users</span>
              </div>
              <span className="text-sm font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Pending Tasks</span>
              </div>
              <span className="text-sm font-medium">{inProgressCases}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};