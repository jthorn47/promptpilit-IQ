import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TimeOffPage = () => {
  const timeOffStats = [
    {
      title: 'Pending Requests',
      value: '12',
      change: '+3 from yesterday',
      color: 'text-yellow-600',
      icon: AlertCircle,
      bgColor: 'bg-yellow-500'
    },
    {
      title: 'Approved Today',
      value: '8',
      change: '67% approval rate',
      color: 'text-green-600',
      icon: CheckCircle,
      bgColor: 'bg-green-500'
    },
    {
      title: 'Total Days Off',
      value: '245',
      change: 'This month',
      color: 'text-blue-600',
      icon: Calendar,
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Coverage Status',
      value: '92%',
      change: 'Teams covered',
      color: 'text-purple-600',
      icon: Users,
      bgColor: 'bg-purple-500'
    }
  ];

  const timeOffTypes = [
    { name: 'Vacation', used: 145, total: 200, color: 'bg-blue-500' },
    { name: 'Sick Leave', used: 67, total: 120, color: 'bg-red-500' },
    { name: 'Personal', used: 23, total: 40, color: 'bg-green-500' },
    { name: 'Bereavement', used: 8, total: 15, color: 'bg-gray-500' },
    { name: 'Maternity/Paternity', used: 45, total: 60, color: 'bg-pink-500' },
    { name: 'Holiday', used: 78, total: 100, color: 'bg-orange-500' }
  ];

  const recentRequests = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      type: 'Vacation',
      startDate: '2024-02-15',
      endDate: '2024-02-19',
      days: 5,
      status: 'Pending',
      reason: 'Family vacation',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7b64b83?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 2,
      employee: 'Michael Chen',
      type: 'Sick Leave',
      startDate: '2024-02-12',
      endDate: '2024-02-12',
      days: 1,
      status: 'Approved',
      reason: 'Medical appointment',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 3,
      employee: 'Emily Rodriguez',
      type: 'Personal',
      startDate: '2024-02-20',
      endDate: '2024-02-21',
      days: 2,
      status: 'Pending',
      reason: 'Personal matters',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: 4,
      employee: 'David Kumar',
      type: 'Vacation',
      startDate: '2024-02-10',
      endDate: '2024-02-11',
      days: 2,
      status: 'Denied',
      reason: 'Short notice vacation',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Time Off Management</h1>
          <p className="text-muted-foreground">
            Manage employee time off requests and policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {timeOffStats.map((stat) => {
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
                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Time Off Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Time Off Usage by Type</CardTitle>
          <CardDescription>Current usage vs. available days for each leave type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeOffTypes.map((type) => {
              const percentage = (type.used / type.total) * 100;
              return (
                <div key={type.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {type.used}/{type.total} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${type.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% used
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Time Off Requests</CardTitle>
              <CardDescription>Latest requests requiring your attention</CardDescription>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.avatar} alt={request.employee} />
                    <AvatarFallback>{request.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.employee}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{request.type}</span> • 
                      {request.startDate === request.endDate 
                        ? ` ${request.startDate}`
                        : ` ${request.startDate} to ${request.endDate}`
                      } • {request.days} day{request.days > 1 ? 's' : ''}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {request.status === 'Pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </>
                  )}
                  {request.status !== 'Pending' && (
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Calendar View</CardTitle>
            <CardDescription>View time off in calendar format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Open Calendar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Policies</CardTitle>
            <CardDescription>Manage time off policies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Policies
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Analytics</CardTitle>
            <CardDescription>Time off trends and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Team Coverage</CardTitle>
            <CardDescription>Check team availability</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Check Coverage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeOffPage;