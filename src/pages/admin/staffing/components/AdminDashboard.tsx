import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Settings,
  UserPlus,
  BarChart3,
  Shield,
  Building2,
  Target,
  Eye,
  Plus
} from 'lucide-react';

interface StaffingUserRole {
  id: string;
  role: 'pop' | 'recruiter' | 'admin';
  territory_id: string | null;
  commission_rate: number;
  is_active: boolean;
  territory?: {
    name: string;
    state: string;
    cities: string[];
    is_locked: boolean;
  };
}

interface AdminDashboardProps {
  userRole: StaffingUserRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  // Mock data for now - will be replaced with real data later
  const platformStats = [
    {
      title: 'Total POPs',
      value: '47',
      change: '+5 this month',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Recruiters',
      value: '23',
      change: '+3 this week',
      icon: UserPlus,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Total Revenue',
      value: '$124,500',
      change: '+18% vs last month',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Territories Locked',
      value: '8/12',
      change: '4 available',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const territories = [
    { name: 'Los Angeles Metro', state: 'CA', status: 'Locked', pop: 'John Smith' },
    { name: 'San Francisco Bay Area', state: 'CA', status: 'Locked', pop: 'Sarah Johnson' },
    { name: 'Orange County', state: 'CA', status: 'Available', pop: null },
    { name: 'San Diego County', state: 'CA', status: 'Locked', pop: 'Mike Davis' },
    { name: 'Dallas-Fort Worth', state: 'TX', status: 'Available', pop: null }
  ];

  const recentActions = [
    {
      type: 'approval',
      message: 'Client "Tech Solutions Inc" approved for John Smith',
      time: '2 hours ago',
      status: 'success'
    },
    {
      type: 'user',
      message: 'New POP application from "Jane Wilson"',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      type: 'territory',
      message: 'Territory "Houston Metro" assigned to Mike Davis',
      time: '1 day ago',
      status: 'info'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 leading-tight">{stat.title}</p>
                  <p className="text-xs text-emerald-600 font-medium">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Territory Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Territory Overview
            </CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage Territories
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {territories.map((territory, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{territory.name}</h4>
                  <p className="text-sm text-gray-600">{territory.state}</p>
                  {territory.pop && (
                    <p className="text-xs text-blue-600">Assigned to: {territory.pop}</p>
                  )}
                </div>
                <Badge className={
                  territory.status === 'Locked' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {territory.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <UserPlus className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors">
              Manage Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              Add, edit, and manage POPs and recruiters.
            </p>
            <Button className="w-full text-sm">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <CardTitle className="text-base sm:text-lg group-hover:text-emerald-600 transition-colors">
              Client Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              Review and approve client applications.
            </p>
            <Button className="w-full text-sm" variant="outline">
              Review Clients
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <CardTitle className="text-base sm:text-lg group-hover:text-purple-600 transition-colors">
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              View platform performance and reports.
            </p>
            <Button className="w-full text-sm" variant="outline">
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <CardTitle className="text-base sm:text-lg group-hover:text-orange-600 transition-colors">
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              Configure commission rates and settings.
            </p>
            <Button className="w-full text-sm" variant="outline">
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recent Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  action.status === 'success' ? 'bg-green-500' : 
                  action.status === 'pending' ? 'bg-yellow-500' : 
                  action.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.message}</p>
                  <p className="text-xs text-gray-500">{action.time}</p>
                </div>
                {action.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};