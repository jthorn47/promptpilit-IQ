import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart3, Users, BookOpen, Shield, Building2, TrendingUp, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const EaseworksStaffingPage = () => {
  const staffingSections = [
    {
      title: 'CRM',
      description: 'Manage client relationships, leads, and sales pipeline',
      href: '/admin/crm',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      stats: '1,247 Leads'
    },
    {
      title: 'EaseLearn LMS',
      description: 'Comprehensive learning management for staff training',
      href: '/admin/training-modules',
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      stats: '156 Modules'
    },
    {
      title: 'Consulting Services',
      description: 'Assessment tools and strategic consulting services',
      href: '/admin/assessments',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      stats: '89 Assessments'
    },
    {
      title: 'Client Management',
      description: 'Comprehensive client portfolio and subscription management',
      href: '/admin/client-companies',
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      stats: '234 Clients'
    },
    {
      title: 'Analytics',
      description: 'Advanced platform analytics and business intelligence',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      stats: '12 Reports'
    }
  ];

  const quickStats = [
    { label: 'Active Placements', value: '1,247', trend: '+12%', icon: Users },
    { label: 'Client Satisfaction', value: '98.5%', trend: '+2.1%', icon: TrendingUp },
    { label: 'Revenue Growth', value: '$2.4M', trend: '+18%', icon: Zap },
    { label: 'Compliance Rate', value: '99.2%', trend: '+0.8%', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Easeworks Staffing</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Comprehensive staffing solutions and client management platform designed to streamline operations and drive growth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staffingSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={section.href} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.color}`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {section.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {section.stats}
                      </span>
                      <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                        Explore →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Direct Dashboard Access */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Access Your Dashboard</h3>
              <p className="text-indigo-100 mb-6">
                Get direct access to your role-specific dashboard for POPs, Recruiters, or Admins.
              </p>
              <Link to="/admin/staffing/dashboard">
                <Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Users className="w-5 h-5 mr-2" />
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA Section */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">Ready to optimize your staffing operations?</h3>
              <p className="text-gray-300 mb-6">
                Leverage our comprehensive platform to streamline your processes, enhance client relationships, and drive measurable growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/admin/analytics" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  View Analytics
                </Link>
                <Link to="/admin/settings" className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Configure Settings
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EaseworksStaffingPage;