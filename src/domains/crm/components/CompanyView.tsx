import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Mail, Phone, Globe, MapPin, Plus, Edit } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';
import { useCrmContacts } from '../hooks/useCrmContacts';
import { useCrmOpportunities } from '../hooks/useCrmOpportunities';
import { useCrmTasks } from '../hooks/useCrmTasks';

interface CompanyViewProps {
  companyId: string;
}

export function CompanyView({ companyId }: CompanyViewProps) {
  const { data: company, isLoading: companyLoading } = useCompanySettings(companyId);
  const { data: contacts, isLoading: contactsLoading } = useCrmContacts({ companyId });
  const { data: opportunities, isLoading: opportunitiesLoading } = useCrmOpportunities({ companyId });
  const { data: tasks, isLoading: tasksLoading } = useCrmTasks({ companyId });

  if (companyLoading) {
    return <div className="flex items-center justify-center h-64">Loading company details...</div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center h-64">Company not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Company Header */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{company.company_name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Company ID: {company.id.substring(0, 8)}...
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Industry</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{company.industry || 'Not specified'}</p>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {[company.city, company.state, company.country].filter(Boolean).join(', ') || 'Not specified'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Account Manager</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{company.account_manager || 'Not provided'}</p>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Phone</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{company.primary_contact_phone || 'Not provided'}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Website</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{company.website || 'Not provided'}</p>

            <div className="space-y-2">
              <span className="text-sm font-medium">Status</span>
              <div className="flex gap-2">
              <Badge variant="outline">{company.lifecycle_stage || 'Active'}</Badge>
              <Badge variant="secondary">{company.service_type || 'Prospect'}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities ({opportunities?.length || 0})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.business_description && (
                  <div>
                    <h4 className="font-medium mb-2">Business Description</h4>
                    <p className="text-sm text-muted-foreground">{company.business_description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Lead Source</p>
                    <p className="text-muted-foreground">{company.lead_source || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Employee Count</p>
                    <p className="text-muted-foreground">{company.employee_count || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Annual Revenue</p>
                    <p className="text-muted-foreground">
                      {company.annual_revenue ? `$${company.annual_revenue.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Activity</p>
                    <p className="text-muted-foreground">
                      {company.last_activity_date 
                        ? new Date(company.last_activity_date).toLocaleDateString()
                        : 'No recent activity'
                      }
                    </p>
                  </div>
                </div>

                {company.industry && (
                  <div>
                    <h4 className="font-medium mb-2">Industry</h4>
                    <Badge variant="outline">{company.industry}</Badge>
                  </div>
                )}

                {company.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{company.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Company Contacts</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
          
          <div className="grid gap-4">
            {contactsLoading ? (
              <div>Loading contacts...</div>
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {contact.first_name?.[0]}{contact.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={contact.is_primary_contact ? 'default' : 'secondary'}>
                        {contact.is_primary_contact ? 'Primary' : 'Secondary'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No contacts found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Opportunities</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </div>
          
          <div className="grid gap-4">
            {opportunitiesLoading ? (
              <div>Loading opportunities...</div>
            ) : opportunities && opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{opportunity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {opportunity.deal_value ? `$${opportunity.deal_value.toLocaleString()}` : 'Not specified'}
                        </p>
                        <Badge className="mt-1" variant="outline">
                          {opportunity.stage?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No opportunities found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tasks</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          <div className="grid gap-4">
            {tasksLoading ? (
              <div>Loading tasks...</div>
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {task.priority && (
                            <Badge variant="outline">{task.priority}</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}