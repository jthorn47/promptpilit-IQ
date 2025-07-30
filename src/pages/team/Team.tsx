import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone, MapPin, Plus } from 'lucide-react';

export default function Team() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      email: "sarah@company.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Lead Developer",
      email: "michael@company.com", 
      phone: "+1 (555) 987-6543",
      location: "San Francisco, CA",
      status: "away",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      email: "emily@company.com",
      phone: "+1 (555) 456-7890", 
      location: "Austin, TX",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "David Kim",
      role: "Sales Manager",
      email: "david@company.com",
      phone: "+1 (555) 321-0987",
      location: "Chicago, IL", 
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <StandardPageLayout
      title="Team Overview"
      subtitle="Manage your team members and their roles"
      badge={`${teamMembers.length} Members`}
      headerActions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      }
    >
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Online Now
            </CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">Available for contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
            <Badge variant="outline">4</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Marketing • Development • Product • Sales
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
                <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{member.location}</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline">Message</Button>
                <Button size="sm" variant="outline">Call</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
}