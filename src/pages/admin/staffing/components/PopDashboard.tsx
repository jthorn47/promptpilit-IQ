import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Plus,
  Eye,
  Target
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

interface PopDashboardProps {
  userRole: StaffingUserRole;
}

export const PopDashboard: React.FC<PopDashboardProps> = ({ userRole }) => {
  // Mock data for now - will be replaced with real data later
  const popStats = [
    {
      title: 'Active Clients',
      value: '12',
      change: '+3 this month',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Open Job Orders',
      value: '28',
      change: '+8 this week',
      icon: Briefcase,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Monthly Gross Profit',
      value: '$24,580',
      change: '+15% vs last month',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Commission Rate',
      value: `${userRole.commission_rate}%`,
      change: 'Your rate',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentActivity = [
    {
      type: 'client',
      message: 'New client "Tech Solutions Inc" approved',
      time: '2 hours ago',
      status: 'success'
    },
    {
      type: 'job',
      message: 'Job order "Senior Developer" posted',
      time: '4 hours ago',
      status: 'info'
    },
    {
      type: 'placement',
      message: 'Candidate placed at Manufacturing Corp',
      time: '1 day ago',
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Territory Info */}
      {userRole.territory && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Territory: {userRole.territory.name}
                  </h3>
                  <p className="text-gray-600">
                    Covering: {userRole.territory.cities.join(', ')}
                  </p>
                  <Badge 
                    className={userRole.territory.is_locked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {userRole.territory.is_locked ? 'Territory Locked' : 'Territory Open'}
                  </Badge>
                </div>
              </div>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Territory Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {popStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xs text-emerald-600 font-medium">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => window.location.href = '/admin/staffing/client-form'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Plus className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              Add New Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Submit a new client for approval and start building your portfolio.
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/admin/staffing/client-form'}>
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
              Create Job Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Post new job orders for your approved clients and get candidates.
            </p>
            <Button className="w-full" variant="outline">
              Create Order
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <DollarSign className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
              Commission Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Track your earnings and commission payments in real-time.
            </p>
            <Button className="w-full" variant="outline">
              View Earnings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 
                  activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};