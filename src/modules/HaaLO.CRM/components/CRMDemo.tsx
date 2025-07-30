/**
 * CRM Demo Component
 * Simple component to verify dynamic module routing is working
 */

import React from 'react';
import { Users, TrendingUp, Mail, Activity, BarChart3, FileText, Send, Building, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CRMDemo: React.FC = () => {
  const stats = [
    { name: 'Total Leads', value: '2,451', icon: Users, change: '+4.75%' },
    { name: 'Active Deals', value: '89', icon: TrendingUp, change: '+54.02%' },
    { name: 'Email Campaigns', value: '24', icon: Mail, change: '-1.39%' },
    { name: 'Activities', value: '573', icon: Activity, change: '+10.18%' },
  ];

  return (
    <div className="p-6">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">CRM Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the modular CRM system - dynamically loaded via module registry
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">
                      {item.value}
                    </div>
                    <div className={`ml-2 text-sm font-medium ${
                      item.change.startsWith('+') 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {item.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CRM Navigation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link 
          to="/admin/crm/dashboard" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Dashboard</h3>
              <p className="text-sm text-muted-foreground">View CRM analytics</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/leads" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Leads</h3>
              <p className="text-sm text-muted-foreground">Manage potential customers</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/deals" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Deals</h3>
              <p className="text-sm text-muted-foreground">Track sales opportunities</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/companies" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Companies</h3>
              <p className="text-sm text-muted-foreground">Manage company profiles and relationships</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/activities" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Activities</h3>
              <p className="text-sm text-muted-foreground">Track interactions</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/email-templates" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Email Templates</h3>
              <p className="text-sm text-muted-foreground">Manage email templates</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/crm/email-campaigns" 
          className="bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center">
            <Send className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-medium text-foreground">Email Campaigns</h3>
              <p className="text-sm text-muted-foreground">Run email campaigns</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          🎉 Modular Architecture Success!
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>CRM module successfully loaded via dynamic registry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Route isolation and tenant-level access control implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Legacy static routes removed and replaced with dynamic loading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Ready for Phase 2: Complete module isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};