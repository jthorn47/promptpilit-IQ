import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Shield, 
  DollarSign, 
  Plus,
  Users,
  TrendingUp,
  Settings,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Building2
} from 'lucide-react';

const BenefitsPage = () => {
  const benefitsStats = [
    {
      title: 'Enrolled Employees',
      value: '142',
      total: '156',
      percentage: 91,
      color: 'text-green-600',
      icon: Users,
      bgColor: 'bg-green-500'
    },
    {
      title: 'Health Plans',
      value: '4',
      description: 'Active plans',
      color: 'text-blue-600',
      icon: Heart,
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Annual Cost',
      value: '$234K',
      description: 'Total benefits cost',
      color: 'text-purple-600',
      icon: DollarSign,
      bgColor: 'bg-purple-500'
    },
    {
      title: 'Open Enrollment',
      value: '23',
      description: 'Days remaining',
      color: 'text-orange-600',
      icon: Calendar,
      bgColor: 'bg-orange-500'
    }
  ];

  const benefitPlans = [
    {
      name: 'Health Insurance',
      provider: 'Blue Cross Blue Shield',
      enrolled: 125,
      total: 156,
      cost: '$1,245/month per employee',
      status: 'Active',
      icon: Heart,
      color: 'bg-blue-500'
    },
    {
      name: 'Dental Insurance',
      provider: 'Delta Dental',
      enrolled: 98,
      total: 156,
      cost: '$89/month per employee',
      status: 'Active',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      name: 'Vision Insurance',
      provider: 'VSP',
      enrolled: 87,
      total: 156,
      cost: '$24/month per employee',
      status: 'Active',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      name: '401(k) Plan',
      provider: 'Fidelity',
      enrolled: 134,
      total: 156,
      cost: '3% company match',
      status: 'Active',
      icon: DollarSign,
      color: 'bg-indigo-500'
    },
    {
      name: 'Life Insurance',
      provider: 'MetLife',
      enrolled: 156,
      total: 156,
      cost: '$12/month per employee',
      status: 'Active',
      icon: Shield,
      color: 'bg-gray-500'
    },
    {
      name: 'Disability Insurance',
      provider: 'Unum',
      enrolled: 142,
      total: 156,
      cost: '$45/month per employee',
      status: 'Active',
      icon: Shield,
      color: 'bg-red-500'
    }
  ];

  const recentActivity = [
    {
      type: 'enrollment',
      message: 'Sarah Johnson enrolled in Health Insurance Premium Plan',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      type: 'change',
      message: 'Michael Chen updated beneficiaries for Life Insurance',
      time: '5 hours ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      type: 'alert',
      message: 'Open enrollment deadline reminder sent to 14 employees',
      time: '1 day ago',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      type: 'enrollment',
      message: 'Emily Rodriguez enrolled in Vision Insurance',
      time: '2 days ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Benefits Administration</h1>
          <p className="text-muted-foreground">
            Manage employee benefits, enrollment, and policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {benefitsStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1 rounded ${stat.bgColor} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.total && (
                  <div className="mt-2">
                    <Progress value={stat.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.percentage}% enrolled
                    </p>
                  </div>
                )}
                {stat.description && (
                  <p className={`text-xs ${stat.color}`}>{stat.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Current Benefit Plans</CardTitle>
          <CardDescription>Overview of all active benefit plans and enrollment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefitPlans.map((plan) => {
              const Icon = plan.icon;
              const enrollmentPercentage = (plan.enrolled / plan.total) * 100;
              return (
                <div key={plan.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${plan.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.provider}</p>
                      </div>
                    </div>
                    <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Enrollment</span>
                      <span>{plan.enrolled}/{plan.total} employees</span>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {enrollmentPercentage.toFixed(1)}% enrolled
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium">{plan.cost}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Manage
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest benefits enrollment and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Enrollment</CardTitle>
            <CardDescription>Manage employee enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Enrollment
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Reports</CardTitle>
            <CardDescription>Generate benefits reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Analytics</CardTitle>
            <CardDescription>Benefits usage analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Providers</CardTitle>
            <CardDescription>Manage benefit providers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Providers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BenefitsPage;