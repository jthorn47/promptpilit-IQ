import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalOrgStructure } from '../components/GlobalOrgStructure';
import { ClientOrgStructure } from '../components/ClientOrgStructure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, Users } from 'lucide-react';

export const OrgStructurePage = () => {
  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Organization Structure Management</h1>
          <p className="text-muted-foreground">
            Manage locations, divisions, and departments across all clients
          </p>
        </div>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global Templates
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Structures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Organization Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <GlobalOrgStructure />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Organization Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOrgStructure />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};