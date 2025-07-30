import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalJobTitles } from '@/modules/jobtitles';
import { JobDescriptionTemplatesManager } from '@/domains/hr/components/JobDescriptionTemplatesManager';

const GlobalJobTitlesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="job-titles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="job-titles">Job Titles</TabsTrigger>
          <TabsTrigger value="templates">Description Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="job-titles" className="space-y-6">
          <GlobalJobTitles />
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <JobDescriptionTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalJobTitlesPage;