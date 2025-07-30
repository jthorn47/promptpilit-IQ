import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Clock, 
  Target,
  TrendingUp,
  Plus,
  Eye,
  Search
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

interface RecruiterDashboardProps {
  userRole: StaffingUserRole;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ userRole }) => {
  // Mock data for now - will be replaced with real data later
  const recruiterStats = [
    {
      title: 'Assigned Job Orders',
      value: '15',
      change: '+3 this week',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Candidates',
      value: '42',
      change: '+8 new submittals',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Placements This Month',
      value: '8',
      change: '+2 vs last month',
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Commission Earned',
      value: '$3,250',
      change: 'This month',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const jobOrders = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      client: 'Tech Solutions Inc',
      payRate: '$45/hr',
      status: 'Open',
      candidates: 3,
      priority: 'High'
    },
    {
      id: '2',
      title: 'Project Manager',
      client: 'Construction Corp',
      payRate: '$38/hr',
      status: 'Open',
      candidates: 1,
      priority: 'Medium'
    },
    {
      id: '3',
      title: 'Administrative Assistant',
      client: 'Healthcare Group',
      payRate: '$18/hr',
      status: 'Pending',
      candidates: 0,
      priority: 'Low'
    }
  ];

  const candidatePipeline = [
    {
      stage: 'New Applications',
      count: 12,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      stage: 'Under Review',
      count: 8,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      stage: 'Interview Scheduled',
      count: 5,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      stage: 'Ready to Place',
      count: 3,
      color: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recruiterStats.map((stat, index) => {
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

      {/* Candidate Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Candidate Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {candidatePipeline.map((stage, index) => (
              <div key={stage.stage} className="text-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stage.count}</div>
                <Badge className={stage.color}>{stage.stage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Job Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Assigned Job Orders
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobOrders.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    <Badge className={
                      job.priority === 'High' ? 'bg-red-100 text-red-800' :
                      job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {job.priority}
                    </Badge>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Client: {job.client}</p>
                  <p className="text-sm text-gray-600">Pay Rate: {job.payRate}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">{job.candidates}</div>
                  <div className="text-xs text-gray-500">Candidates</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Plus className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              Add Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Submit new candidates to your assigned job orders.
            </p>
            <Button className="w-full">
              Add Candidate
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <Search className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
              Search Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Find and manage your candidate database.
            </p>
            <Button className="w-full" variant="outline">
              Search Database
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <Target className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
              Track Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Monitor your recruitment activity and performance.
            </p>
            <Button className="w-full" variant="outline">
              View Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};